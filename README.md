# Agent files

This is where I keep the instructions and skills I use with coding agents. The aim is to have one place to edit them, keep their history in Git, and use the same files with Codex and Claude Code on my computer.

The setup uses individual symlinks from each agent's configuration directory into this repo.

## What belongs where

- **Global instructions** describe how I like to work across projects: communication, coding preferences, and general working agreements.
- **Project instructions** belong in each project's own repo. They cover that project's commands, conventions, and constraints.
- **Skills** describe reusable workflows that an agent loads when the task calls for them, such as debugging or reviewing code.
- **Scratch files** hold ideas, drafts, and instructions I'm deciding whether to use.

The root `AGENTS.md` tells agents how to maintain this repo. `globals/AGENTS.md` contains the personal instructions intended for use across projects.

## Repository layout

The intended layout looks like this. Skill names are examples:

```text
agents/
├── AGENTS.md
├── README.md
├── globals/
│   ├── AGENTS.md
│   └── skills/
│       ├── unslop/
│       │   └── SKILL.md
│       ├── another-personal-skill/
│       │   └── SKILL.md
│       └── matt-pocock/
│           ├── README.md
│           ├── tdd/
│           │   └── SKILL.md
│           └── grilling/
│               └── SKILL.md
├── scripts/
│   └── install
└── scratch/
```

Personal skills live directly under `globals/skills/`. Collections from other people can have a grouping directory, such as `matt-pocock/`.

Each group's README records where the collection came from, links to its upstream repository and documentation, and notes any local modifications. Record the imported revision when known so future updates have a clear starting point. These READMEs stay in this repo; they aren't installed as skills.

A skill directory contains `SKILL.md` and any supporting scripts, references, or assets it needs. The whole directory is linked, so those files travel together. References within a skill should stay inside that directory where possible, so reorganizing groups doesn't break them.

## How the agents find the files

For the default local configuration directories, the planned links are:

| Agent reads               | Link target in this repo          |
| ------------------------- | --------------------------------- |
| `~/.codex/AGENTS.md`      | `globals/AGENTS.md`               |
| `~/.claude/CLAUDE.md`     | `globals/AGENTS.md`               |
| `~/.agents/skills/unslop` | `globals/skills/unslop/`          |
| `~/.claude/skills/unslop` | `globals/skills/unslop/`          |
| `~/.agents/skills/tdd`    | `globals/skills/matt-pocock/tdd/` |
| `~/.claude/skills/tdd`    | `globals/skills/matt-pocock/tdd/` |

Both agents read the same global instructions. If Claude-specific instructions become useful later, its link can point to a small `globals/CLAUDE.md` file that imports the shared instructions and adds those differences.

Both agents see a skill called `tdd`; the `matt-pocock` grouping is just for organizing the source files. Skill directory names must be unique across the installed collection. Keep each skill's frontmatter name consistent with its directory name too.

This setup targets local Codex and Claude Code. It doesn't install files into hosted agents, Claude Cowork, or other computers.

## The installer

The planned installer will scan `globals/skills/` for directories containing `SKILL.md` and link each one into both agents' personal skill directories. Once it finds a skill, it treats that directory as a complete unit rather than scanning its supporting files for more skills. It won't scan `scratch/`.

It should be safe to rerun: preview changes, skip correct links, reject duplicate names, and report existing files or conflicting links before replacing anything. A status option should show missing, broken, and outdated links. Renames and moves need a way to remove obsolete links owned by this setup without touching unrelated skills.

Link individual skills rather than replacing an agent's entire skills directory. That leaves room for skills managed by other installers. Bundled and plugin-managed skills stay with their existing tools; skills maintained here use this repo as their source of truth.

## Everyday use

Edit the files here. Symlinks expose those edits without a copy step or a commit. An agent may need a fresh session to reload instructions it has already read.

Run the installer after adding, moving, or renaming a skill, or moving the repo itself. Ordinary content edits don't need it. Git commits provide history and rollback; they aren't an activation step.

Use `scratch/` for experiments that shouldn't be installed yet. When a draft is ready, move it into the appropriate global file or skill directory. Review changes to imported skills before updating them, especially when they've been customized locally.

Keep credentials and agent runtime data outside this repo. It stores the instructions and workflows we choose to maintain, rather than a copy of an entire agent configuration directory.

## Further reading

- [Codex instruction discovery](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Codex skills and local discovery](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code instructions and shared AGENTS.md files](https://code.claude.com/docs/en/memory)
- [Claude Code skills and symlink support](https://code.claude.com/docs/en/skills)
