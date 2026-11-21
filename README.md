# English Fun 🦉

A playful offline HTML app that teaches English to a young French speaker (age ~9),
from zero to building sentences. No build step, no dependencies: open `index.html`
in any browser (double-click works). Progress is saved locally in the browser
(localStorage). French UI, English content, tap-to-hear pronunciation on every word
(Web Speech API, British voice).

## Layout

- `index.html` — chapter picker (hub)
- `chapters/basic/` — **Chapitre 1 — Les bases** (levels 1–8): greetings, people,
  animals, colours & numbers, food, verbs, sentence structure, describing & chatting.
- `chapters/adventure/` — **Chapitre 2 — L'aventure** (levels 9–16): family, days &
  months, telling time, weather & seasons, school, town & places, body & feelings,
  and a grand mixed review quiz.

Each chapter folder is fully self-contained (`index.html`, `app.js`, `style.css`) and
can be zipped and shared on its own. Chapters share the same localStorage key, so
stars accumulate across chapters; each chapter gates its levels on the previous one.

## Exercise game modes

Match (EN↔FR pairs), Listen (hear → pick the picture), Quiz (multiple choice),
Build (tap word-bricks into sentence order, with distractor bricks), Count
(count emoji, answer in English). Wrong answers shake gently and can be retried;
hints reveal how many leading words are already correct, never the answer.
Questions reshuffle on every replay so repetition is never identical.

## Verification hooks

`app.js` exposes `window.__currentSet` / `window.__visibleItem` (the live answer keys
of the current exercise) — used by automated playthrough tests; harmless in normal use.
