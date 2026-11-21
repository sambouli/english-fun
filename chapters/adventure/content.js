/* ============================================================
   English Fun — Chapitre 2 : L'aventure (levels 9–16)
   New content only. The engine is loaded from ../basic/app.js.
   Requires: basic app.js globals (CHIP, VOCAB, mkMatch, …).
   ============================================================ */
'use strict';

/* ---------- extra word chips for build mode ---------- */
Object.assign(CHIP, {
  'sister': '👧', 'brother': '👦', 'grandmother': '👵', 'grandfather': '👴', 'aunt': '👩', 'uncle': '👨',
  'cousin': '🧒', 'parents': '👨‍👩‍👧', 'monday': '📅', 'tuesday': '📅', 'wednesday': '📅',
  'thursday': '📅', 'friday': '📅', 'saturday': '🏖️', 'sunday': '⛪', 'weekend': '🎈', 'january': '🎿', 'february': '❄️',
  'march': '🌱', 'april': '🌸', 'may': '🌼', 'june': '☀️', 'july': '🏖️', 'august': '🌻', 'september': '🍂',
  'october': '🎃', 'november': '🌧️', 'december': '🎄', 'spring': '🌷', 'summer': '🏊‍♀️', 'autumn': '🍁', 'winter': '⛄',
  'clock': '🕐', 'o’clock': '🕐', 'half': '➗', 'past': '⏩', 'breakfast': '🥣',
  'lunch': '🥪', 'dinner': '🍽️', 'warm': '🌤️', 'cool': '🍃', 'snowy': '🌨️', 'windy': '💨', 'cloudy': '☁️',
  'umbrella': '☂️', 'coat': '🧥', 'school': '🏫', 'classroom': '🏫', 'pupil': '🧒', 'pencil': '✏️', 'pen': '🖊️',
  'ruler': '📏', 'eraser': '🧽', 'crayon': '🖍️', 'scissors': '✂️', 'glue': '🧴', 'desk': '🪑', 'playground': '🛝',
  'library': '📚', 'homework': '📝', 'exam': '📄', 'question': '❓', 'answer': '💡',
  'shop': '🏪', 'bakery': '🥐', 'park': '🛝', 'hospital': '🏥', 'pharmacy': '💊', 'station': '🚉',
  'beach': '🏖️', 'mountain': '⛰️', 'left': '⬅️', 'right': '➡️', 'straight': '⏫', 'near': '📍', 'far': '🔭',
  'opposite': '🔁', 'stomach': '🫃', 'back': '🔙', 'knee': '🦵', 'elbow': '🦴', 'finger': '👆',
  'tooth': '🦷', 'tongue': '👅', 'shoulder': '🤷', 'afraid': '😨', 'angry': '😠', 'excited': '🤩', 'bored': '😐',
  'sick': '🤒', 'worried': '😟', 'surprised': '😲', 'proud': '😌', 'kind': '💗',
  'because': '💡', 'always': '🔁', 'never': '🚫', 'often': '🔂', 'sometimes': '🎲',
  'first': '1️⃣', 'then': '2️⃣', 'finally': '🏁', 'again': '🔁', 'maybe': '🤔',
  'brush': '🪥', 'wash': '🧼', 'study': '📚', 'learn': '🧠', 'draw': '🎨', 'paint': '🖌️', 'cook': '👨‍🍳',
  'clean': '🧹', 'buy': '🛒', 'sell': '💰', 'ask': '❓', 'listen': '👂', 'speak': '🗣️', 'fly': '🛫',
  'ride': '🚴', 'climb': '🧗', 'catch': '🤾', 'understand': '🤔', 'toilet': '🚻', 'wear': '👕', 'take': '🫳',
  'funny': '🤣', 'every': '🔁', 'day': '🌞', 'dark': '🌑', 'starts': '🔛', 'hurts': '😖'
});

