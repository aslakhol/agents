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

The layout looks like this. Skill names are examples:

```text
agents/
├── AGENTS.md
├── README.md
├── globals/
│   ├── AGENTS.md
│   └── skills/
│       ├── unslop/
│       │   └── SKILL.md
│       └── matt-pocock/
│           ├── README.md
│           ├── tdd/
│           │   └── SKILL.md
│           └── grilling/
│               └── SKILL.md
├── scripts/
│   └── install.ts
└── scratch/
```

Skills live under `globals/skills/`, either directly or in a group. A group might bring together skills from one author, like `matt-pocock/`, or skills about the same topic. Each group has a README which stays here in the repo.

A skill directory contains `SKILL.md` and any supporting scripts, references, or assets it needs. Its YAML frontmatter has a `name` matching the directory and a `description` explaining when to use it. We link the whole directory, so those files stay together.

## How the agents find the files

The real files live in this repo. Each agent gets symlinks where it expects to find its instructions and skills. These work like shortcuts: when the agent opens one, it reads the file here.

| Agent reads            | Link target in this repo          |
| ---------------------- | --------------------------------- |
| `~/.codex/AGENTS.md`   | `globals/AGENTS.md`               |
| `~/.claude/CLAUDE.md`  | `globals/AGENTS.md`               |
| `~/.agents/skills/tdd` | `globals/skills/matt-pocock/tdd/` |
| `~/.claude/skills/tdd` | `globals/skills/matt-pocock/tdd/` |

Since we flatten the skills into one list each installed skill needs a unique directory name.

## Everyday use

```sh
pnpm install
pnpm setup
```

`pnpm setup` checks the repo, links the global instructions and skills, and removes broken or obsolete skill links. It leaves real files and folders alone, except for empty global instruction files that it replaces with links. Run it again when you add, move, or rename a skill, or move the repo itself.

Use `pnpm check` to preview needed changes without applying them, or `pnpm validate` to check just the repo. Validation catches duplicate names and invalid skill metadata. Skill names use lowercase letters, numbers, and single hyphens. `pnpm test` and `pnpm typecheck` check the installer itself.

For everyday edits, just change the files here. There's only one copy, so there's nothing to sync and no commit needed to make a change available. An agent may need a fresh session to pick up instructions it has already read.

Use `scratch/` for experiments you don't want active yet. When you're happy with a draft, move it into the appropriate global file or skill directory.
