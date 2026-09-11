import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { test, type TestContext } from 'node:test';
import { applySetup, planSetup, validateRepo } from './install.ts';

function write(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function link(target: string, path: string) {
  mkdirSync(dirname(path), { recursive: true });
  symlinkSync(target, path);
}

function fixture(t: TestContext) {
  const temp = mkdtempSync(join(tmpdir(), 'agent-installer-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const repo = join(temp, 'repo');
  const home = join(temp, 'home');
  const locations = { repo, home, codexHome: join(home, '.codex') };
  write(join(repo, 'globals/AGENTS.md'), 'Shared preferences\n');
  mkdirSync(join(repo, 'globals/skills'), { recursive: true });
  function skill(path: string, name = basename(path)) {
    const directory = join(repo, 'globals/skills', path);
    write(join(directory, 'SKILL.md'), `---\nname: ${name}\ndescription: |\n  A useful workflow.\n---\nInstructions\n`);
    return directory;
  }
  function group(path: string) {
    write(join(repo, 'globals/skills', path, 'README.md'), 'About this group\n');
  }
  return { ...locations, temp, locations, skill, group };
}

test('installs flat and nested skills for both agents, with live edits and an idempotent rerun', t => {
  const f = fixture(t);
  const personal = f.skill('writing');
  f.group('collection');
  const grouped = f.skill('collection/engineering/tdd');
  write(join(grouped, 'references/example/SKILL.md'), 'Supporting example, not an installed skill');
  write(join(f.repo, 'scratch/draft/SKILL.md'), 'Not installed');
  write(join(f.codexHome, 'AGENTS.md'), '');
  write(join(f.home, '.claude/CLAUDE.md'), '');

  assert.equal(applySetup(f.locations).skillCount, 2);
  for (const directory of ['.agents/skills', '.claude/skills']) {
    assert.equal(readlinkSync(join(f.home, directory, 'writing')), personal);
    assert.equal(readlinkSync(join(f.home, directory, 'tdd')), grouped);
    assert.equal(lstatSync(join(f.home, directory, 'collection'), { throwIfNoEntry: false }), undefined);
    assert.equal(lstatSync(join(f.home, directory, 'example'), { throwIfNoEntry: false }), undefined);
    assert.equal(lstatSync(join(f.home, directory, 'draft'), { throwIfNoEntry: false }), undefined);
  }
  write(join(f.repo, 'globals/AGENTS.md'), 'Updated preferences');
  assert.equal(readFileSync(join(f.home, '.claude/CLAUDE.md'), 'utf8'), 'Updated preferences');
  assert.equal(readFileSync(join(f.codexHome, 'AGENTS.md'), 'utf8'), 'Updated preferences');
  assert.deepEqual(applySetup(f.locations).changes, []);
});

test('rejects duplicate directory and declared names across root and groups before changing links', t => {
  const f = fixture(t);
  f.skill('tdd');
  f.group('collection');
  f.skill('collection/tdd');
  link('/missing-target', join(f.home, '.claude/skills/broken'));
  assert.throws(() => applySetup(f.locations), /Duplicate skill directory name "tdd"[\s\S]*Duplicate skill name "tdd"/);
  assert.equal(readlinkSync(join(f.home, '.claude/skills/broken')), '/missing-target');
  assert.equal(lstatSync(join(f.codexHome, 'AGENTS.md'), { throwIfNoEntry: false }), undefined);
});

test('rejects duplicate names inside one group even when directories differ', t => {
  const f = fixture(t);
  f.group('collection');
  f.skill('collection/first', 'shared');
  f.skill('collection/second', 'shared');
  assert.throws(() => validateRepo(f.repo), /Duplicate skill name "shared"/);
});

test('reports malformed metadata, wrong names, and empty instructions', t => {
  const f = fixture(t);
  const first = f.skill('group/first', 'different');
  write(join(first, 'SKILL.md'), '---\nname: different\ndescription: 42\n---\n');
  const second = f.skill('second');
  write(join(second, 'SKILL.md'), '---\nname: second\nname: second\ndescription: test\n---\nBody');
  f.skill('Bad-Name');
  f.skill('synced');
  assert.throws(() => validateRepo(f.repo), error => {
    assert.ok(error instanceof Error);
    for (const message of ['must match directory', 'description must be', 'instructions are empty', 'Map keys must be unique', 'lowercase', 'reserved']) {
      assert.ok(error.message.includes(message), error.message);
    }
    return true;
  });
});

test('requires exact SKILL.md casing and real source directories', t => {
  const f = fixture(t);
  write(join(f.repo, 'globals/skills/wrong/SKILL.MD'), 'Wrong case');
  link(join(f.temp, 'outside'), join(f.repo, 'globals/skills/external'));
  assert.throws(() => validateRepo(f.repo), /symlinks[\s\S]*regular file named SKILL.md|regular file named SKILL.md[\s\S]*symlinks/);
});

test('cleans dangling, cyclic, invalid and obsolete links, preserving real folders and valid external skills', t => {
  const f = fixture(t);
  const external = join(f.temp, 'external');
  write(join(external, 'SKILL.md'), 'External skill');
  write(join(f.repo, 'scratch/retired/SKILL.md'), 'Retired skill');
  write(join(f.temp, 'plain-file'), 'Not a skill');
  for (const directory of ['.agents/skills', '.claude/skills']) {
    const root = join(f.home, directory);
    link(join(f.temp, 'missing'), join(root, 'broken'));
    link('cycle', join(root, 'cycle'));
    link(join(f.temp, 'plain-file'), join(root, 'invalid'));
    link(join(f.repo, 'scratch/retired'), join(root, 'retired'));
    link(external, join(root, 'external'));
    write(join(root, 'local/SKILL.md'), 'Keep local');
  }
  const preview = planSetup(f.locations);
  assert.ok(preview.changes.length);
  assert.ok(lstatSync(join(f.home, '.agents/skills/broken')).isSymbolicLink());
  applySetup(f.locations);
  for (const directory of ['.agents/skills', '.claude/skills']) {
    for (const name of ['broken', 'cycle', 'invalid', 'retired']) {
      assert.equal(lstatSync(join(f.home, directory, name), { throwIfNoEntry: false }), undefined);
    }
    assert.equal(readlinkSync(join(f.home, directory, 'external')), external);
    assert.equal(readFileSync(join(f.home, directory, 'local/SKILL.md'), 'utf8'), 'Keep local');
  }
});

test('real destination files block all changes, including cleanup', t => {
  const f = fixture(t);
  f.skill('tdd');
  write(join(f.home, '.agents/skills/tdd/SKILL.md'), 'Existing skill');
  write(join(f.home, '.claude/CLAUDE.md'), 'Existing preferences');
  link('/missing', join(f.home, '.claude/skills/broken'));
  assert.throws(() => applySetup(f.locations), /real file or directory is in the way/);
  assert.equal(readFileSync(join(f.home, '.agents/skills/tdd/SKILL.md'), 'utf8'), 'Existing skill');
  assert.equal(readFileSync(join(f.home, '.claude/CLAUDE.md'), 'utf8'), 'Existing preferences');
  assert.equal(readlinkSync(join(f.home, '.claude/skills/broken')), '/missing');
  assert.equal(lstatSync(join(f.codexHome, 'AGENTS.md'), { throwIfNoEntry: false }), undefined);
});

test('updates incorrect symlinks and accepts equivalent relative links', t => {
  const f = fixture(t);
  const source = f.skill('tdd');
  const codex = join(f.home, '.agents/skills/tdd');
  link(relative(dirname(codex), source), codex);
  link('/previous-target', join(f.home, '.claude/skills/tdd'));
  applySetup(f.locations);
  assert.equal(readlinkSync(codex), relative(dirname(codex), source));
  assert.equal(readlinkSync(join(f.home, '.claude/skills/tdd')), source);
});

test('handles a relocated repo and renamed skills', t => {
  const f = fixture(t);
  f.skill('old-name');
  applySetup(f.locations);
  const movedRepo = join(f.temp, 'moved-repo');
  renameSync(f.repo, movedRepo);
  rmSync(join(movedRepo, 'globals/skills/old-name'), { recursive: true });
  write(join(movedRepo, 'globals/skills/new-name/SKILL.md'), '---\nname: new-name\ndescription: Useful\n---\nInstructions');
  applySetup({ ...f.locations, repo: movedRepo });
  assert.equal(lstatSync(join(f.home, '.agents/skills/old-name'), { throwIfNoEntry: false }), undefined);
  assert.equal(readlinkSync(join(f.home, '.claude/skills/new-name')), join(movedRepo, 'globals/skills/new-name'));
});

test('respects a custom Codex home and rejects an active global override', t => {
  const f = fixture(t);
  const locations = { ...f.locations, codexHome: join(f.temp, 'custom-codex') };
  write(join(locations.codexHome, 'AGENTS.override.md'), 'Override');
  assert.throws(() => applySetup(locations), /overrides the shared global instructions/);
  rmSync(join(locations.codexHome, 'AGENTS.override.md'));
  applySetup(locations);
  assert.equal(readlinkSync(join(locations.codexHome, 'AGENTS.md')), join(f.repo, 'globals/AGENTS.md'));
  assert.equal(lstatSync(join(f.codexHome, 'AGENTS.md'), { throwIfNoEntry: false }), undefined);
});

test('preflights configuration parent conflicts before installing anything', t => {
  const f = fixture(t);
  write(join(f.home, '.claude'), 'Not a directory');
  assert.throws(() => applySetup(f.locations), /expected a directory/);
  assert.equal(lstatSync(join(f.codexHome, 'AGENTS.md'), { throwIfNoEntry: false }), undefined);
});
