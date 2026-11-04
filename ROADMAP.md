# Typy — Roadmap

Typing trainer. React + Vite + TypeScript. In-memory storage first, Firebase later.
**Light + dark theme** from the start (all colors via CSS variables).
**Swedish keyboard layout, Swedish texts** (å, ä, ö; home row `asdf jklö`; dead keys like ´ ¨ ^ ~).
Each phase gets its own detailed plan when we start it.

## Phases

0. **Scaffold** — Vite + React + TS, ESLint/Prettier, Vitest, folder layout.
1. **Mockups** — low-fi mockups of all main screens (exercise picker, typing, results, progress). Iterate until the flow feels right.
2. **Typing engine** — pure TS logic: compare input vs target per character, errors, WPM, accuracy, timing. Fully unit-tested, no UI. Must handle Unicode/Swedish chars correctly (incl. NFC normalization of composed chars).
3. **Typing screen** — target text with the input line below it, live per-character feedback, start/finish detection.
4. **Results screen** — stats for the finished run, compared with previous attempts of the same exercise.
5. **Exercises & levels** — data model + initial Swedish content, organized by level. Picker screen.
6. **In-memory storage** — attempt history behind a storage interface (so Firebase can replace it later without touching the UI).
7. **Progress overview** — history, personal bests, trends over time, repeat any exercise.
8. **Visual polish** — design pass based on mockup learnings.
9. **Firebase** — auth + Firestore implementation of the storage interface.
10. **Extras (maybe)** — weak-key analysis, custom texts, keyboard heatmap, etc.

## Decisions to make later (in their phase)

- What a "level" means (key subsets → full words → punctuation/numbers → real prose?)
- Backspace allowed or not; how errors are counted
- Input handling: real `<input>` vs captured keystrokes (dead keys / composition events on Swedish layout favor a real input)
- UI language: Swedish or English
- Source of Swedish texts (hand-written, public-domain literature, word-frequency lists)
- Mockup format (static HTML pages vs. throwaway React components)
- Charting library for progress
- Auth method once Firebase arrives
