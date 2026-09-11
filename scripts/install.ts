import {
  lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync,
  realpathSync, statSync, symlinkSync, unlinkSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { parseDocument } from 'yaml';

type Locations = { repo: string; home: string; codexHome: string };
type Link = { path: string; target: string };
type Change = { kind: 'link'; link: Link } | { kind: 'remove'; path: string };

function fileInfo(path: string, follow = false) {
  try {
    return follow ? statSync(path) : lstatSync(path);
  } catch (error) {
    if (error instanceof Error && 'code' in error
      && ['ENOENT', 'ENOTDIR', 'ELOOP'].includes(String(error.code))) return undefined;
    throw error;
  }
}

function fail(errors: string[]) {
  if (errors.length) throw new Error(errors.join('\n'));
}

function nonemptyFile(path: string) {
  return fileInfo(path)?.isFile() && readFileSync(path, 'utf8').trim().length > 0;
}

export function validateRepo(repo: string) {
  const errors: string[] = [];
  const skills: { name: string; path: string }[] = [];
  const directoryNames = new Map<string, string>();
  const declaredNames = new Map<string, string>();
  const root = join(repo, 'globals/skills');
  const instructions = join(repo, 'globals/AGENTS.md');
  if (!nonemptyFile(instructions)) errors.push(`${instructions}: expected a nonempty regular file.`);

  function unique(names: Map<string, string>, name: string, path: string, label: string) {
    const key = name.toLowerCase();
    const previous = names.get(key);
    if (previous) errors.push(`Duplicate ${label} "${name}": ${previous} and ${path}`);
    else names.set(key, path);
  }

  function visit(path: string) {
    if (!fileInfo(path)?.isDirectory()) {
      errors.push(`${path}: expected a real directory, not a symlink.`);
      return;
    }
    const entries = readdirSync(path, { withFileTypes: true });
    const skillFile = entries.find(entry => entry.name.toLowerCase() === 'skill.md');
    if (skillFile) {
      const source = join(path, skillFile.name);
      if (path === root) errors.push(`${root}: put skills in their own directories.`);
      if (skillFile.name !== 'SKILL.md' || !skillFile.isFile()) {
        errors.push(`${source}: must be a regular file named SKILL.md.`);
        return;
      }
      const folderName = basename(path);
      unique(directoryNames, folderName, path, 'skill directory name');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folderName) || folderName.length > 64) {
        errors.push(`${path}: skill names must use lowercase letters, numbers and single hyphens, up to 64 characters.`);
      }
      if (folderName.toLowerCase() === 'synced') errors.push(`${path}: "synced" is reserved by Claude Code.`);
      const content = readFileSync(source, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
      const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(content);
      if (!frontmatter) {
        errors.push(`${source}: expected YAML frontmatter with name and description.`);
        return;
      }
      const document = parseDocument(frontmatter[1]);
      for (const issue of [...document.errors, ...document.warnings]) errors.push(`${source}: ${issue.message}`);
      const name: unknown = document.get('name');
      const description: unknown = document.get('description');
      if (typeof name !== 'string' || !name.trim()) {
        errors.push(`${source}: name must be a nonempty string.`);
      } else {
        unique(declaredNames, name, source, 'skill name');
        if (name !== folderName) errors.push(`${source}: name "${name}" must match directory "${folderName}".`);
      }
      if (typeof description !== 'string' || !description.trim()) errors.push(`${source}: description must be a nonempty string.`);
      if (!content.slice(frontmatter[0].length).trim()) errors.push(`${source}: skill instructions are empty.`);
      skills.push({ name: folderName, path });
      return; // Supporting directories belong to this skill, not to the installation list.
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) errors.push(`${join(path, entry.name)}: keep source files here rather than symlinks.`);
      else if (entry.isDirectory()) visit(join(path, entry.name));
    }
  }

  visit(root);
  fail(errors);
  return { instructions, skills };
}

function pointsInside(path: string, root: string) {
  const child = relative(root, path);
  return child === '' || (!isAbsolute(child) && child !== '..' && !child.startsWith(`..${sep}`));
}

function linkTarget(path: string) {
  return resolve(dirname(path), readlinkSync(path));
}

