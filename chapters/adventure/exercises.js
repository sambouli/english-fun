/* ============================================================
   English Fun — Chapitre 2 : exercices (levels 9–16)
   Uses mkMatch / mkListen / mkChoice / mkOrder / mkBuild / mkCount
   defined in ../basic/app.js.
   ============================================================ */
'use strict';

const EXERCISES2 = {
  family: () => [
    mkMatch(VOCAB.family, 6),
    mkChoice([
      { ask: '« Son frère (à elle) est drôle » =', speak: 'Her brother is funny', options: ['Her brother is funny', 'His brother is funny', 'She brother is funny', 'Hers brother is funny'], answer: 'Her brother is funny' },
      { ask: '« Son chien (à lui) est gros » =', speak: 'His dog is big', options: ['His dog is big', 'Her dog is big', 'He dog is big', 'Him dog is big'], answer: 'His dog is big' },
      { ask: '👵 = …', speak: 'grandmother', options: ['grandmother', 'aunt', 'sister', 'cousin'], answer: 'grandmother' },
      { ask: '« J’ai un frère et une sœur » =', speak: 'I have a brother and a sister', options: ['I have a brother and a sister', 'I has a brother and a sister', 'I am a brother and a sister', 'You have a brother and a sister'], answer: 'I have a brother and a sister' }
    ]),
    mkListen(VOCAB.family.map(f => [f[0], f[1], f[2]]), 5),
    mkBuild([
      { en: 'My mother cooks well', fr: 'Ma maman cuisine bien', extra: ['cook', 'is', 'bad'] },
      { en: 'I love my grandmother', fr: 'J’aime ma grand-mère', extra: ['loves', 'am', 'the'] },
      { en: 'She has a little brother', fr: 'Elle a un petit frère', extra: ['have', 'big', 'sister'] }
    ])
  ],
  days: () => [
    mkMatch(VOCAB.days, 5),
    mkChoice([
      { ask: '« Je joue le mercredi » =', speak: 'I play on Wednesday', options: ['I play on Wednesday', 'I play in Wednesday', 'I play at Wednesday', 'I plays on Wednesday'], answer: 'I play on Wednesday' },
      { ask: '« Mon anniversaire est en mai » =', speak: 'My birthday is in May', options: ['My birthday is in May', 'My birthday is on May', 'My birthday is at May', 'I am in May'], answer: 'My birthday is in May' },
      { ask: 'Quel jour vient après Monday ?', speak: 'Tuesday', options: ['Tuesday', 'Sunday', 'Friday', 'Wednesday'], answer: 'Tuesday' },
      { ask: '« Nous sommes vendredi » =', speak: 'Today is Friday', options: ['Today is Friday', 'It is Friday day', 'Now is Friday', 'Today are Friday'], answer: 'Today is Friday' },
      { ask: 'Le premier jour de la semaine en anglais =', speak: 'Monday', options: ['Monday', 'Sunday', 'Saturday', 'January'], answer: 'Monday' }
    ]),
    mkOrder([
      { en: 'Today is Sunday', fr: 'Nous sommes dimanche' },
      { en: 'I swim on Saturday', fr: 'Je nage le samedi' },
      { en: 'What day is it', fr: 'On est quel jour ?' }
    ]),
    mkMatch(VOCAB.months_seasons.slice(0, 8), 5)
  ],
  time: () => [
    mkCount([
      { q: '🕐 Il est 3 heures', speak: 'three oclock', answer: 'three o’clock', options: ['three o’clock', 'third o’clock', 'twelve o’clock', 'two o’clock'] },
      { q: '🕔 Il est 5 heures', speak: 'five oclock', answer: 'five o’clock', options: ['five o’clock', 'four o’clock', 'six o’clock', 'nine o’clock'] },
      { q: '🕗 Il est 8 heures', speak: 'eight oclock', answer: 'eight o’clock', options: ['eight o’clock', 'eight past', 'eighteen', 'seven o’clock'] },
      { q: '🕛 Il est midi (12 heures)', speak: 'twelve oclock', answer: 'twelve o’clock', options: ['twelve o’clock', 'two o’clock', 'ten o’clock', 'one o’clock'] }
    ]),
    mkChoice([
      { ask: '« Il est 6 h 30 » =', speak: 'It is half past six', options: ['It is half past six', 'It is six and half', 'It is half six', 'It is past six'], answer: 'It is half past six' },
      { ask: 'Pour demander l’heure on dit :', speak: 'What time is it', options: ['What time is it?', 'What hour is it?', 'Where is the clock?', 'How many clocks?'], answer: 'What time is it?' },
      { ask: '« Je me lève à 7 heures » =', speak: 'I get up at seven o’clock', options: ['I get up at seven o’clock', 'I get up on seven o’clock', 'I wake in seven', 'I am up at seven clock'], answer: 'I get up at seven o’clock' },
      { ask: '« Je vais au lit à 9 heures » =', speak: 'I go to bed at nine o’clock', options: ['I go to bed at nine o’clock', 'I go to bed in nine', 'I sleep at nine clock', 'I am bed at nine'], answer: 'I go to bed at nine o’clock' }
    ]),
    mkListen(VERBS2.slice(0, 6).map(v => [v[0], v[1], v[2]]), 4),
    mkBuild([
      { en: 'School starts at nine', fr: 'L’école commence à neuf heures', extra: ['start', 'on', 'ten'] },
      { en: 'I have breakfast at eight', fr: 'Je prends le petit-déjeuner à huit heures', extra: ['has', 'eat', 'lunch'] }
    ])
  ],
  weather: () => [
    mkMatch(VOCAB.weather, 6),
    mkChoice([
      { ask: '🌨️ On parle de la neige :', speak: 'it is snowy', options: ['It is snowy', 'It is snowing sky', 'Is snow', 'Snowy is'], answer: 'It is snowy' },
      { ask: '« Il fait froid. Mets ton manteau ! » =', speak: 'It is cold. Wear your coat', options: ['It is cold. Wear your coat!', 'It is cold. Put your coat!', 'He is cold. Wear your coat!', 'It cold. Wear coat!'], answer: 'It is cold. Wear your coat!' },
      { ask: '❄️ La saison froide =', speak: 'winter', options: ['winter', 'autumn', 'spring', 'january'], answer: 'winter' },
      { ask: '☀️ La saison chaude =', speak: 'summer', options: ['summer', 'sunday', 'spring', 'noon'], answer: 'summer' },
      { ask: '« Ma saison préférée est le printemps » =', speak: 'My favourite season is spring', options: ['My favourite season is spring', 'My season favourite is spring', 'I favourite spring', 'Spring is my like'], answer: 'My favourite season is spring' }
    ]),
    mkMatch(VOCAB.seasons, 4),
    mkBuild([
      { en: 'It is raining today', fr: 'Il pleut aujourd’hui', extra: ['snow', 'am', 'sunny'] },
      { en: 'Take your umbrella please', fr: 'Prends ton parapluie s’il te plaît', extra: ['umbrellas', 'not', 'my'] }
    ])
  ],
  school: () => [
    mkMatch(VOCAB.school, 6),
    mkListen(VOCAB.school.map(s => [s[0], s[1], s[2]]), 5),
    mkChoice([
      { ask: '« Je ne comprends pas » =', speak: 'I do not understand', options: ['I do not understand', 'I not understand', 'I does not understands', 'No understand me'], answer: 'I do not understand' },
      { ask: '« Elle sait dessiner » =', speak: 'She can draw', options: ['She can draw', 'She cans draw', 'She can draws', 'She is can draw'], answer: 'She can draw' },
      { ask: '📝 Les devoirs =', speak: 'homework', options: ['homework', 'housework', 'exercise book', 'school work'], answer: 'homework' },
      { ask: '« Puis-je aller aux toilettes ? » =', speak: 'Can I go to the toilet', options: ['Can I go to the toilet?', 'I can go where?', 'Am I toilet?', 'Where I can go?'], answer: 'Can I go to the toilet?' },
      { ask: '✏️ Un crayon =', speak: 'pencil', options: ['pencil', 'pen', 'ruler', 'crayon box'], answer: 'pencil' }
    ]),
    mkOrder([
      { en: 'My teacher is very nice', fr: 'Ma maîtresse est très gentille' },
      { en: 'I do my homework every day', fr: 'Je fais mes devoirs chaque jour' }
    ]),
    mkBuild([
      { en: 'Can you help me', fr: 'Peux-tu m’aider ?', extra: ['does', 'helps', 'am'] },
      { en: 'We read books in the library', fr: 'Nous lisons des livres à la bibliothèque', extra: ['reads', 'shops', 'is'] }
    ])
  ],
  town: () => [
    mkMatch(VOCAB.town, 6),
    mkChoice([
      { ask: '🥐 La boulangerie =', speak: 'bakery', options: ['bakery', 'bakery shop', 'bread house', 'cake shop'], answer: 'bakery' },
      { ask: '« Tourne à gauche » =', speak: 'turn left', options: ['Turn left', 'Turn light', 'Go left hand', 'Left turn to'], answer: 'Turn left' },
      { ask: '« tout droit » =', speak: 'go straight', options: ['go straight', 'go strong', 'walk right', 'go direct'], answer: 'go straight' },
      { ask: '« Le parc est près de l’école » =', speak: 'The park is near the school', options: ['The park is near the school', 'The park is near to school', 'The park near is the school', 'Near the park is school'], answer: 'The park is near the school' },
      { ask: '🏥 L’hôpital =', speak: 'hospital', options: ['hospital', 'hostel', 'hotel', 'house of pain'], answer: 'hospital' }
    ]),
    mkListen(VOCAB.town.map(t => [t[0], t[1], t[2]]), 4),
    mkBuild([
      { en: 'Where is the station', fr: 'Où est la gare ?', extra: ['what', 'near', 'far'] },
      { en: 'I want to buy bread', fr: 'Je veux acheter du pain', extra: ['buys', 'sell', 'eat'] }
    ])
  ],
  feelings: () => [
    mkMatch(VOCAB.feelings, 6),
    mkMatch(VOCAB.body_more, 5),
    mkChoice([
      { ask: '« J’ai faim » se dit :', speak: 'I am hungry', options: ['I am hungry', 'I have hungry', 'I hungry am', 'You are hungry'], answer: 'I am hungry' },
      { ask: '😠 = …', speak: 'angry', options: ['angry', 'happy', 'kind', 'proud'], answer: 'angry' },
      { ask: '« Mon genou fait mal » =', speak: 'My knee hurts', options: ['My knee hurts', 'My knee is hurt me', 'I hurt my knees', 'My knee hurting'], answer: 'My knee hurts' },
      { ask: '« Elle a peur du noir » =', speak: 'She is afraid of the dark', options: ['She is afraid of the dark', 'She have fear of dark', 'She is fright the dark', 'Her is afraid dark'], answer: 'She is afraid of the dark' },
      { ask: '🦷 = …', speak: 'tooth', options: ['tooth', 'tongue', 'toes', 'thumb'], answer: 'tooth' }
    ]),
    mkOrder([
      { en: 'How are you today', fr: 'Comment vas-tu aujourd’hui ?' },
      { en: 'I am fine thank you', fr: 'Je vais bien merci' }
    ]),
    mkBuild([
      { en: 'I am excited because it is Sunday', fr: 'Je suis enthousiaste car c’est dimanche', extra: ['sad', 'are', 'rainy'] },
      { en: 'The girl is proud of her brother', fr: 'La fille est fière de son frère', extra: ['his', 'proudly', 'angry'] }
    ])
  ],
  review: () => [
    mkChoice([
      { ask: '« Elle ne mange pas de poisson » =', speak: 'She does not eat fish', options: ['She does not eat fish', 'She do not eat fish', 'She not eats fish', 'Does she not fish'], answer: 'She does not eat fish' },
      { ask: '« Est-ce qu’il court vite ? » =', speak: 'Does he run fast', options: ['Does he run fast?', 'Do he runs fast?', 'Is he run fast?', 'He does run fast?'], answer: 'Does he run fast?' },
      { ask: 'Beaucoup d’eau =', speak: 'much water', options: ['much water', 'many water', 'much waters', 'many waters'], answer: 'much water' },
      { ask: '« Il y a un chat sur l’arbre » =', speak: 'There is a cat on the tree', options: ['There is a cat on the tree', 'It has a cat on the tree', 'There are a cat on the tree', 'A cat is there the tree'], answer: 'There is a cat on the tree' },
      { ask: '« Qu’est-ce que c’est ? » =', speak: 'What is this', options: ['What is this?', 'Which is this?', 'Who is this?', 'Where is this?'], answer: 'What is this?' },
      { ask: '« J’ai neuf ans » =', speak: 'I am nine years old', options: ['I am nine years old', 'I have nine years', 'I am nine year old', 'You are nine'], answer: 'I am nine years old' },
      { ask: '« Ma couleur préférée est le bleu » =', speak: 'My favourite colour is blue', options: ['My favourite colour is blue', 'My colour favourite is blue', 'I favourite blue', 'Blue is my favourites'], answer: 'My favourite colour is blue' },
      { ask: '« Peux-tu parler plus lentement ? » =', speak: 'Can you speak more slowly', options: ['Can you speak more slowly?', 'Do you can speak slow?', 'You can speak slow?', 'Can you speaks slowly?'], answer: 'Can you speak more slowly?' }
    ]),
    mkOrder([
      { en: 'My name is Léa and I am nine', fr: 'Je m’appelle Léa et j’ai neuf ans' },
      { en: 'She does not like rainy days', fr: 'Elle n’aime pas les jours de pluie' },
      { en: 'Do you want to play with me', fr: 'Tu veux jouer avec moi ?' },
      { en: 'The bakery is opposite the school', fr: 'La boulangerie est en face de l’école' }
    ]),
    mkBuild([
      { en: 'He can ride his bike very fast', fr: 'Il sait faire du vélo très vite', extra: ['cans', 'rides', 'slow'] },
      { en: 'We are happy because it is summer', fr: 'Nous sommes contents car c’est l’été', extra: ['am', 'sad', 'winter'] },
      { en: 'Does your grandmother live near us', fr: 'Est-ce que ta grand-mère habite près de nous ?', extra: ['do', 'lives', 'far'] }
    ]),
    mkMatch([['there is', '📍', 'il y a (un)'], ['how many', '🔢', 'combien'], ['because', '💡', 'parce que'], ['always', '🔁', 'toujours'], ['never', '🚫', 'jamais'], ['o’clock', '🕐', 'heures justes']], 6)
  ]
};
