/* ============================================================
   English Fun — learner app for a young French speaker
   Single-file logic. No dependencies.
   ============================================================ */
'use strict';

/* ---------- tiny helpers ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- audio: speech synthesis + WebAudio effects ---------- */
const Speech = (() => {
  let voice = null, ready = false, enabled = true;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = window.speechSynthesis.getVoices();
    voice = vs.find(v => /en[-_]GB/i.test(v.lang) && /female|kate|serena|libby|sonia/i.test(v.name))
      || vs.find(v => /en[-_]GB/i.test(v.lang))
      || vs.find(v => /^en/i.test(v.lang)) || null;
    ready = !!voice;
    const el = $('#voice-status');
    if (el) {
      if (ready) { el.textContent = '🔊 ' + voice.name; el.title = 'Les mots sont prononcés avec cette voix.'; }
      else { el.textContent = ''; el.title = ''; }   // stay quiet instead of scaring with 🔇
    }
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    // some browsers populate voices late; retry a few times
    [300, 900, 2000].forEach(ms => setTimeout(pickVoice, ms));
  }
  function say(text, opts) {
    opts = opts || {};
    if (!enabled || !('speechSynthesis' in window)) return;
    try {
      if (!voice) pickVoice();   // lazy re-pick: headless/late-voice browsers
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB'; if (voice) u.voice = voice;
      u.rate = opts.rate || 0.85; u.pitch = opts.pitch || 1.05; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* silent */ }
  }
  return { say, setEnabled: v => { enabled = v; if (!v && 'speechSynthesis' in window) window.speechSynthesis.cancel(); }, isEnabled: () => enabled, voiceName: () => voice && voice.name };
})();

const Sfx = (() => {
  let ctx = null;
  function ac() { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  function tone(freq, start, dur, type, gain) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  return {
    unlock() { ac(); },
    good() { [523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.08, 0.28, 'triangle', 0.16)); },
    great() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.07, 0.3, 'triangle', 0.15)); },
    bad() { tone(196, 0, 0.18, 'sawtooth', 0.08); tone(155, 0.13, 0.26, 'sawtooth', 0.08); },
    click() { tone(880, 0, 0.05, 'sine', 0.05); },
    star() { [1046.5, 1318.5, 1568].forEach((f, i) => tone(f, i * 0.06, 0.22, 'sine', 0.12)); },
    win() { [523.25, 587.33, 659.25, 698.46, 783.99, 880, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.35, 'triangle', 0.14)); }
  };
})();