/* ---------- new vocabulary ---------- */
VOCAB.family = [
  ['sister', '👧', 'sœur'], ['brother', '👦', 'frère'], ['grandmother', '👵', 'grand-mère'], ['grandfather', '👴', 'grand-père'],
  ['aunt', '👩', 'tante'], ['uncle', '👨', 'oncle'], ['cousin', '🧒', 'cousin(e)'], ['parents', '👨‍👩‍👧', 'parents'],
  ['baby sister', '👶', 'petite sœur'], ['pet', '🐹', 'animal de compagnie']
];
VOCAB.days = [
  ['Monday', '📅', 'lundi'], ['Tuesday', '📅', 'mardi'], ['Wednesday', '📅', 'mercredi'], ['Thursday', '📅', 'jeudi'],
  ['Friday', '📅', 'vendredi'], ['Saturday', '🏖️', 'samedi'], ['Sunday', '⛪', 'dimanche'], ['weekend', '🎈', 'week-end']
];
VOCAB.months_seasons = [
  ['January', '🎿', 'janvier'], ['February', '❄️', 'février'], ['March', '🌱', 'mars'], ['April', '🌸', 'avril'],
  ['May', '🌼', 'mai'], ['June', '☀️', 'juin'], ['July', '🏖️', 'juillet'], ['August', '🌻', 'août'],
  ['September', '🍂', 'septembre'], ['October', '🎃', 'octobre'], ['November', '🌧️', 'novembre'], ['December', '🎄', 'décembre']
];
VOCAB.seasons = [
  ['spring', '🌷', 'printemps'], ['summer', '🏊‍♀️', 'été'], ['autumn', '🍁', 'automne'], ['winter', '⛄', 'hiver'],
  ['hot', '🔥', 'chaud'], ['cold', '🧊', 'froid'], ['warm', '🌤️', 'doux'], ['cool', '🍃', 'frais']
];
VOCAB.weather = [
  ['sunny', '☀️', 'ensoleillé'], ['rainy', '🌧️', 'pluvieux'], ['cloudy', '☁️', 'nuageux'], ['windy', '💨', 'venteux'],
  ['snowy', '🌨️', 'neigeux'], ['storm', '⛈️', 'orage'], ['rainbow', '🌈', 'arc-en-ciel'], ['fog', '🌫️', 'brouillard'],
  ['umbrella', '☂️', 'parapluie'], ['coat', '🧥', 'manteau']
];
VOCAB.school = [
  ['school', '🏫', 'école'], ['classroom', '🏫', 'salle de classe'], ['teacher', '🧑‍🏫', 'maître / maîtresse'],
  ['pupil', '🧒', 'élève'], ['pencil', '✏️', 'crayon'], ['pen', '🖊️', 'stylo'], ['ruler', '📏', 'règle'],
  ['eraser', '🧽', 'gomme'], ['crayon', '🖍️', 'crayon de couleur'], ['scissors', '✂️', 'ciseaux'],
  ['glue', '🧴', 'colle'], ['notebook', '📓', 'cahier'], ['backpack', '🎒', 'cartable'], ['desk', '🪑', 'table'],
  ['playground', '🛝', 'cour de récréation'], ['library', '📚', 'bibliothèque'], ['homework', '📝', 'devoirs'],
  ['exam', '📄', 'examen'], ['question', '❓', 'question'], ['answer', '💡', 'réponse']
];
VOCAB.town = [
  ['shop', '🏪', 'magasin'], ['bakery', '🥐', 'boulangerie'], ['park', '🛝', 'parc'], ['hospital', '🏥', 'hôpital'],
  ['pharmacy', '💊', 'pharmacie'], ['station', '🚉', 'gare'], ['beach', '🏖️', 'plage'], ['mountain', '⛰️', 'montagne'],
  ['church', '⛪', 'église'], ['cinema', '🎬', 'cinéma'], ['swimming pool', '🏊', 'piscine'], ['museum', '🏛️', 'musée']
];
VOCAB.body_more = [
  ['arm', '💪', 'bras'], ['leg', '🦵', 'jambe'], ['knee', '🦵', 'genou'], ['elbow', '🦴', 'coude'],
  ['finger', '👆', 'doigt'], ['tooth', '🦷', 'dent'], ['tongue', '👅', 'langue'], ['shoulder', '🤷', 'épaule'],
  ['stomach', '🫃', 'ventre'], ['back', '🔙', 'dos']
];
VOCAB.feelings = [
  ['happy', '😊', 'heureux'], ['sad', '😢', 'triste'], ['angry', '😠', 'en colère'], ['afraid', '😨', 'effrayé'],
  ['excited', '🤩', 'enthousiaste'], ['bored', '😐', 'ennuyé'], ['tired', '🥱', 'fatigué'], ['sick', '🤒', 'malade'],
  ['worried', '😟', 'inquiet'], ['surprised', '😲', 'surpris'], ['proud', '😌', 'fier'], ['kind', '💗', 'gentil']
];

/* ---------- new verbs ---------- */
const VERBS2 = [
  ['brush', '🪥', 'brosser'], ['wash', '🧼', 'laver'], ['get up', '⏰', 'se lever'], ['go to bed', '🛌', 'aller au lit'],
  ['study', '📚', 'étudier'], ['learn', '🧠', 'apprendre'], ['draw', '🎨', 'dessiner'], ['paint', '🖌️', 'peindre'],
  ['cook', '👨‍🍳', 'cuisiner'], ['clean', '🧹', 'nettoyer'], ['buy', '🛒', 'acheter'], ['sell', '💰', 'vendre'],
  ['ask', '❓', 'demander'], ['answer', '💡', 'répondre'], ['listen', '👂', 'écouter'], ['speak', '🗣️', 'parler'],
  ['fly', '🛫', 'voler'], ['ride', '🚴', 'monter à'], ['climb', '🧗', 'grimper'], ['catch', '🤾', 'attraper']
];

