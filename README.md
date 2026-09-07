# hardrefresh

A personal learning vault. Dump what you are learning, turn it into questions, and
find out later whether any of it stuck. No accounts, no feed, no streaks.

Currently holds one subject — a React study workbook of 39 notes and 209 practice
questions — but nothing about the app assumes that.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script             | What it does                                 |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Dev server                                   |
| `npm run build`    | Production build                             |
| `npm run lint`     | ESLint                                       |
| `npm run validate` | Check `content/` before it reaches the build |

Run `npm run validate` after touching anything under `content/`. It catches missing
metadata, duplicate note ids, cross-references that do not resolve, an out-of-range
`correctIndex`, and interview items with an unknown `kind`.

## How the app is arranged

Routing splits by **intent**, not by subject:

```
/learn                                    subjects
/learn/<subject>/<chapter>/<note>         a note, with the tree in a sidebar
/practice/<subject>/quiz/<chapter>        scored multiple choice
/practice/<subject>/interview/<chapter>   open questions, self-assessed
/review                                   everything you got wrong, all subjects
/progress                                 scores over time
```

A horizontal bar cannot express subject → chapter → note, so the sidebar carries the
hierarchy and the top bar carries intent and does not grow as content does.

`/review` and `/progress` are deliberately cross-subject. A spaced-repetition queue
that ignored subject boundaries is the correct one: if you missed five React
questions and three CSS ones, the queue is all eight.

Each note also ends with its own questions inline, so testing recall after reading
does not mean navigating away.

## Adding a subject

Drop a directory under `content/`, run `npm run validate`, build. No code changes.

```
content/<subject>/_subject.json           title, summary, group, order
content/<subject>/quiz.json               scored items
content/<subject>/interview.json          open items
content/<subject>/<chapter>/_chapter.json title, summary, order
content/<subject>/<chapter>/<note>.mdx    frontmatter + MDX body
content/<subject>/<chapter>/_part.mdx     optional intro, shown on the chapter page
```

Subjects are flat directories. Grouping (`Languages`, `Frameworks`,
`Computer science`) is the `group` field in `_subject.json`, not a directory level —
note ids are their paths, so a grouping directory would rewrite every cross-reference
for something purely presentational, and the grouping is exactly what gets revised.

Anything `_`-prefixed inside a chapter is a fragment, not a note. `getNotes` and the
validator both filter those out.

### One constraint that is easy to miss

Practice item ids are only unique **within a subject**. They are chapter number plus
index, so React `9.4` and a future CSS `9.4` are different questions with the same
id. Anything keying on an item must use `attemptKey()` from `src/lib/progress.ts`,
which prefixes the subject. Getting this wrong silently merges two subjects' attempt
history rather than failing.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, MDX through
`@next/mdx`, shadcn on the `base-nova` style.

Two things that differ from most React projects and will bite if assumed away:

- **shadcn base-nova is built on base-ui, not Radix.** Components compose with a
  `render` prop, not `asChild`.
- **`useMDXComponents()` takes no arguments** in this version, and Turbopack needs
  remark plugins passed as strings rather than imported functions.

Read `node_modules/next/dist/docs/` before writing against a Next API. See
`AGENTS.md`.

Progress is stored in `localStorage` only, so it does not follow you between
browsers, and clearing site data clears it.

## Content

`content/` is the source of truth. It was migrated once from an HTML workbook, which
is archived; edit the MDX and JSON directly. See `content/README.md` for the export's
own notes and its known rough edges.
