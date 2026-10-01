# אוֹתִיּוֹת קְסוּמוֹת — Hybrid Hebrew Literacy App

A hybrid educational web app for early Hebrew reading, built for a 6½-year-old. It combines printed QR cards with fully digital games. Built with React 19, Vite, and Tailwind CSS 4. The interface is in Hebrew (RTL) and all learning content is vocalized (with niqqud).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static build in dist/ (host anywhere)
npm run dev:https    # HTTPS on your LAN, to scan with a phone/tablet camera
```

> The camera only works in a **secure context** (`https://` or `localhost`). With `dev:https`, open the
> `https://<your-ip>:5173` address on the tablet and accept the self-signed certificate.

## How the card flow works

1. **Print cards** (`הדפסת כרטיסיות`): choose a start number and a count. Each A4 page holds four
   10 cm × 10 cm cards with dashed cut lines. Each card has a number (`#1`, `#2`, …), a placeholder area
   for a drawing or sticker, and a QR code that encodes `CARD_001`, `CARD_002`, and so on.
   Print at **100% / actual size**.
2. **First scan → setup**: the app sees an unmapped ID and opens “what does this card represent?”, a grid
   of vocalized letters and words with icons. The choice is saved to `localStorage` right away.
3. **Later scans → instant play**: a mapped card opens its lesson immediately, with no setup screen.
   A **letter** card plays its name and example word, shows an animation and tappable syllables
   (קָמָץ/חִירִיק/חוֹלָם/קֻבּוּץ/סֶגּוֹל), and has a **tracing** tab. A **word** card plays the word with
   an animation and has a **drag-and-drop assembly** tab.
4. **Challenge mode** (inside the scanner): the app says a letter or word, and the child finds and scans
   the matching card.
5. **Card management** (`ניהול כרטיסיות`): view, edit, or unlink cards, assign a card by number, export or
   import mappings as JSON (for example to move them to another device), and reset all cards.

If no camera is available, a “card number” box under the camera simulates a scan.

## Digital modes (no printing needed)

| Mode | What it does |
|---|---|
| 🧺 Sound Catcher | A letter name is spoken, letters fall, and the child taps the matching ones. Wrong taps only wiggle. Three letter-range levels. |
| ✏️ Letter tracing | Finger or mouse painting over a dashed letter. Coverage is measured, so scribbling outside the letter does not count. |
| 🧩 Word assembly | Letter-with-niqqud tiles are dragged (or tapped) into right-to-left slots. Easy and challenging word sets. |
| 📖 Storybook | Short vocalized stories. Tap any word to hear it, or use “read to me” to highlight each word as it is read. |

## Audio

Speech uses the **Web Speech API** with a Hebrew voice (`he-IL` / `iw-IL`). Pronunciation quality depends
on the device. Chrome, Edge, Android, and iOS usually include a Hebrew voice. If none is found, the home
screen shows a notice.

For exact phonics, you can add **recorded clips**: put MP3 files in `public/audio/` and list them in
`public/audio/manifest.json`:

```json
{ "clips": { "letter-bet": "bet.mp3", "word-kelev": "kelev.mp3", "syl-bet-a": "ba.mp3" } }
```

Keys are `letter-<id>`, `word-<id>`, `word-of-<letterId>`, or `syl-<letterId>-<a|i|o|u|e>`. The exact
Hebrew text also works as a key. Anything without a clip falls back to text-to-speech.

## Project structure

```
src/
  data/content.js        letters, vowels, words (vocalized) + grapheme splitter
  data/stories.js        storybook pages
  lib/storage.js         card-mapping persistence (localStorage) + hooks
  lib/speech.js          recorded clip → Web Speech fallback
  lib/sfx.js             synthesized success/error/scan sounds
  lib/router.js          tiny hash router
  components/QrScanner.jsx      html5-qrcode wrapper + viewfinder/scan animation
  components/ItemPicker.jsx     letter/word selection grid (setup + edit)
  components/LearningAction.jsx what a scanned card triggers
  games/                 SoundCatcher, TracingCanvas, WordAssembly, Storybook
  pages/                 Home, Scanner, PrintCards, CardManager, game pages
```

Add more words by appending to `WORDS` in `src/data/content.js`. They appear automatically in the
card picker and in word assembly.
