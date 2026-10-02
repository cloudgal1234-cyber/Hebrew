# מִפְעַל הַמִּלִּים הַמְּעוֹפְפוֹת – The Flying Word Factory

A Hebrew word-reading arcade game for beginning readers (about age 6–7).

## How it plays

The game practises reading **whole words**.

1. **Learning to read the word.** Before each word a reading lesson opens. The word is split into syllables (גָּ · מָל), and each syllable lights up and is read aloud. Then the syllables are blended step by step (גָּ… גָּמָל) until the whole word is read. The child can tap any syllable to hear it again, or tap 🔁 to replay the lesson. The "📖 how do we read it?" button reopens the lesson during the game.
2. **Conveyor belt.** A box rides in on the belt with a picture (🐱) and an empty slot for its word.
3. **Falling bubbles.** Three chutes drop bubbles, each with a whole vowelized word (חָתוּל, גָּמָל, …), with syllables in alternating colours. Tapping a bubble reads the word aloud.
4. **Right bubble.** It flies into the slot, confetti bursts and points are added (+10, or +15 with no mistakes).
   **Wrong bubble.** A soft bounce sound, the bubble floats away, and a spoken hint plays: "that's not the word, look for …". After 3 mistakes the right bubbles glow.
   The wrong words are chosen to look similar (same first letter, shared letters, similar length), so the child has to really read.
5. **Bonus round.** After 3 words, the child matches each word card to its picture. Fewer mistakes earn more ⭐ (1–3).
6. Finishing a level unlocks the next one. There are 53 levels and 159 words, from short words (דָּג) up to long ones (צְפַרְדֵּעַ, אוֹפַנַּיִם).

### Learning nikud (לוֹמְדִים נִקּוּד)

A separate section on the home screen teaches the vowel signs, one lesson per sound: קָמָץ and פַּתָּח (אָ), צֵירֵה and סֶגּוֹל (אֶ), חִירִיק (אִי), חוֹלָם (אוֹ), שׁוּרוּק and קֻבּוּץ (אוּ), שְׁוָא, plus a mixed review. Each lesson has four steps:

1. **Meet the sign:** what it looks like and what it says.
2. **Letters:** the sign on 6 letters, each read aloud.
3. **Words:** words from the game whose first syllable has the sign.
4. **Listening game:** hear a syllable and pick it from 3 bubbles with the same letter and different vowels. 1–3 ⭐.

### Sentences and stories (מִשְׁפָּטִים וְסִפּוּרִים)

A third section on the home screen for reading connected text. Every word can be tapped to hear it, and "🔊 read to me" lights up each word as it is read, then reads the whole text fluently.

- **Sentences:** 6 sets of 5 sentences, from short ones (הַחָתוּל יָשֵׁן.) to long ones. The child reads the sentence, taps "I read it!", then picks the picture that matches it.
- **Stories:** 8 illustrated stories of 3–5 pages, with page-turn animations and 2–3 comprehension questions at the end.

Progress (stars, points, unlocked levels, completed words, and stars for nikud, sentences and stories) is saved in `localStorage`.

## Tech

React 19 · Vite · Tailwind CSS 4 · Framer Motion · Web Speech API (Hebrew voice) · Web Audio API (sound effects).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

**Hebrew voice:** speech uses the device's Hebrew text-to-speech voice (`he-IL`). Most iPads, Android tablets and Chrome have one. If none is found, the home screen shows a note.

## Where things live

- `src/data/words.js`: levels, words split into syllables (`'גָּ|מָל'`), the blending steps, and the choice of look-alike wrong words
- `src/components/ReadingLesson.jsx`: the syllable-by-syllable reading lesson
- `src/components/GameScreen.jsx`: game loop (spawning, tapping, celebrating)
- `src/components/MatchGame.jsx`: the word-to-picture bonus round
- `src/data/nikud.js`, `src/components/NikudHome.jsx`, `src/components/NikudLesson.jsx`: the nikud lessons
- `src/data/stories.js`: sentence sets and stories (add more here); `ReadingHome.jsx`, `SentenceSet.jsx`, `StoryReader.jsx`, `ReadAloud.jsx`: the reading section
