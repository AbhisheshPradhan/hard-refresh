# Content

**These files are the source of truth. Edit them directly.**

They were migrated once from an HTML workbook, which is archived. There is no
regeneration step, and nothing here is overwritten by a build.

Run `npm run validate` after any change.

## Layout

```
content/<subject>/_subject.json            title, summary, group, order
content/<subject>/quiz.json                scored items
content/<subject>/interview.json           open items
content/<subject>/<chapter>/_chapter.json  title, summary, order
content/<subject>/<chapter>/<note>.mdx     frontmatter + body
content/<subject>/<chapter>/_part.mdx      optional intro, shown on the chapter page
```

A note id is its path: `react/foundations/jsx`. Those ids are what `related` and
`prerequisites` point at, which is why subjects stay flat — see the root README.

`_`-prefixed files are fragments, not notes. Both `getNotes` and the validator
filter them out.

## What is here

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| Subject        | `react`                                                    |
| Chapters       | 8 — `start-here`, the workbook's six parts, `reference`    |
| Notes          | 39 — 28 workbook chapters, 10 reference sections, 1 primer |
| Part intros    | 6, one per workbook part                                   |
| Practice items | 209 — 61 quiz, 148 interview                               |
| Prose          | ~57,000 words                                              |

Checked against the archived HTML: 45 documents, 38 figures and 209 questions on
both sides.

## MDX components available

```
<Figure caption="…">   wraps a raw inline <svg>              38 uses
<Callout kind="…">     predict | brief | build | note        52 uses
```

The SVGs use `currentColor` and carry their own `role="img"` and `aria-label`, so
they follow the theme and nothing re-labels them.

## Practice items

Both files are arrays. Every item carries `id`, `chapterId`, `noteId` and
`related`; quiz items add `options` and `correctIndex`; interview items add `kind`
(`diagnose` | `explain` | `rapid`) and `modelAnswer`.

**Ids are only unique within a subject** — they are chapter number plus index, so a
future CSS `9.4` collides with React `9.4`. Anything keying on an item must include
the subject; use `attemptKey()` from `src/lib/progress.ts`.

Quiz items all have four options, and `correctIndex` is spread 10/15/18/18, so
there is no answer-position bias to work around.

## Still to author

- **`tags`** — empty on all 39 notes. The glossary in
  `reference/glossary.mdx` is a ready-made vocabulary of 63 terms; auto-tag by
  term match, then review.
- **`prerequisites`** — set on 21 notes, derived from cross-references to earlier
  chapters. That is a proxy for a real prerequisite, not the same thing.
- **`updated`** — the import date, not the date the content last changed.

## Known rough edges

- Code fences are all marked ```jsx regardless of the actual language; a few blocks
  are shell, CSS or JSON.
- Before/after snippets lost their changed-line emphasis in conversion, in 51
  places.
