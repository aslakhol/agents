---
name: support
description: Turn a support request into a short contextual summary, code-backed answers, product requests, and a draft reply.
disable-model-invocation: true
---

# Support

Produce a quick support brief. Investigate thoroughly, then make the result light and easy to scan. Use one short progress update before investigating and add another only if the work takes long or reaches an important fork.

## Work

1. Separate the request into topics. For each topic, retain the workflow, the problem it causes, and what the customer needs answered or changed. The summary must make sense to someone who has not read the original message. Ignore forwarding headers, signatures, and repetition.

2. Identify the underlying need separately from any cause or solution the customer suggests. Treat suggestions as clues, not requirements. Search for an existing way to meet the need before calling it a product request. Carry a suggested solution forward only when it addresses a need that remains unmet or the customer expresses a separate need it would serve.

3. Investigate each topic in the codebase. Trace the behavior far enough to answer the question, find an existing capability, or confirm a product gap. For unexpected behavior, make a focused hypothesis-first pass through the relevant reads, writes, mappings, recent changes, tests, merges, imports, or audit data before asking for more information. When the customer says the behavior changed recently, briefly inspect relevant recent commits and merged pull requests, using the reported timeframe and affected workflow to keep the search focused. Try to rule out broad causes and narrow the remaining possibilities. Ask immediately only when the request lacks enough detail to locate the workflow or begin a useful search.

4. Back each conclusion with one or two compact file and line references. Keep the search process, version checks, confidence scoring, and routine limitations internal. Surface uncertainty only when it changes what the user should say or do.

5. List only genuinely unmet needs as product requests. State the gap, why it matters, and an issue-ready title. Leave the decision and issue creation to the user.

6. If a missing fact still blocks an answer, ask one or two short questions. Direct each question to the user or customer most likely to know. Tie every question to a remaining hypothesis and say briefly what the answer will distinguish. Otherwise omit questions.

7. Draft a short, natural reply in the language of the request. Answer the customer's real need and correct faulty assumptions gently. When an existing feature meets the need, explain how to use it instead of promising to consider the customer's suggested solution. For a genuine product request, normally say it will be considered without promising implementation. Keep code and internal reasoning out of the draft.

## Output

Use the language of the request, including the headings. Write one plain bullet per topic, usually one sentence. Aim for fewer than 250 words including the draft, and expand only when the request has many separate topics. Return only these sections:

```md
## Context and need

- ...

## Answer

- **Topic:** ... (`path/to/file:line`)

## Product requests

- **Unmet need:** Why it matters. Suggested issue: "..." (`path/to/file:line`)

## Need to clarify

- **Ask me/customer:** ... **Why:** ...

## Reply

...
```

Include `Product requests` and `Need to clarify` only when needed. Put factual answers, current behavior, and existing solutions in `Answer`; put unmet needs in `Product requests` instead of repeating them in both. Code references belong in the internal sections, never in `Reply`. Return a draft only; do not send it or create issues.