export function planSetup(locations: Locations) {
  const { repo, home, codexHome } = locations;
  const { instructions, skills } = validateRepo(repo);
  const skillDirectories = [join(home, '.agents/skills'), join(home, '.claude/skills')];
  const expected: Link[] = [
    { path: join(codexHome, 'AGENTS.md'), target: instructions },
    { path: join(home, '.claude/CLAUDE.md'), target: instructions },
    ...skillDirectories.flatMap(directory => skills.map(skill => ({ path: join(directory, skill.name), target: skill.path }))),
  ];
  const errors: string[] = [];
  const changes: Change[] = [];
  const override = join(codexHome, 'AGENTS.override.md');
  if (fileInfo(override, true)?.isFile() && readFileSync(override, 'utf8').trim()) {
    errors.push(`${override}: overrides the shared global instructions; resolve it before installing.`);
  }
  // Preflight all parent directories before any mutation, including configurations with no skills yet.
  for (const directory of new Set([...skillDirectories, ...expected.map(link => dirname(link.path))])) {
    let ancestor = directory;
    while (!fileInfo(ancestor) && dirname(ancestor) !== ancestor) ancestor = dirname(ancestor);
    if (!fileInfo(ancestor, true)?.isDirectory()) errors.push(`${ancestor}: expected a directory.`);
    if (fileInfo(directory)?.isSymbolicLink()) errors.push(`${directory}: expected a real configuration directory, not a symlink.`);
  }
  for (const link of expected) {
    const current = fileInfo(link.path);
    if (current?.isSymbolicLink()) {
      if (linkTarget(link.path) === link.target) continue;
      changes.push({ kind: 'remove', path: link.path });
    } else if (current) {
      const emptyGlobal = link.target === instructions && current.isFile() && current.size === 0;
      if (!emptyGlobal) {
        errors.push(`${link.path}: a real file or directory is in the way; move it into the repo or elsewhere first.`);
        continue;
      }
      changes.push({ kind: 'remove', path: link.path });
    }
    changes.push({ kind: 'link', link });
  }
  const expectedPaths = new Set(expected.map(link => link.path));
  for (const directory of skillDirectories) {
    if (!fileInfo(directory)?.isDirectory()) continue;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (!entry.isSymbolicLink() || expectedPaths.has(path)) continue;
      const target = linkTarget(path);
      const validSkill = fileInfo(path, true)?.isDirectory() && fileInfo(join(path, 'SKILL.md'), true)?.isFile();
      if (!validSkill || pointsInside(target, repo)) changes.push({ kind: 'remove', path });
    }
  }
  fail(errors);
  return { changes, skillCount: skills.length };
}

export function applySetup(locations: Locations) {
  const plan = planSetup(locations);
  for (const change of plan.changes) {
    if (change.kind === 'remove') unlinkSync(change.path);
    else {
      mkdirSync(dirname(change.link.path), { recursive: true });
      symlinkSync(change.link.target, change.link.path);
    }
  }
  const remaining = planSetup(locations);
  if (remaining.changes.length) throw new Error('Installation did not converge; run pnpm check to inspect the remaining changes.');
  return plan;
}

if (import.meta.main) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args[0] && !['--check', '--validate', '--help'].includes(args[0]))) {
      throw new Error('Usage: pnpm setup | pnpm check | pnpm validate');
    }
    if (args[0] === '--help') {
      console.log('pnpm setup     Validate and install links, removing invalid or obsolete skill links.\npnpm check     Validate and show needed changes without modifying files.\npnpm validate  Validate only the repository.');
    } else {
      const repo = realpathSync(join(import.meta.dirname, '..'));
      const home = homedir();
      const locations = { repo, home, codexHome: resolve(process.env.CODEX_HOME || join(home, '.codex')) };
      const validated = validateRepo(repo);
      console.log(`Repository valid: ${validated.skills.length} skills.`);
      if (args[0] !== '--validate') {
        const plan = planSetup(locations);
        for (const change of plan.changes) {
          console.log(change.kind === 'remove' ? `Remove ${change.path}` : `Link ${change.link.path} -> ${change.link.target}`);
        }
        if (args[0] === '--check') {
          console.log(plan.changes.length ? 'Run pnpm setup to apply these changes.' : 'All links are correct.');
          process.exitCode = plan.changes.length ? 1 : 0;
        } else {
          applySetup(locations);
          console.log(`Setup verified for Codex and Claude Code (${plan.skillCount} skills from this repo).`);
        }
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
