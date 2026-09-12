Hi, I am Aslak. You are my agent, and we will be working together a lot, so I figured I should introduce myself.

In my day job, I work at Konfidens, a startup delivering a clinic management platform for mental health practitioners.
My main hobby is working on a large range of smaller web apps that help me and my family and friends in day-to-day life.
Planeatrepeat.com, a cookbook and dinner planner, is my main project, and I have others like Shera, a Facebook events alternative, and Snack, a mini-store that runs the office fridge.

My requirements are different between my job and my hobby projects. If we are in Konfidens, we have a large number of real users, working with sensitive data. Backwards compatibility, security, downtime on deploy, and such are real concerns.
For my hobby projects, the users are my friends, and usage is low. We don’t want to produce slop, but the stakes are much lower.
You should always keep in mind whether we are working on Konfidens or a hobby project.

For both categories of coding, I love building solutions that provide value to users, often complex things, but built as simply as possible. I love to find ways to reduce complexity when solving problems.

I wanted to share some of my preferences here so we can be more aligned as we work together.

## Coding preferences - General

- Keep things simple. Channel “yagni” energy unless told otherwise.
- TypeScript is useful; take advantage of it.
- Don’t be scared to propose bold ideas if they can meaningfully benefit our work.
- Tests are good when useful. Endless smoke tests, “regression tests” for feature deletions, testing the rendering of React components, etc much less good. Tests should be focused, not slop.

## Coding preferences - TypeScript

- any is the enemy. Inferred types are our friends. Our systems should adapt to changes, instead of requiring changes everywhere.
- If your TS code looks like a Python dev wrote it, it is bad TS code.
- Avoid one-line functions that are just casting wrappers.
- Write TypeScript in ways that Matt Pocock and Theo would be proud of.

## Visual and design work

- I detest narrative copy in UI.

## Work preferences

- We will often be working from a handoff from claude design. I don’t meticulously prepare these handoffs before we start work. Expect artifacts of the design process, such as decisions that don’t take into account the techincal realities, callbacks to previous iterations that aren’t present. Visual marks in the design as marks of prototyping that shouldn’t be implemented (such as arrows indicating that a list will scroll).
- You should run repo-wide commands such as test, type-check, or lint before you push to a branch or make a PR. Not many times while you work.
- Local DBs have easy methods for resetting, which I will use when needed. You don’t need to worry about resetting local DB state unless asked.
- I will often have a dev environment running; check and use that before spinning up your own environment if possible.
- I prefer work to be in atomic, reviewable commits.

## Pull Requests

- Make sure you follow conventions of the repo. If there is a PR skill in the repo, follow that over these general instructions.
- Titles should be simple and easy to understand, e.g. “Email practitioners when a booking overlaps another” or “Add Instagram recipe imports”.
- PR descriptions should aim for simplicity. Open with a minimal, clear description of the problem based on the user's original prompt. Then briefly explain the solution.
- Add a blurb to the end of the PR description about what model and harness is making the changes.
- Do not include a verification section unless there are surprising steps that would help a user in a manual QA process of the work.
- For Konfidens, you should open draft PRs; for all other projects, we prefer non-draft PRs.
