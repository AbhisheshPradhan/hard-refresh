# React content export

Generated from the HTML workbook. Regenerate with `extract.py`; do not hand-edit,
edits will be overwritten.

## Layout

    content/react/<chapter>/_chapter.json    6 parts
    content/react/<chapter>/<note>.mdx       28 notes
    quiz.json                                61 multiple-choice items
    interview.json                           148 open-ended items

`subject` is `react`. `chapter` is a Part. `note` is a workbook chapter,
~2,000 words. Note id = `react/<chapter>/<note>`.

## MDX components you must provide

    <Figure caption="...">  wraps a raw inline <svg>. 38 uses.
    <Callout kind="...">    kind is "predict" or "brief". 34 uses.

SVGs use `currentColor` and no fixed sizes, so they follow the surrounding theme.

## Code fences

All fenced as ```jsx regardless of actual language — some blocks are shell,
CSS or JSON. Fix by inspection if your highlighter cares.

Before/after snippets lost their changed-line emphasis in conversion (51 places).
If your highlighter supports line highlighting, those are worth restoring by hand.

## Fields you still need to author

- `tags` — empty on every note. The workbook glossary (60 terms) is a ready-made
  controlled vocabulary; auto-tag by term match then review.
- `prerequisites` — populated on 21 of 28 notes, derived from cross-references to
  *earlier* chapters. It is a proxy for real prerequisites, not the same thing.
  Worth a human pass.
- `updated` — set to the export date, not the date the content last changed.

## Known content issue

47 of 61 quiz items have `correctIndex: 1`. That is an authoring bias in the
source, not a conversion bug — a reader who notices will guess B. Shuffle the
options at build time, or fix in the source.
