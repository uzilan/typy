# Typy — Roadmap

Typing trainer. React + Vite + TypeScript. In-memory storage first, Firebase later.
**Light + dark theme** from the start (all colors via CSS variables).
**Swedish UI, Swedish keyboard layout, Swedish texts** (å, ä, ö; home row `asdf jklö`; dead keys like ´ ¨ ^ ~).
Each phase gets its own detailed plan when we start it.

## Phases

0. ✅ **Scaffold** — Vite + React + TS, ESLint/Prettier, Vitest, folder layout.
1. ✅ **Mockups** — low-fi mockups of all main screens (exercise picker, typing, results, progress). Iterate until the flow feels right.
2. ✅ **Typing engine** — pure TS logic: compare input vs target per character, errors, WPM, accuracy, timing. Fully unit-tested, no UI. Must handle Unicode/Swedish chars correctly (incl. NFC normalization of composed chars).
3. ✅ **Typing screen** — target text with the input line below it, live per-character feedback, start/finish detection.
4. ✅ **Results screen** — stats for the finished run, compared with previous attempts of the same exercise.
5. ✅ **Exercises & levels** — split in two:
   - ✅ **5a Content & data** — passages from public-domain Swedish literature (mainly Lagerlöf, *Nils Holgerssons underbara resa*; some Söderberg), post-1906 spelling only, untypeable characters normalized (” → ", – → -, … → ...). Levels derived deterministically from passages: short words → long words → sentences → punctuation & dialogue → whole passages.
   - ✅ **5b Screens** — level ladder (sequential unlock), router.
6. ✅ **In-memory storage** (done before 4, so the results screen has real history) — attempt history behind a storage interface (so Firebase can replace it later without touching the UI).
7. ✅ **Progress overview** — history, personal bests, trends over time, repeat any exercise.
8. **Visual polish** — design pass based on mockup learnings.
9. **Firebase** — auth + Firestore implementation of the storage interface.
10. **Extras (maybe)** — weak-key analysis, custom texts, keyboard heatmap, etc.

## UI decisions

Mockups: <https://claude.ai/artifact/9tvMBF4B979R6gRRdRyEUP>

- **Typing screen** — variant A ("Klassisk"): full target text in a card, input line below, progress bar, "Börja om" button. No stats visible while typing; time / WPM / accuracy shown only when the exercise is done.
- **Results screen** — B + C combined ("Resultat · Vald"): compact stats line (WPM, accuracy, time, errors) + attempt number, action buttons, the text with error positions marked (incl. corrected ones), "characters to practice" chips, then a table of all attempts on this exercise with the current one highlighted. Implies tracking errors per character and per position. "Öva på svåra tecken" (generate practice from weak chars) is in the design → weak-key analysis moves earlier than "extras".

- **Levels** — text-based, not key-based: short words → longer words → sentences → punctuation & numbers → longer texts.
- **Exercise picker** — variant B ("Nivåstege"): vertical ladder of levels, each with status (Klar / Pågår / Låst) and a list of exercises showing best WPM + accuracy. **Levels unlock sequentially**: a level opens when every exercise in the previous one has been done at least once.
- **Progress overview** — variant A ("Trend"): summary tiles (best WPM, avg WPM, avg accuracy, practice days), two separate line charts over time (WPM, accuracy) with hover values, range toggle (last 14 days / all).
- **Navigation flow** — Övningar (ladder) ⇄ Mina framsteg via top nav; ladder → typing → results → "Försök igen" / "Nästa övning" / "Alla övningar". Light/dark toggle lives in the app header (built in phase 0).

## Decisions to make later (in their phase)

- Backspace allowed or not; how errors are counted
- Input handling: real `<input>` vs captured keystrokes (dead keys / composition events on Swedish layout favor a real input)
- Charting library for progress
- Auth method once Firebase arrives