/* ---------- lessons (levels 9–16) ---------- */
const LESSONS2 = [
  {
    id: 'family', title: 'My Family 👨‍👩‍👧', color: 'coral', icon: '👨‍👩‍👧', sub: 'La famille et les animaux',
    blocks: [
      { kind: 'tip', html: 'Voici toute ta famille en anglais ! Astuce : le <b>h</b> de <b>his</b> (son, à lui) et <b>her</b> (son, à elle) ne se prononce PAS. 🤫' },
      { kind: 'words', cat: 'family' },
      { kind: 'rule', title: 'À qui est-ce ? 👐', html: '<b>my</b> = mon/ma · <b>your</b> = ton/ta · <b>his</b> = son (à lui) · <b>her</b> = son (à elle)<br>✅ <b>Her brother is funny.</b> = Son frère (à elle) est drôle.<br>✅ <b>His dog is big.</b> = Son chien (à lui) est gros.' },
      { kind: 'phrasebook', title: 'Parler de sa famille 🏡', rows: [['I have a brother.', 'J’ai un frère.'], ['My sister is ten.', 'Ma sœur a dix ans.'], ['My grandmother cooks well.', 'Ma grand-mère cuisine bien.'], ['We love our pet.', 'Nous aimons notre animal.']] }
    ]
  },
  {
    id: 'days', title: 'Days & Months 📅', color: 'teal', icon: '📅', sub: 'Les jours et les mois',
    blocks: [
      { kind: 'tip', html: 'Les jours et les mois prennent une <b>grande lettre</b> en anglais, toujours ! <b>Monday</b>, pas monday. ✨' },
      { kind: 'words', cat: 'days' },
      { kind: 'words', cat: 'months_seasons' },
      { kind: 'rule', title: 'ON le jour, IN le mois 📌', html: 'On dit <b>on</b> Monday (un jour précis) et <b>in</b> July (dans un mois).<br>✅ <b>I swim on Saturday.</b> · ✅ <b>My birthday is in May.</b><br>Et pour « aujourd’hui c’est lundi » : <b>Today is Monday.</b>' },
      { kind: 'phrasebook', title: 'La semaine 🗓️', rows: [['Today is Tuesday.', 'Nous sommes mardi.'], ['I play on Wednesday.', 'Je joue le mercredi.'], ['It is the weekend!', 'C’est le week-end !'], ['What day is it?', 'On est quel jour ?']] }
    ]
  },
  {
    id: 'time', title: 'What Time Is It? ⏰', color: 'amber', icon: '⏰', sub: 'L’heure',
    blocks: [
      { kind: 'tip', html: 'Regarde l’horloge ! 🕐 En anglais on dit d’abord le chiffre, puis <b>o’clock</b> pile. « Trois heures » = <b>three o’clock</b>.' },
      { kind: 'rule', title: 'Dire l’heure 🕐', html: '<b>It’s + chiffre + o’clock</b> → It’s five o’clock. (Il est 5 h.)<br><b>half past</b> = et demie → It’s half past six. (6 h 30.)<br><b>a quarter past</b> = et quart · <b>a quarter before</b> = moins le quart<br>💡 On pose la question : <b>What time is it?</b>' },
      { kind: 'phrasebook', title: 'Ma journée ⏱️', rows: [['I get up at seven o’clock.', 'Je me lève à sept heures.'], ['I have breakfast at eight.', 'Je prends le petit-déjeuner à huit heures.'], ['School starts at nine.', 'L’école commence à neuf heures.'], ['I go to bed at nine.', 'Je vais au lit à neuf heures.']] },
      { kind: 'words', cat: 'custom', list: VERBS2.slice(0, 8), title: 'La routine 🔄' }
    ]
  },
  {
    id: 'weather', title: 'Weather & Seasons 🌦️', color: 'sea', icon: '🌦️', sub: 'La météo et les saisons',
    blocks: [
      { kind: 'tip', html: 'Pour la météo, le mot magique est <b>IT</b> : <b>It is sunny</b>, <b>It is raining</b>. Jamais « the weather is… » pour commencer ! ☀️' },
      { kind: 'words', cat: 'weather' },
      { kind: 'words', cat: 'seasons' },
      { kind: 'rule', title: 'IT + adjectif 🌤️', html: '<b>It is</b> + météo : <b>It is cold.</b> · <b>It is snowing.</b><br>Pour aimer une saison : <b>I like summer because it is hot.</b> (parce qu’il fait chaud)' },
      { kind: 'phrasebook', title: 'Quelle tenue ? 🧥', rows: [['It is raining. Take your umbrella!', 'Il pleut. Prends ton parapluie !'], ['It is cold. Wear your coat!', 'Il fait froid. Mets ton manteau !'], ['In winter, it snows.', 'En hiver, il neige.'], ['My favourite season is spring.', 'Ma saison préférée est le printemps.']] }
    ]
  },
  {
    id: 'school', title: 'At School 🏫', color: 'grape', icon: '🏫', sub: 'L’école et la classe',
    blocks: [
      { kind: 'tip', html: 'Prête pour la classe ? Écoute chaque objet scolaire. 🎒 Clique sur 🔊 !' },
      { kind: 'words', cat: 'school' },
      { kind: 'phrasebook', title: 'En classe 🙋', rows: [['Can I go to the toilet?', 'Puis-je aller aux toilettes ?'], ['I do not understand.', 'Je ne comprends pas.'], ['How do you say this in English?', 'Comment on dit ça en anglais ?'], ['Can you help me, please?', 'Peux-tu m’aider, s’il te plaît ?'], ['I have finished!', 'J’ai fini !']] },
      { kind: 'rule', title: 'CAN = pouvoir 💪', html: '<b>can</b> ne change jamais, et pas de « to » après !<br>✅ <b>I can draw. She can swim. We can fly kites.</b><br>Négatif : <b>I cannot</b> (ou <b>I can’t</b>) <b>come.</b>' },
      { kind: 'words', cat: 'custom', list: VERBS2.slice(8, 16), title: 'À l’école aussi 🎨' }
    ]
  },
  {
    id: 'town', title: 'In Town 🏪', color: 'leaf', icon: '🏪', sub: 'La ville et les directions',
    blocks: [
      { kind: 'tip', html: 'Où est la boulangerie ? 🥐 Avec <b>Where is…?</b> et les flèches, tu ne te perdras plus !' },
      { kind: 'words', cat: 'town' },
      { kind: 'rule', title: 'Où ? 🧭', html: '<b>Where is the park?</b> = Où est le parc ?<br>Réponses : <b>on the left</b> (à gauche) · <b>on the right</b> (à droite) · <b>go straight</b> (tout droit) · <b>near</b> (près de) · <b>opposite the school</b> (en face de l’école)' },
      { kind: 'phrasebook', title: 'En ville 🚶', rows: [['Where is the bakery?', 'Où est la boulangerie ?'], ['The park is near the school.', 'Le parc est près de l’école.'], ['Turn left, then go straight.', 'Tourne à gauche, puis tout droit.'], ['I want to buy bread.', 'Je veux acheter du pain.']] }
    ]
  },
  {
    id: 'feelings', title: 'Body & Feelings 💗', color: 'berry', icon: '💗', sub: 'Le corps et les émotions',
    blocks: [
      { kind: 'tip', html: 'Comment te sens-tu aujourd’hui ? 😊🤔😴 Réponds : <b>I am happy!</b> ou <b>I am tired…</b>' },
      { kind: 'words', cat: 'body_more' },
      { kind: 'words', cat: 'feelings' },
      { kind: 'rule', title: 'Mes sensations 🤒', html: 'Rappelle-toi le piège français : on dit <b>I am</b>, pas « I have » !<br>✅ <b>I am hungry.</b> (j’ai faim) · <b>I am thirsty.</b> (j’ai soif) · <b>I am nine.</b> (j’ai 9 ans)<br>Mais pour la douleur : <b>My knee hurts.</b> = Mon genou fait mal.' },
      { kind: 'phrasebook', title: 'Comment ça va ? 💬', rows: [['How are you today?', 'Comment vas-tu aujourd’hui ?'], ['I am fine, thank you!', 'Je vais bien, merci !'], ['I am sad because my cat is sick.', 'Je suis triste car mon chat est malade.'], ['She is afraid of the dark.', 'Elle a peur du noir.']] }
    ]
  },
  {
    id: 'review', title: 'Grand Quiz 🏆', color: 'gold', icon: '🏆', sub: 'La grande révision',
    blocks: [
      { kind: 'tip', html: 'Tu as parcouru tout le chemin ! 🎉 Ce niveau mélange TOUT ce que tu as appris dans les deux chapitres. Objectif : 3 étoiles ! ⭐⭐⭐' },
      { kind: 'rule', title: 'Les 4 règles d’or 🥇', html: '1️⃣ <b>WHO + ACTION + WHAT</b> : She likes cats.<br>2️⃣ <b>he/she/it → verbe + s</b> : He runs.<br>3️⃣ Négatif : <b>do not / does not</b> · Question : <b>Do…? / Does…?</b><br>4️⃣ Sensations avec <b>am/is/are</b> : I am hungry. It is cold.' }
    ]
  }
];
