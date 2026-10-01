# מִפְעַל הַמִּלִּים הַמְּעוֹפְפוֹת – The Flying Word Factory

A Hebrew phonics arcade game for beginning readers (about age 6–7).

## How it plays

1. **Conveyor belt.** A word box rides in on the belt: a picture (🐱) and the word with one sound missing (`חָ _ ל`).
2. **Falling bubbles.** Four chutes drop bubbles with vowelized syllables (תוּ, תָ, מוּ, …). Tapping a bubble says its sound.
3. **Right bubble.** It flies into the empty slot, the whole word is spoken, confetti bursts and points are added (+10, or +15 with no mistakes).
   **Wrong bubble.** A soft bounce sound, the bubble floats away, and a spoken hint plays: "we need the sound …". After 3 mistakes the right bubbles glow.
   The wrong bubbles are chosen to be tricky: same letter with another vowel, or same vowel with another letter.
4. **Letter tracing.** After 3 words the child traces the level's letter on a canvas (finger or mouse). The guide fills with gold along the path. Numbered green dots and arrows show where each stroke starts. A demo button shows how to write it. Accuracy earns 1–3 ⭐.
5. Finishing a level unlocks the next one. There are 10 levels and 30 words.

Progress (stars, points, unlocked levels, completed words) is saved in `localStorage`.

## Tech

React 19 · Vite · Tailwind CSS 4 · Framer Motion · Canvas (tracing) · Web Speech API (Hebrew voice) · Web Audio API (sound effects).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

**Hebrew voice:** speech uses the device's Hebrew text-to-speech voice (`he-IL`). Most iPads, Android tablets and Chrome have one. If none is found, the home screen shows a note.

## Where things live

- `src/data/words.js`: levels, words, and phonics helpers (syllables, distractors)
- `src/data/letters.js`: stroke paths for the tracing letters
- `src/components/GameScreen.jsx`: game loop (spawning, tapping, celebrating)
- `src/components/TracingGame.jsx`: tracing canvas and path checking
