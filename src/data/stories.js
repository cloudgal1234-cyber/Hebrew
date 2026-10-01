// Early-reader stories. Each page is a short, fully vocalized sentence.
// Tapping any word reads it aloud; "read to me" reads the page word by word.

export const STORIES = [
  {
    id: 'dog-ball',
    title: 'הַכֶּלֶב וְהַכַּדּוּר',
    cover: '🐶',
    pages: [
      { art: '🐶', text: 'זֶה דּוּבִּי.' },
      { art: '🐶 ⚽', text: 'דּוּבִּי רָץ אֶל הַכַּדּוּר.' },
      { art: '⚽ 🌳', text: 'הַכַּדּוּר עָף אֶל הָעֵץ.' },
      { art: '🐶 😢', text: 'אוֹי! דּוּבִּי עָצוּב.' },
      { art: '👦 ⚽', text: 'יֶלֶד בָּא וְנוֹתֵן כַּדּוּר.' },
      { art: '🐶 ❤️ 👦', text: 'דּוּבִּי שָׂמֵחַ מְאֹד!' },
    ],
  },
  {
    id: 'sun-sea',
    title: 'יוֹם בַּיָּם',
    cover: '🌊',
    pages: [
      { art: '☀️', text: 'הַשֶּׁמֶשׁ זוֹרַחַת.' },
      { art: '👨 👩 👦', text: 'אַבָּא, אִמָּא וְדָנִי בַּיָּם.' },
      { art: '🐟 🐟', text: 'בַּמַּיִם יֵשׁ דָּג.' },
      { art: '🐢', text: 'עַל הַחוֹל יֵשׁ צָב.' },
      { art: '🍦', text: 'דָּנִי אוֹכֵל גְּלִידָה.' },
      { art: '🌙 😴', text: 'לַיְלָה טוֹב, יָם!' },
    ],
  },
  {
    id: 'cat-milk',
    title: 'הֶחָתוּל רוֹצֶה חָלָב',
    cover: '🐱',
    pages: [
      { art: '🐱', text: 'מִיצִי הוּא חָתוּל.' },
      { art: '🐱 🥛', text: 'מִיצִי רוֹצֶה חָלָב.' },
      { art: '🏠', text: 'מִיצִי הוֹלֵךְ הַבַּיְתָה.' },
      { art: '👩 🥛', text: 'אִמָּא נוֹתֶנֶת לוֹ חָלָב.' },
      { art: '🐱 💤', text: 'מִיצִי שָׁבֵעַ וְהוֹלֵךְ לִישֹׁן.' },
    ],
  },
]