/* ---------- persistent progress ---------- */
const Store = (() => {
  const KEY = 'english-fun-v1';
  let data = load();
  function load() {
    try { const d = JSON.parse(localStorage.getItem(KEY) || '{}'); return Object.assign({ stars: {}, badges: {}, seen: {}, totalStars: 0, soundOn: true, lastLevel: 0 }, d); }
    catch (e) { return { stars: {}, badges: {}, seen: {}, totalStars: 0, soundOn: true, lastLevel: 0 }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { } }
  return {
    get: k => data[k],
    set(k, v) { data[k] = v; save(); },
    stars(lv) { return data.stars[lv] || 0; },
    setStars(lv, n) { const old = data.stars[lv] || 0; if (n > old) { data.totalStars += (n - old); } data.stars[lv] = Math.max(old, n); data.badges[lv] = true; save(); },
    seen(id) { data.seen[id] = (data.seen[id] || 0) + 1; save(); return data.seen[id]; },
    reset() { data = { stars: {}, badges: {}, seen: {}, totalStars: 0, soundOn: data.soundOn, lastLevel: 0 }; save(); }
  };
})();

/* ============================================================
   CONTENT
   ============================================================ */
const VOCAB = {
  greetings: [
    ['hello', '👋', 'bonjour'], ['hi', '🤗', 'salut'], ['goodbye', '🚪', 'au revoir'],
    ['please', '🙏', "s'il te plaît"], ['thank you', '😊', 'merci'], ['sorry', '😔', 'pardon'],
    ['yes', '✅', 'oui'], ['no', '❌', 'non'], ['good morning', '🌅', 'bonjour (le matin)'],
    ['good night', '🌙', 'bonne nuit']
  ],
  people: [
    ['girl', '👧', 'fille'], ['boy', '👦', 'garçon'], ['woman', '👩', 'femme'], ['man', '👨', 'homme'],
    ['baby', '👶', 'bébé'], ['mother', '👩‍🦱', 'maman'], ['father', '👨‍🦱', 'papa'],
    ['friend', '🧑‍🤝‍🧑', 'ami'], ['teacher', '🧑‍🏫', 'professeur'], ['family', '👨‍👩‍👧', 'famille']
  ],
  animals: [
    ['cat', '🐱', 'chat'], ['dog', '🐶', 'chien'], ['bird', '🐦', 'oiseau'], ['fish', '🐟', 'poisson'],
    ['horse', '🐴', 'cheval'], ['cow', '🐮', 'vache'], ['sheep', '🐑', 'mouton'], ['duck', '🦆', 'canard'],
    ['mouse', '🐭', 'souris'], ['rabbit', '🐰', 'lapin'], ['lion', '🦁', 'lion'], ['bear', '🐻', 'ours']
  ],
  colors: [
    ['red', '🔴', 'rouge'], ['blue', '🔵', 'bleu'], ['green', '🟢', 'vert'], ['yellow', '🟡', 'jaune'],
    ['orange', '🟠', 'orange'], ['purple', '🟣', 'violet'], ['pink', '🌸', 'rose'], ['black', '⚫', 'noir'],
    ['white', '⚪', 'blanc'], ['brown', '🟤', 'marron']
  ],
  numbers: [['one', '1️⃣', 'un'], ['two', '2️⃣', 'deux'], ['three', '3️⃣', 'trois'], ['four', '4️⃣', 'quatre'], ['five', '5️⃣', 'cinq'], ['six', '6️⃣', 'six'], ['seven', '7️⃣', 'sept'], ['eight', '8️⃣', 'huit'], ['nine', '9️⃣', 'neuf'], ['ten', '🔟', 'dix']],
  family_home: [
    ['house', '🏠', 'maison'], ['door', '🚪', 'porte'], ['window', '🪟', 'fenêtre'], ['bed', '🛏️', 'lit'],
    ['table', '🪑', 'table'], ['book', '📖', 'livre'], ['bag', '🎒', 'sac'], ['key', '🔑', 'clé'],
    ['garden', '🌳', 'jardin'], ['kitchen', '🍳', 'cuisine']
  ],
  food: [
    ['apple', '🍎', 'pomme'], ['bread', '🍞', 'pain'], ['water', '💧', 'eau'], ['milk', '🥛', 'lait'],
    ['cheese', '🧀', 'fromage'], ['egg', '🥚', 'œuf'], ['cake', '🍰', 'gâteau'], ['banana', '🍌', 'banane'],
    ['strawberry', '🍓', 'fraise'], ['chicken', '🍗', 'poulet'], ['rice', '🍚', 'riz'], ['juice', '🧃', 'jus']
  ],
  body: [
    ['head', '🗣️', 'tête'], ['eye', '👁️', 'œil'], ['ear', '👂', 'oreille'], ['nose', '👃', 'nez'],
    ['mouth', '👄', 'bouche'], ['hand', '✋', 'main'], ['foot', '🦶', 'pied'], ['hair', '💇‍♀️', 'cheveux']
  ],
  play: [
    ['ball', '⚽', 'ballon'], ['doll', '🪆', 'poupée'], ['bike', '🚲', 'vélo'], ['kite', '🪁', 'cerf-volant'],
    ['song', '🎵', 'chanson'], ['game', '🎮', 'jeu'], ['toy', '🧸', 'jouet'], ['drawing', '🖍️', 'dessin']
  ],
  nature: [
    ['sun', '☀️', 'soleil'], ['moon', '🌙', 'lune'], ['star', '⭐', 'étoile'], ['tree', '🌳', 'arbre'],
    ['flower', '🌸', 'fleur'], ['rain', '🌧️', 'pluie'], ['sea', '🌊', 'mer'], ['sky', '🌌', 'ciel']
  ]
};

const VERBS = [
  ['eat', '🍽️', 'manger'], ['drink', '🥤', 'boire'], ['see', '👀', 'voir'], ['like', '❤️', 'aimer'],
  ['want', '🙋', 'vouloir'], ['have', '🤲', 'avoir'], ['play', '🎮', 'jouer'], ['run', '🏃‍♀️', 'courir'],
  ['jump', '🤸‍♀️', 'sauter'], ['sleep', '😴', 'dormir'], ['read', '📖', 'lire'], ['write', '✍️', 'écrire'],
  ['sing', '🎤', 'chanter'], ['dance', '💃', 'danser'], ['swim', '🏊‍♀️', 'nager'], ['walk', '🚶‍♀️', 'marcher'],
  ['open', '🔓', 'ouvrir'], ['close', '🔒', 'fermer'], ['give', '🤲', 'donner'], ['help', '🤝', 'aider']
];

/* word chips used to build sentences: text -> emoji */
const CHIP = {
  I: '🙋', you: '🫵', he: '👦', she: '👧', we: '👨‍👩‍👧', they: '👨‍👩‍👧‍👦',
  a: '📦', an: '📦', the: '📌', my: '💖', your: '🎁', 'not': '🚫', do: '❓', does: '❓', is: '🟦', are: '🟦', am: '🟦',
  cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐟', apple: '🍎', cake: '🍰', book: '📖', ball: '⚽', milk: '🥛', water: '💧',
  bread: '🍞', banana: '🍌', orange: '🟠', red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡', big: '🐘', small: '🐜',
  happy: '😊', sad: '😢', eat: '🍽️', drink: '🥤', see: '👀', like: '❤️', want: '🙋', have: '🤲', play: '🎮',
  read: '📖', sing: '🎤', dance: '💃', jump: '🤸‍♀️', run: '🏃‍♀️', sleep: '😴', open: '🔓', close: '🔒', help: '🤝',
  'an': '📦', 'very': '✨', 'too': '➕', 'and': '➕', 'yes': '✅', 'no': '❌', 'please': '🙏', 'here': '📍',
  'it': '🔎', 'what': '❓', 'where': '🗺️', 'who': '🕵️', 'how': '🔧', 'many': '🔢', 'old': '🕰️', 'name': '🏷️',
  'called': '🏷️', 'years': '🎂', 'today': '📅', 'morning': '🌅', 'night': '🌙', 'friend': '🧑‍🤝‍🧑', 'teacher': '🧑‍🏫',
  'girl': '👧', 'boy': '👦', 'mother': '👩', 'father': '👨', 'house': '🏠', 'garden': '🌳', 'sun': '☀️', 'moon': '🌙',
  'star': '⭐', 'tree': '🌳', 'flower': '🌸', 'sea': '🌊', 'sky': '🌌', 'song': '🎵', 'game': '🎮', 'toy': '🧸',
  'bike': '🚲', 'kite': '🪁', 'doll': '🪆', 'mouse': '🐭', 'rabbit': '🐰', 'lion': '🦁', 'bear': '🐻', 'duck': '🦆',
  'horse': '🐴', 'cow': '🐮', 'sheep': '🐑', 'cheese': '🧀', 'egg': '🥚', 'chicken': '🍗', 'rice': '🍚', 'juice': '🧃',
  'strawberry': '🍓', 'purple': '🟣', 'pink': '🌸', 'black': '⚫', 'white': '⚪', 'brown': '🟤', 'one': '1️⃣', 'two': '2️⃣',
  'three': '3️⃣', 'four': '4️⃣', 'five': '5️⃣', 'nice': '😇', 'little': '🐣', 'good': '👍', 'bad': '👎', 'hot': '🔥',
  'cold': '🧊', 'new': '✨', 'my': '💖', 'am': '🟦', 'is': '🟦', 'are': '🟦', 'do': '❓', 'does': '❓', 'a': '📦', 'an': '📦', 'the': '📌'
};
const chipEmoji = w => CHIP[w.toLowerCase()] || '🔤';

/* ---------- lessons (learning pages) ---------- */
const LESSONS = [
  {
    id: 'greetings', title: 'Hello! 👋', color: 'coral', icon: '👋', sub: 'Saluer et être poli',
    blocks: [
      { kind: 'tip', html: 'En anglais, on dit <b>bonjour</b> de la même façon le matin et l’après-midi : <b>Hello!</b> 🎉 Clique sur chaque mot pour l’entendre.' },
      { kind: 'words', cat: 'greetings' },
      { kind: 'dialogue', title: 'Petit dialogue — écoute !', lines: [['👩‍🏫', 'Hello!', 'Bonjour !'], ['👧', 'Hello!', 'Bonjour !'], ['👩‍🏫', 'What is your name?', 'Comment t’appelles-tu ?'], ['👧', 'My name is Léa.', 'Je m’appelle Léa.'], ['👩‍🏫', 'Nice to meet you!', 'Enchantée !'], ['👧', 'Thank you!', 'Merci !']] },
      { kind: 'rule', title: 'Le petit + magique ✨', html: 'Anglais : <b>I <u>am</u> Léa.</b> → Français : <b>Je <u>suis</u> Léa.</b><br>Le verbe est tout court. Et après <b>I</b>, on utilise toujours <b>am</b>.' }
    ]
  },
  {
    id: 'people', title: 'People 👧', color: 'teal', icon: '👧', sub: 'Les personnes',
    blocks: [
      { kind: 'tip', html: 'Une seule règle à retenir : un nom tout seul prend <b>a</b> devant lui. <b>a girl</b> = une fille.' },
      { kind: 'words', cat: 'people' },
      { kind: 'rule', title: 'a ou an ? 🤔', html: '<b>a</b> devant un son de consonne : <b>a girl</b>, <b>a cat</b>, <b>a dog</b>.<br><b>an</b> devant un son de voyelle (a, e, i, o, u) : <b>an apple</b>, <b>an egg</b>, <b>an orange</b>.<br>💡 Astuce : si tu entends une voyelle, dis <b>an</b>.' },
      { kind: 'words', cat: 'family_home', title: 'À la maison 🏠' }
    ]
  },
  {
    id: 'animals', title: 'Animals 🐶', color: 'amber', icon: '🐾', sub: 'Les animaux',
    blocks: [
      { kind: 'tip', html: 'Les animaux sont mes amis ! Écoute bien comment chaque mot se prononce. 🐱' },
      { kind: 'words', cat: 'animals' },
      { kind: 'rule', title: 'Un animal = a / an 🐾', html: '<b>a cat</b> 🐱 · <b>a dog</b> 🐶 · <b>an elephant</b> 🐘<br>Le pluriel est facile : on ajoute <b>s</b> ! <b>cat → cats</b>, <b>dog → dogs</b>. Pas de « x », pas de changement bizarre.' }
    ]
  },
  {
    id: 'colours', title: 'Colours & Numbers 🌈', color: 'grape', icon: '🌈', sub: 'Couleurs et nombres',
    blocks: [
      { kind: 'tip', html: 'Super nouvelle : en anglais la couleur se place <b>AVANT</b> le nom, comme en français ! <b>a red ball</b> = un ballon rouge.' },
      { kind: 'words', cat: 'colors' },
      { kind: 'words', cat: 'numbers' },
      { kind: 'rule', title: 'La place des mots 📚', html: '<b>a</b> + <b>couleur</b> + <b>nom</b><br>→ <b>a blue bird</b> 🐦💙 = un oiseau bleu<br>→ <b>a green frog</b> 🐸💚 = une grenouille verte<br>Compte avec moi : <b>one, two, three… ten!</b> 🔟' }
    ]
  },
  {
    id: 'food', title: 'Food & Drink 🍎', color: 'leaf', icon: '🍎', sub: 'Manger et boire',
    blocks: [
      { kind: 'tip', html: 'J’ai faim ! En anglais <b>I like</b> = j’aime (les choses) et <b>I want</b> = je veux. 🍽️' },
      { kind: 'words', cat: 'food' },
      { kind: 'phrasebook', title: 'Au goûter 🧃', rows: [['I like apples.', 'J’aime les pommes.'], ['I want a cake.', 'Je veux un gâteau.'], ['I drink water.', 'Je bois de l’eau.'], ['I eat bread.', 'Je mange du pain.'], ['Do you like cheese?', 'Aimes-tu le fromage ?'], ['Yes, please!', 'Oui, s’il te plaît !']] }
    ]
  },
  {
    id: 'verbs', title: 'Verbs 🏃‍♀️', color: 'sea', icon: '🏃‍♀️', sub: 'Les actions',
    blocks: [
      { kind: 'tip', html: 'Le verbe anglais ne change presque jamais. Regarde : <b>I play, you play, we play…</b> Toujours pareil ! Sauf un petit détail avec <b>he/she</b> 😉' },
      { kind: 'words', cat: 'custom', list: VERBS.slice(0, 12), title: 'Actions 🎬' },
      { kind: 'rule', title: 'Le S de la troisième personne 🦁', html: 'Avec <b>he</b> (il), <b>she</b> (elle), <b>it</b> (ça) → on ajoute <b>s</b> au verbe.<br>✅ <b>She like<u>s</u> cats.</b> ❌ She like cats.<br>Avec <b>I / you / we / they</b> → pas de <b>s</b> : <b>I like cats.</b>' },
      { kind: 'words', cat: 'custom', list: VERBS.slice(12), title: 'Encore des actions 🎭' }
    ]
  },
  {
    id: 'sentences', title: 'Sentences 🧱', color: 'berry', icon: '🧱', sub: 'Construire des phrases',
    blocks: [
      { kind: 'tip', html: 'Une phrase anglaise, c’est un mur de briques : toujours dans le même ordre. 🧱' },
      { kind: 'rule', title: 'L’ordre magique 🪄', html: '<div class="formula"><span class="tok who">WHO</span> + <span class="tok act">ACTION</span> + <span class="tok what">WHAT</span></div><br><b>She</b> (qui) + <b>likes</b> (action) + <b>cats</b> (quoi).<br><b>I</b> + <b>eat</b> + <b>an apple</b>.<br>⚠️ Oublie le « il y a » : on dit <b>There is a cat</b>, jamais « It has a cat ».' },
      { kind: 'phrasebook', title: 'Négation 🚫', rows: [['I <b>do not</b> like fish.', "Je n'aime pas le poisson."], ['She <b>does not</b> eat meat.', 'Elle ne mange pas de viande.'], ['I <b>don’t</b> want that.', "Je ne veux pas ça."], ['He <b>doesn’t</b> run fast.', 'Il ne court pas vite.']] },
      { kind: 'phrasebook', title: 'Les questions ❓', rows: [['<b>Do</b> you like dogs?', 'Aimes-tu les chiens ?'], ['<b>Does</b> she swim?', 'Est-ce qu’elle nage ?'], ['<b>What</b> is this?', 'Qu’est-ce que c’est ?'], ['<b>Where</b> is my bag?', 'Où est mon sac ?'], ['How <b>many</b> cats?', 'Combien de chats ?']] },
      { kind: 'rule', title: 'Beaucoup ou beaucoup trop ? 🔢', html: 'On peut compter (cats, apples) → <b>many</b> : <b>many cats</b>.<br>On ne peut pas compter (water, milk) → <b>much</b> : <b>much water</b>.' }
    ]
  },
  {
    id: 'describe', title: 'Describe & Chat 💬', color: 'gold', icon: '💬', sub: 'Parler de soi',
    blocks: [
      { kind: 'tip', html: 'Tu vas pouvoir te présenter toute seule ! Répète à voix haute après le son. 🎤' },
      { kind: 'phrasebook', title: 'Se présenter 🙋‍♀️', rows: [['My name is Léa.', 'Je m’appelle Léa.'], ['I am nine years old.', 'J’ai neuf ans.'], ['I live in France.', 'J’habite en France.'], ['I have a sister.', 'J’ai une sœur.'], ['I like drawing.', "J'aime dessiner."], ['My favourite colour is pink.', 'Ma couleur préférée est le rose.']] },
      { kind: 'phrasebook', title: 'Décrire 🎨', rows: [['The cat is <b>big</b>.', 'Le chat est gros.'], ['The flower is <b>small</b>.', 'La fleur est petite.'], ['Today it is <b>hot</b>.', 'Aujourd’hui il fait chaud.'], ['My bag is <b>new</b>.', 'Mon sac est neuf.'], ['She is <b>happy</b>.', 'Elle est contente.']] },
      { kind: 'rule', title: 'Attention aux pièges ! 🪤', html: '🇫🇷 J’ai faim → 🇬🇧 I <b>am</b> hungry (littéralement « je suis affamée »).<br>🇫🇷 J’ai 9 ans → 🇬🇧 I <b>am</b> nine.<br>🇫🇷 Je vais à l’école → 🇬🇧 I <b>go</b> to school.<br>Mots qui se ressemblent mais ne veulent pas dire la même chose : <b>actually</b> = en fait (pas « actuellement »).' }
    ]
  }
];

/* ---------- exercise generators per level ---------- */
function mkMatch(pairs, n) {
  const ps = shuffle(pairs).slice(0, n);
  return { type: 'match', prompt: 'Relie le mot anglais à sa traduction 🧩', pairs: ps.map(p => ({ left: p[0], emoji: p[1], right: p[2] })) };
}
function mkListen(items, n) {
  const its = shuffle(items).slice(0, n);
  return {
    type: 'listen', prompt: 'Écoute bien, puis clique sur le bon dessin 👂',
    items: its.map(it => ({ speak: it[0], answer: it[0], emoji: it[1], hint: it[2], distractors: shuffle(items.filter(x => x[0] !== it[0])).slice(0, 3).map(d => ({ label: d[1], value: d[0] })) }))
      .map(o => Object.assign({}, o, { options: shuffle([{ label: o.emoji, value: o.answer }].concat(o.distractors)) }))
  };
}
function mkChoice(qs) {
  return { type: 'choice', prompt: 'Choisis la bonne réponse ✅', items: qs.map(q => Object.assign({}, q, { options: shuffle(q.options) })) };
}
function mkOrder(items) {
  return { type: 'order', prompt: 'Remets les mots dans le bon ordre 🧱', items: items.map(it => ({ words: it.en.split(' '), answer: it.en, fr: it.fr, speak: it.en })) };
}
function mkBuild(items) {
  return { type: 'build', prompt: 'Fabrique la phrase anglaise avec les briques 🏗️', items: items.map(it => ({ target: it.en, fr: it.fr, speak: it.en, extra: it.extra || [] })) };
}
function mkCount(items) {
  return { type: 'count', prompt: 'Compte et réponds en anglais 🔢', items: items.map(i => Object.assign({}, i, { options: shuffle(i.options) })) };
}

const EXERCISES = {
  greetings: () => [
    mkMatch(VOCAB.greetings, 5),
    mkListen(VOCAB.greetings.map(g => [g[0], g[1], g[2]]), 4),
    mkChoice([
      { ask: '👋 On dit bonjour. Quel mot ?', speak: 'hello', options: ['Hello', 'Goodbye', 'Sorry', 'No'], answer: 'Hello' },
      { ask: '🚪 Tu pars. Tu dis…', speak: 'goodbye', options: ['Thank you', 'Goodbye', 'Please', 'Yes'], answer: 'Goodbye' },
      { ask: '😊 On te donne un cadeau, tu dis…', speak: 'thank you', options: ['Sorry', 'Hello', 'Thank you', 'No'], answer: 'Thank you' },
      { ask: '🙏 Tu demandes quelque chose, tu dis…', speak: 'please', options: ['Please', 'Good night', 'Hi', 'Bye'], answer: 'Please' }
    ]),
    mkChoice([
      { ask: '« Je m’appelle Emma » = …', speak: 'My name is Emma', options: ['My name is Emma', 'I am called Emma', 'You name Emma', 'My name Emma'], answer: 'My name is Emma' },
      { ask: '« Merci beaucoup » = …', speak: 'thank you very much', options: ['please very much', 'thank you very much', 'thanks no', 'sorry very much'], answer: 'thank you very much' }
    ])
  ],
  people: () => [
    mkMatch(VOCAB.people, 6),
    mkChoice([
      { ask: '___ apple 🍎', speak: 'an apple', options: ['an', 'a', 'the one', '—'], answer: 'an' },
      { ask: '___ cat 🐱', speak: 'a cat', options: ['an', 'a', 'is', 'am'], answer: 'a' },
      { ask: '___ egg 🥚', speak: 'an egg', options: ['a', 'an', 'your', 'the'], answer: 'an' },
      { ask: '___ boy 👦', speak: 'a boy', options: ['an', 'a', 'are', 'is'], answer: 'a' },
      { ask: '___ orange 🍊', speak: 'an orange', options: ['an', 'a', 'am', 'do'], answer: 'an' }
    ]),
    mkMatch(VOCAB.family_home, 5),
    mkOrder([
      { en: 'I am a girl', fr: 'Je suis une fille' },
      { en: 'She is my mother', fr: 'Elle est ma maman' },
      { en: 'He is my friend', fr: 'C’est mon ami' }
    ])
  ],
  animals: () => [
    mkMatch(VOCAB.animals, 6),
    mkListen(VOCAB.animals.map(a => [a[0], a[1], a[2]]), 5),
    mkChoice([
      { ask: '🐱 C’est un…', speak: 'cat', options: ['cat', 'dog', 'cow', 'duck'], answer: 'cat' },
      { ask: '🦁 Le lion se dit…', speak: 'lion', options: ['lion', 'bear', 'mouse', 'horse'], answer: 'lion' },
      { ask: 'Pluriel : two ___ (chats)', speak: 'two cats', options: ['cats', 'cat', 'cates', 'catss'], answer: 'cats' },
      { ask: 'Pluriel : three ___ (chiens)', speak: 'three dogs', options: ['dogs', 'dog', 'doges', 'dogz'], answer: 'dogs' },
      { ask: '🐭 Une souris = …', speak: 'mouse', options: ['mouse', 'moose', 'house', 'louse'], answer: 'mouse' }
    ]),
    mkBuild([
      { en: 'I like cats', fr: "J'aime les chats", extra: ['dogs', 'not'] },
      { en: 'The dog is big', fr: 'Le chien est gros', extra: ['small', 'are'] },
      { en: 'She has a rabbit', fr: 'Elle a un lapin', extra: ['have', 'an'] }
    ])
  ],
  colours: () => [
    mkMatch(VOCAB.colors, 6),
    mkCount([
      { q: 'Combien d’étoiles ? ⭐⭐⭐', speak: 'three', answer: 'three', options: ['three', 'two', 'four', 'five'] },
      { q: 'Combien de cœurs ? ❤️❤️❤️❤️❤️', speak: 'five', answer: 'five', options: ['four', 'five', 'three', 'ten'] },
      { q: 'Combien de ballons ? 🎈🎈', speak: 'two', answer: 'two', options: ['one', 'two', 'six', 'three'] },
      { q: 'Combien de fleurs ? 🌸🌸🌸🌸', speak: 'four', answer: 'four', options: ['four', 'five', 'two', 'nine'] }
    ]),
    mkChoice([
      { ask: '🔴 = …', speak: 'red', options: ['red', 'blue', 'green', 'pink'], answer: 'red' },
      { ask: '🟣 = …', speak: 'purple', options: ['brown', 'purple', 'black', 'yellow'], answer: 'purple' },
      { ask: 'un oiseau bleu = …', speak: 'a blue bird', options: ['a blue bird', 'blue a bird', 'a bird blue', 'the blue'], answer: 'a blue bird' },
      { ask: 'une pomme rouge = …', speak: 'a red apple', options: ['a red apple', 'red an apple', 'an apple red', 'an red apple'], answer: 'a red apple' }
    ]),
    mkOrder([
      { en: 'I see two birds', fr: 'Je vois deux oiseaux' },
      { en: 'The cat is black', fr: 'Le chat est noir' },
      { en: 'I have five apples', fr: 'J’ai cinq pommes' }
    ])
  ],
  food: () => [
    mkMatch(VOCAB.food, 6),
    mkListen(VOCAB.food.map(f => [f[0], f[1], f[2]]), 5),
    mkChoice([
      { ask: '🍞 J’ai faim, je veux du…', speak: 'bread', options: ['bread', 'milk', 'water', 'egg'], answer: 'bread' },
      { ask: '💧 J’ai soif, je bois de l’…', speak: 'water', options: ['water', 'cheese', 'rice', 'cake'], answer: 'water' },
      { ask: '« Je mange une pomme » = …', speak: 'I eat an apple', options: ['I eat an apple', 'I drink an apple', 'I eats an apple', 'An apple I eat'], answer: 'I eat an apple' },
      { ask: '« Je veux du lait » = …', speak: 'I want milk', options: ['I want milk', 'I wants milk', 'I milk want', 'You want milk'], answer: 'I want milk' },
      { ask: 'Beaucoup d’eau = …', speak: 'much water', options: ['much water', 'many water', 'many waters', 'much waters'], answer: 'much water' }
    ]),
    mkBuild([
      { en: 'I like cake', fr: "J'aime le gâteau", extra: ['eat', 'not', 'water'] },
      { en: 'Do you like eggs', fr: 'Aimes-tu les œufs ?', extra: ['does', 'are', 'likes'] },
      { en: 'She drinks milk', fr: 'Elle boit du lait', extra: ['drink', 'eat', 'want'] }
    ])
  ],
  verbs: () => [
    mkMatch(VERBS.slice(0, 8), 6),
    mkChoice([
      { ask: 'She ___ cats. (aimer)', speak: 'She likes cats', options: ['likes', 'like', 'liking', 'is like'], answer: 'likes' },
      { ask: 'I ___ a dog. (avoir)', speak: 'I have a dog', options: ['have', 'has', 'am', 'having'], answer: 'have' },
      { ask: 'He ___ fast. (courir)', speak: 'He runs fast', options: ['runs', 'run', 'running', 'is run'], answer: 'runs' },
      { ask: 'They ___ songs. (chanter)', speak: 'They sing songs', options: ['sing', 'sings', 'singing', 'sang'], answer: 'sing' },
      { ask: 'My mother ___ books. (lire)', speak: 'My mother reads books', options: ['reads', 'read', 'reading', 'is read'], answer: 'reads' },
      { ask: 'We ___ in the garden. (jouer)', speak: 'We play in the garden', options: ['play', 'plays', 'playing', 'are play'], answer: 'play' }
    ]),
    mkListen(VERBS.map(v => [v[0], v[1], v[2]]), 5),
    mkBuild([
      { en: 'I can swim', fr: 'Je sais nager', extra: ['am', 'eats', 'the'] },
      { en: 'He does not sleep', fr: 'Il ne dort pas', extra: ['do', 'sleeps', 'are'] },
      { en: 'She opens the door', fr: 'Elle ouvre la porte', extra: ['open', 'close', 'are'] }
    ])
  ],
  sentences: () => [
    mkOrder([
      { en: 'She likes the red ball', fr: 'Elle aime le ballon rouge' },
      { en: 'I do not like fish', fr: "Je n'aime pas le poisson" },
      { en: 'Do you want an apple', fr: 'Veux-tu une pomme ?' },
      { en: 'The bird is on the tree', fr: "L'oiseau est sur l'arbre" }
    ]),
    mkChoice([
      { ask: 'Négatif de « I like dogs » :', speak: 'I do not like dogs', options: ['I do not like dogs', 'I not like dogs', 'I does not like dogs', 'No I like dogs'], answer: 'I do not like dogs' },
      { ask: 'Question avec she :', speak: 'Does she run', options: ['Does she run?', 'Do she run?', 'Is she run?', 'Run she?'], answer: 'Does she run?' },
      { ask: 'Où est mon sac ?', speak: 'Where is my bag', options: ['Where is my bag?', 'Where my bag is?', 'What is my bag?', 'Who is my bag?'], answer: 'Where is my bag?' },
      { ask: 'Combien de chiens ?', speak: 'How many dogs', options: ['How many dogs?', 'How much dogs?', 'How many dog?', 'What many dogs?'], answer: 'How many dogs?' },
      { ask: '« Il y a un chat » =', speak: 'There is a cat', options: ['There is a cat', 'It has a cat', 'There are a cat', 'Is a cat'], answer: 'There is a cat' }
    ]),
    mkBuild([
      { en: 'Does he like cake', fr: 'Aime-t-il le gâteau ?', extra: ['do', 'likes', 'is'] },
      { en: 'We do not want that', fr: 'Nous ne voulons pas ça', extra: ['does', 'wants', 'no'] },
      { en: 'What is your name', fr: 'Comment t’appelles-tu ?', extra: ['who', 'where', 'how'] }
    ]),
    mkMatch([['there is', '📍', 'il y a (un)'], ['there are', '📍📍', 'il y a (plusieurs)'], ['how many', '🔢', 'combien'], ['where', '🗺️', 'où'], ['because', '💡', 'parce que'], ['very', '✨', 'très']], 6)
  ],
  describe: () => [
    mkChoice([
      { ask: '« J’ai neuf ans » =', speak: 'I am nine years old', options: ['I am nine years old', 'I have nine years', 'I am nine year', 'You are nine'], answer: 'I am nine years old' },
      { ask: '« J’ai faim » =', speak: 'I am hungry', options: ['I am hungry', 'I have hungry', 'I hungry', 'You are hungry'], answer: 'I am hungry' },
      { ask: 'Ma couleur préférée est le rose :', speak: 'My favourite colour is pink', options: ['My favourite colour is pink', 'My colour favourite is pink', 'I favourite pink', 'My favourite is colour pink'], answer: 'My favourite colour is pink' },
      { ask: '« J’habite en France » =', speak: 'I live in France', options: ['I live in France', 'I live at France', 'I am live France', 'My live is France'], answer: 'I live in France' },
      { ask: '« actually » veut dire…', speak: 'actually means in fact', options: ['en fait', 'actuellement', 'à l’école', 'exactement'], answer: 'en fait' }
    ]),
    mkOrder([
      { en: 'My name is Léa', fr: 'Je m’appelle Léa' },
      { en: 'I live in France', fr: 'J’habite en France' },
      { en: 'My favourite animal is the cat', fr: 'Mon animal préféré est le chat' }
    ]),
    mkBuild([
      { en: 'The flower is small', fr: 'La fleur est petite', extra: ['big', 'are', 'the'] },
      { en: 'Today it is hot', fr: 'Aujourd’hui il fait chaud', extra: ['cold', 'am', 'today'] },
      { en: 'I have a little sister', fr: 'J’ai une petite sœur', extra: ['has', 'big', 'brother'] }
    ]),
    mkMatch([['hungry', '🍽️', 'qui a faim'], ['thirsty', '🥤', 'qui a soif'], ['happy', '😊', 'content'], ['tired', '🥱', 'fatigué'], ['clever', '🧠', 'intelligent'], ['sleepy', '😪', 'somnolent']], 6)
  ]
};

/* ============================================================
   ENGINE
   ============================================================ */
const LEVELS = LESSONS.map((l, i) => ({ id: l.id, title: l.title, icon: l.icon, sub: l.sub, color: l.color, lesson: l, exos: EXERCISES[l.id] }));

const App = (() => {
  let state = { level: 0, view: 'map', session: null };

  /* ---------- map screen ---------- */
  function renderMap() {
    const wrap = $('#screen');
    const total = Store.get('totalStars') || 0;
    wrap.innerHTML = `
      <div class="hero">
        <div class="hero-emoji">🦉</div>
        <div>
          <h1 class="hero-title">English Fun!</h1>
          <p class="hero-sub">Apprends l’anglais en jouant, petit à petit. Clique sur 🔊 pour entendre les mots !</p>
        </div>
      </div>
      <div class="level-grid">
        ${LEVELS.map((lv, i) => {
      const st = Store.stars(lv.id);
      const locked = i > 0 && Store.stars(LEVELS[i - 1].id) === 0 && st === 0;
      return `
          <button class="level-card ${lv.color} ${locked ? 'locked' : ''}" data-level="${i}" ${locked ? 'disabled' : ''}>
            <span class="lc-icon">${locked ? '🔒' : lv.icon}</span>
            <span class="lc-body">
              <span class="lc-title">${esc(lv.title)}</span>
              <span class="lc-sub">${esc(lv.sub)}</span>
              <span class="lc-stars">${st ? '⭐'.repeat(st) : '<em>' + (locked ? 'termine le niveau précédent' : 'commence ici') + '</em>'}</span>
            </span>
          </button>`;
    }).join('')}
      </div>
      <div class="map-foot">
        <button class="btn ghost" id="btn-reset">🧹 Recommencer à zéro</button>
      </div>`;
    $$('.level-card', wrap).forEach(b => b.addEventListener('click', () => openLevel(+b.dataset.level, 'lesson')));
    $('#btn-reset').addEventListener('click', () => {
      if (confirm('Effacer toute ta progression et toutes tes étoiles ?')) { Store.reset(); renderMap(); }
    });
  }

  function openLevel(i, view) {
    Sfx.unlock();
    state.level = i; state.view = view; Store.set('lastLevel', i);
    if (view === 'lesson') renderLesson(i);
    else startSession(i);
  }

  /* ---------- lesson screen ---------- */
  function renderLesson(i) {
    const lv = LEVELS[i];
    const wrap = $('#screen');
    wrap.innerHTML = `
      <div class="topbar">
        <button class="btn back" id="btn-back">⬅️ Menu</button>
        <div class="crumb">${esc(lv.title)}</div>
        <div class="hud"><span id="hud-stars">⭐ ${Store.get('totalStars') || 0}</span></div>
      </div>
      <div class="lesson-page ${lv.color}-soft">
        ${lv.lesson.blocks.map(blockHTML).join('')}
        <div class="lesson-cta">
          <button class="btn big primary" id="btn-start">🎮 Jouer aux exercices</button>
        </div>
      </div>`;
    wireBlocks(wrap);
    $('#btn-back').addEventListener('click', renderMap);
    $('#btn-start').addEventListener('click', () => startSession(i));
  }

  function blockHTML(b) {
    if (b.kind === 'tip') return `<div class="tip">💡 ${b.html}</div>`;
    if (b.kind === 'rule') return `<div class="rule"><h3>${esc(b.title)}</h3><div class="rule-body">${b.html}</div></div>`;
    if (b.kind === 'words') {
      const list = b.cat === 'custom' ? b.list : VOCAB[b.cat];
      return `<div class="wordset"><h3>${esc(b.title || catTitle(b.cat))}</h3>
        <div class="word-grid">${list.map(w => `
          <button class="word-card" data-say="${esc(w[0])}">
            <span class="wc-emoji">${w[1]}</span>
            <span class="wc-en">${esc(w[0])}</span>
            <span class="wc-fr">${esc(w[2])}</span>
            <span class="wc-sp">🔊</span>
          </button>`).join('')}</div></div>`;
    }
    if (b.kind === 'phrasebook') {
      return `<div class="rule"><h3>${esc(b.title)}</h3><div class="pb">${b.rows.map(r => `
        <button class="pb-row" data-say="${esc(stripTags(r[0]))}">
          <span class="pb-en">${r[0]}</span><span class="pb-fr">${esc(r[1])}</span><span class="pb-sp">🔊</span>
        </button>`).join('')}</div></div>`;
    }
    if (b.kind === 'dialogue') {
      return `<div class="rule"><h3>${esc(b.title)}</h3><div class="dlg">${b.lines.map(l => `
        <button class="dlg-row" data-say="${esc(l[1])}"><span class="dlg-who">${l[0]}</span><span class="dlg-bubble"><b>${esc(l[1])}</b><i>${esc(l[2])}</i></span><span class="pb-sp">🔊</span></button>`).join('')}</div></div>`;
    }
    return '';
  }
  const stripTags = s => String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
  function catTitle(c) { return ({ greetings: 'Salutations 👋', people: 'Les personnes 🧑‍🤝‍🧑', animals: 'Les animaux 🐾', colors: 'Les couleurs 🎨', numbers: 'Les nombres 🔢', family_home: 'À la maison 🏠', food: 'À table 🍎', body: 'Le corps 🙋', play: 'Pour jouer 🧸', nature: 'La nature 🌳' }[c] || ''); }

  function wireBlocks(root) {
    $$('[data-say]', root).forEach(el => el.addEventListener('click', () => { Sfx.click(); Speech.say(el.dataset.say); }));
  }

  /* ---------- game session ---------- */
  function startSession(i) {
    const lv = LEVELS[i];
    let sets;   // regenerate until no two sets share an item signature (keeps question keys unambiguous)
    const sig = s => s.type === 'match' ? s.pairs.map(p => p.left).sort().join('|')
      : (s.items || []).map(it => it.ask || it.q || it.fr || it.hint || '').sort().join('|');
    for (let tries = 0; tries < 60; tries++) {
      sets = shuffle(lv.exos()).slice(0, 4);
      const seen = new Set(); let dup = false;
      for (const s of sets) { const k = sig(s); if (seen.has(k)) { dup = true; break; } seen.add(k); }
      if (!dup) break;
    }
    state.session = { levelId: lv.id, sets, idx: 0, correct: 0, answered: 0, total: sets.reduce((n, s) => n + (s.items ? s.items.length : s.pairs.length), 0) };
    renderSet();
  }

  /* visible-item registry: each game mode registers the item currently on screen */
  function markVisible(item) { window.__visibleItem = item; }

  function renderSet() {
    const s = state.session;
    const set = s.sets[s.idx];
    const lv = LEVELS[state.level];
    const wrap = $('#screen');
    wrap.innerHTML = `
      <div class="topbar">
        <button class="btn back" id="btn-quit">⬅️ Quitter</button>
        <div class="crumb">${esc(lv.title)} · exercice ${s.idx + 1}/${s.sets.length}</div>
        <div class="hud"><span class="pill">✅ ${s.correct}</span><span class="pill">⭐ ${Store.get('totalStars') || 0}</span></div>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${(s.answered / s.total) * 100}%"></div></div>
      <h2 class="set-prompt">${esc(set.prompt)}</h2>
      <div id="play"></div>`;
    $('#btn-quit').addEventListener('click', renderMap);
    const play = $('#play');
    window.__currentSet = set; /* test hook: live answer keys */
    if (set.type === 'match') playMatch(play, set);
    else if (set.type === 'listen') playListen(play, set);
    else if (set.type === 'choice') playChoice(play, set);
    else if (set.type === 'order') playOrder(play, set);
    else if (set.type === 'build') playBuild(play, set);
    else if (set.type === 'count') playCount(play, set);
  }

  function finishSet(okAll) {
    const s = state.session;
    s.idx++;
    if (s.idx >= s.sets.length) return finishSession();
    setTimeout(renderSet, okAll ? 700 : 0);
  }

  function finishSession() {
    const s = state.session;
    const pct = s.total ? s.correct / s.total : 0;
    const stars = pct >= 0.9 ? 3 : pct >= 0.65 ? 2 : 1;
    Store.setStars(s.levelId, stars);
    Sfx.win();
    confetti(stars >= 3 ? 90 : 45);
    const lv = LEVELS[state.level];
    const next = LEVELS[state.level + 1];
    $('#screen').innerHTML = `
      <div class="result">
        <div class="result-emoji">${stars === 3 ? '🏆' : stars === 2 ? '🎉' : '👏'}</div>
        <h2>${pick(['Bravo !', 'Génial !', 'Super !', 'Championne !', 'Incroyable !'])}</h2>
        <div class="result-stars">${[1, 2, 3].map(n => `<span class="rstar ${n <= stars ? 'on' : ''}">⭐</span>`).join('')}</div>
        <p class="result-score">Tu as eu <b>${s.correct}</b> bonnes réponses sur <b>${s.total}</b>.</p>
        <div class="result-actions">
          <button class="btn primary" id="btn-again">🔁 Rejouer ce niveau</button>
          <button class="btn ghost" id="btn-next-lv">${next ? '➡️ Niveau suivant' : '🏠 Menu'}</button>
        </div>
      </div>`;
    $('#btn-again').addEventListener('click', () => startSession(state.level));
    $('#btn-next-lv').addEventListener('click', () => { if (next) openLevel(state.level + 1, 'lesson'); else renderMap(); });
  }

  /* ----- mode: match pairs ----- */
  function playMatch(root, set) {
    const lefts = shuffle(set.pairs), rights = shuffle(set.pairs);
    root.innerHTML = `<div class="match-wrap">
      <div class="match-col">${lefts.map(p => `<button class="tile tile-en" data-side="L" data-key="${esc(p.left)}"><span class="t-emoji">${p.emoji}</span>${esc(p.left)}<span class="pb-sp">🔊</span></button>`).join('')}</div>
      <div class="match-col">${rights.map(p => `<button class="tile tile-fr" data-side="R" data-key="${esc(p.right)}">${esc(p.right)}</button>`).join('')}</div>
    </div>`;
    let sel = null;
    $$('.tile', root).forEach(t => t.addEventListener('click', () => {
      if (t.classList.contains('done')) return;
      Sfx.click();
      if (t.dataset.side === 'L') Speech.say(t.dataset.key);
      if (!sel) { sel = t; t.classList.add('sel'); return; }
      if (sel === t) { t.classList.remove('sel'); sel = null; return; }
      if (sel.dataset.side === t.dataset.side) { sel.classList.remove('sel'); sel = t; t.classList.add('sel'); return; }
      const a = sel, b = t;
      const pair = set.pairs.find(p => p.left === a.dataset.key && p.right === b.dataset.key);
      a.classList.remove('sel'); sel = null;
      if (pair) { a.classList.add('done'); b.classList.add('done'); Sfx.good(); state.session.correct++; state.session.answered++; celebrate(a); if ($$('.tile.done', root).length === set.pairs.length * 2) { bumpProgress(); finishSet(true); } }
      else { b.classList.add('shake'); Sfx.bad(); state.session.answered++; setTimeout(() => b.classList.remove('shake'), 500); }
    }));
  }

  /* ----- mode: listen & pick ----- */
  function playListen(root, set) {
    let i = 0;
    function draw() {
      if (i >= set.items.length) return finishSet();
      const it = set.items[i]; markVisible(it);
      root.innerHTML = `<div class="q-card">
        <button class="big-speaker" id="spk">🔊</button>
        <p class="q-hint">Indice : ${esc(it.hint)}</p>
        <div class="opt-grid">${it.options.map(o => `<button class="opt opt-emoji" data-v="${esc(o.value)}"><span>${o.label}</span></button>`).join('')}</div>
      </div>`;
      $('#spk').addEventListener('click', () => Speech.say(it.speak));
      Speech.say(it.speak);
      $$('.opt', root).forEach(b => b.addEventListener('click', () => {
        if (b.dataset.v === it.answer) { b.classList.add('right'); Sfx.great(); state.session.correct++; state.session.answered++; celebrate(b); Speech.say(it.answer); i++; bumpProgress(); setTimeout(draw, 900); }
        else { b.classList.add('wrong', 'shake'); Sfx.bad(); state.session.answered++; setTimeout(() => b.classList.remove('wrong', 'shake'), 600); }
      }));
    }
    draw();
  }

  /* ----- mode: multiple choice ----- */
  function playChoice(root, set) {
    let i = 0;
    function draw() {
      if (i >= set.items.length) return finishSet();
      const it = set.items[i]; markVisible(it);
      root.innerHTML = `<div class="q-card">
        <button class="mini-speaker" id="spk">🔊 écouter</button>
        <p class="q-text">${esc(it.ask)}</p>
        <div class="opt-grid">${shuffle(it.options).map(o => `<button class="opt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      </div>`;
      $('#spk').addEventListener('click', () => Speech.say(it.speak || it.ask));
      $$('.opt', root).forEach(b => b.addEventListener('click', () => {
        if (b.dataset.v === it.answer) { b.classList.add('right'); Sfx.great(); state.session.correct++; state.session.answered++; celebrate(b); Speech.say(it.answer); i++; bumpProgress(); setTimeout(draw, 900); }
        else { b.classList.add('wrong', 'shake'); Sfx.bad(); state.session.answered++; setTimeout(() => b.classList.remove('wrong', 'shake'), 600); }
      }));
    }
    draw();
  }

  /* ----- mode: count ----- */
  function playCount(root, set) {
    let i = 0;
    function draw() {
      if (i >= set.items.length) return finishSet();
      const it = set.items[i]; markVisible(it);
      root.innerHTML = `<div class="q-card">
        <button class="mini-speaker" id="spk">🔊 écouter</button>
        <p class="q-text big-q">${esc(it.q)}</p>
        <div class="opt-grid">${it.options.map(o => `<button class="opt" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      </div>`;
      $('#spk').addEventListener('click', () => Speech.say(it.speak));
      $$('.opt', root).forEach(b => b.addEventListener('click', () => {
        if (b.dataset.v === it.answer) { b.classList.add('right'); Sfx.great(); state.session.correct++; state.session.answered++; celebrate(b); Speech.say(it.answer); i++; bumpProgress(); setTimeout(draw, 900); }
        else { b.classList.add('wrong', 'shake'); Sfx.bad(); state.session.answered++; setTimeout(() => b.classList.remove('wrong', 'shake'), 600); }
      }));
    }
    draw();
  }

  /* ----- mode: word order ----- */
  function playOrder(root, set) {
    let i = 0;
    function draw() {
      if (i >= set.items.length) return finishSet();
      const it = set.items[i]; markVisible(it);
      const bank = shuffle(it.words);
      root.innerHTML = `<div class="q-card">
        <p class="q-fr">🇫🇷 ${esc(it.fr)}</p>
        <div class="slot-line" id="slots"></div>
        <div class="bank" id="bank">${bank.map((w, k) => `<button class="chip" data-k="${k}" data-w="${esc(w)}">${esc(w)}<span class="chip-e">${chipEmoji(w)}</span></button>`).join('')}</div>
        <div class="row-btns">
          <button class="btn ghost" id="clr">🧽 Effacer</button>
          <button class="btn primary" id="chk">✅ Vérifier</button>
        </div>
      </div>`;
      const slots = [], usedBank = {};
      function refresh() {
        $('#slots').innerHTML = slots.length
          ? slots.map((o, k) => `<button class="chip placed" data-i="${k}" data-bk="${o.k}">${esc(o.w)}<span class="chip-e">${chipEmoji(o.w)}</span></button>`).join('')
          : '<span class="slot-empty">Touche les mots ci-dessous 👇</span>';
        $$('.chip.placed', $('#slots')).forEach(c => c.addEventListener('click', () => {
          const idx = +c.dataset.i, bk = c.dataset.bk;
          slots.splice(idx, 1); usedBank[bk] = false;
          const bc = $$('#bank .chip').find(b => b.dataset.k === bk);
          if (bc) bc.classList.remove('off');
          refresh(); Sfx.click();
        }));
      }
      $$('#bank .chip').forEach(c => c.addEventListener('click', () => {
        if (c.classList.contains('off')) return;
        c.classList.add('off'); usedBank[c.dataset.k] = true;
        slots.push({ w: c.dataset.w, k: c.dataset.k }); refresh(); Sfx.click(); Speech.say(c.dataset.w);
      }));
      $('#clr').addEventListener('click', () => {
        slots.length = 0; Object.keys(usedBank).forEach(k => usedBank[k] = false);
        $$('#bank .chip').forEach(c => c.classList.remove('off')); refresh();
      });
      $('#chk').addEventListener('click', () => {
        const attempt = slots.map(o => o.w).join(' ').replace(/[.,!?]/g, '').trim().toLowerCase();
        const want = it.answer.replace(/[.,!?]/g, '').trim().toLowerCase();
        if (attempt === want) {
          Sfx.great(); state.session.correct++; state.session.answered++; celebrate($('#slots'));
          Speech.say(it.speak);
          $('#slots').insertAdjacentHTML('afterend', `<p class="ok-msg">🎉 ${esc(it.answer)}</p>`);
          i++; bumpProgress(); setTimeout(draw, 1200);
        } else {
          Sfx.bad(); state.session.answered++;
          root.classList.add('shake'); setTimeout(() => root.classList.remove('shake'), 500);
          showHint(it, slots.join(' '));
        }
      });
      refresh();
    }
    function showHint(it, attempt) {
      let h = $('#hint');
      if (!h) { h = document.createElement('div'); h.id = 'hint'; h.className = 'hint'; $('#chk').before(h); }
      const n = commonPrefixLen(attempt, it.answer);
      h.innerHTML = `🤔 Presque ! Les <b>${n}</b> premier${n === 1 ? '' : 's'} mot${n === 1 ? '' : 's'} sont bons. Qui fait l’action en premier ?`;
    }
    draw();
  }
  function commonPrefixLen(a, b) {
    const A = a.split(' '), B = b.split(' '); let n = 0;
    while (n < A.length && n < B.length && A[n].toLowerCase().replace(/[.,!?]/g, '') === B[n].toLowerCase().replace(/[.,!?]/g, '')) n++;
    return n;
  }

  /* ----- mode: build from bricks ----- */
  function playBuild(root, set) {
    let i = 0;
    function draw() {
      if (i >= set.items.length) return finishSet();
      const it = set.items[i]; markVisible(it);
      const words = it.target.split(' ');
      const bank = shuffle(words.concat(shuffle(it.extra).slice(0, Math.min(3, it.extra.length))));
      root.innerHTML = `<div class="q-card">
        <p class="q-fr">🇫🇷 ${esc(it.fr)}</p>
        <div class="slot-line" id="slots"></div>
        <div class="bank" id="bank">${bank.map((w, k) => `<button class="chip brick" data-k="${k}" data-w="${esc(w)}">${esc(w)}<span class="chip-e">${chipEmoji(w)}</span></button>`).join('')}</div>
        <div class="row-btns">
          <button class="btn ghost" id="sayall">🔊 dire</button>
          <button class="btn ghost" id="clr">🧽</button>
          <button class="btn primary" id="chk">✅ Vérifier</button>
        </div>
      </div>`;
      const slots = [];
      function refresh() {
        $('#slots').innerHTML = slots.length
          ? slots.map((o, k) => `<button class="chip placed" data-i="${k}" data-bk="${o.k}">${esc(o.w)}<span class="chip-e">${chipEmoji(o.w)}</span></button>`).join('')
          : '<span class="slot-empty">Touche les briques 👇 (il y en a de trop, ne les utilise pas toutes !)</span>';
        $$('.chip.placed', $('#slots')).forEach(c => c.addEventListener('click', () => {
          const idx = +c.dataset.i, bk = c.dataset.bk;
          slots.splice(idx, 1);
          const bc = $$('#bank .chip').find(b => b.dataset.k === bk);
          if (bc) bc.classList.remove('off');
          refresh(); Sfx.click();
        }));
      }
      $$('#bank .chip').forEach(c => c.addEventListener('click', () => {
        if (c.classList.contains('off')) return;
        c.classList.add('off'); slots.push({ w: c.dataset.w, k: c.dataset.k }); refresh(); Sfx.click(); Speech.say(c.dataset.w);
      }));
      $('#clr').addEventListener('click', () => { slots.length = 0; $$('#bank .chip').forEach(c => c.classList.remove('off')); refresh(); });
      $('#sayall').addEventListener('click', () => Speech.say(it.target));
      $('#chk').addEventListener('click', () => {
        const attempt = slots.map(o => o.w).join(' ').replace(/[.,!?]/g, '').trim().toLowerCase();
        const want = it.target.replace(/[.,!?]/g, '').trim().toLowerCase();
        if (attempt === want) {
          Sfx.great(); state.session.correct++; state.session.answered++; celebrate($('#slots'));
          Speech.say(it.speak);
          $('#slots').insertAdjacentHTML('afterend', `<p class="ok-msg">🎉 ${esc(it.target)}</p>`);
          i++; bumpProgress(); setTimeout(draw, 1200);
        } else {
          Sfx.bad(); state.session.answered++;
          root.classList.add('shake'); setTimeout(() => root.classList.remove('shake'), 500);
          showHint(it, attempt);
        }
      });
      refresh();
    }
    function showHint(it, attempt) {
      let h = $('#hint');
      if (!h) { h = document.createElement('div'); h.id = 'hint'; h.className = 'hint'; $('#chk').before(h); }
      const n = commonPrefixLen(attempt, it.target);
      const firstWord = it.target.split(' ')[0];
      h.innerHTML = `🤔 Pas encore ! <b>${n}</b> mot${n === 1 ? '' : 's'} correct${n === 1 ? '' : 's'}. La phrase commence par « <b>${esc(firstWord)}</b> »… et attention, il y a des briques en trop !`;
    }
    draw();
  }

  /* ---------- feedback bits ---------- */
  function bumpProgress() {
    const s = state.session; const bar = $('.progress-bar');
    if (bar) bar.style.width = Math.min(100, (s.answered / s.total) * 100) + '%';
  }
  function celebrate(el) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 14);
  }
  let cvs, ctx;
  function canvas() {
    if (!cvs) { cvs = document.createElement('canvas'); cvs.id = 'fx'; document.body.appendChild(cvs); ctx = cvs.getContext('2d'); }
    cvs.width = innerWidth; cvs.height = innerHeight; return cvs;
  }
  const COLORS = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c780fa', '#ff9f1c'];
  let parts = [], raf = null;
  function burst(x, y, n) {
    canvas();
    for (let i = 0; i < n; i++) parts.push({ x, y, vx: (Math.random() - .5) * 7, vy: -Math.random() * 7 - 2, g: .18, s: 4 + Math.random() * 6, c: pick(COLORS), life: 60 + Math.random() * 30, rot: Math.random() * 6, vr: (Math.random() - .5) * .3 });
    if (!raf) tick();
  }
  function confetti(n) {
    canvas();
    for (let i = 0; i < n; i++) parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3, g: .06, s: 6 + Math.random() * 8, c: pick(COLORS), life: 160, rot: Math.random() * 6, vr: (Math.random() - .5) * .25 });
    if (!raf) tick();
  }
  function tick() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    parts = parts.filter(p => p.life-- > 0);
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); ctx.restore();
    });
    raf = parts.length ? requestAnimationFrame(tick) : null;
  }

  /* ---------- boot ---------- */
  function boot() {
    const t = $('#btn-sound');
    function paint() { t.textContent = Speech.isEnabled() ? '🔊 Son : oui' : '🔇 Son : non'; }
    t.addEventListener('click', () => { const v = !Speech.isEnabled(); Speech.setEnabled(v); Store.set('soundOn', v); paint(); if (v) Sfx.click(); });
    Speech.setEnabled(Store.get('soundOn') !== false); paint();
    $('#btn-home').addEventListener('click', renderMap);
    addEventListener('resize', () => { if (cvs) { cvs.width = innerWidth; cvs.height = innerHeight; } });
    const last = Store.get('lastLevel') || 0;
    renderMap();
  }
  return { boot, openLevel, renderMap };
})();

document.addEventListener('DOMContentLoaded', App.boot);
