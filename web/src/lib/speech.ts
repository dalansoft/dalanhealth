/**
 * Spoken queue announcements via the Web Speech API (speechSynthesis) — built
 * in to the browser, free, offline. Used by the TV display to call patients
 * aloud in English, Hindi, or both.
 *
 * Accent strategy (Indian accent is non-negotiable):
 *   - Hindi text   → hi-IN voice (MS "Kalpana", Google हिन्दी, …)
 *   - English text → en-IN voice if installed; otherwise we PREFER the hi-IN
 *     voice reading the English sentence (it comes out with a natural Indian
 *     accent) over any US/UK voice. Generic English voices are a last resort.
 *   - Female voices are preferred over male.
 *
 * Names: Hindi voices mispronounce or skip Latin-script names, and non-Indian
 * English voices butcher them. For the Hindi call we transliterate the name
 * to Devanagari (dictionary of common Indian names + a phonetic fallback), so
 * "Shailesh Raj" is spoken as शैलेश राज.
 */

export type AnnounceLang = 'en' | 'hi' | 'both';

let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const v = window.speechSynthesis.getVoices();
  if (v.length) cachedVoices = v;
  return cachedVoices;
}

// Voices load async on some browsers; subscribe so the cache is warm by the
// time a patient is called.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = () => refreshVoices();
}

// Known Indian female / male voice names across Windows, Android, ChromeOS.
const FEMALE_HINTS = ['heera', 'kalpana', 'swara', 'neerja', 'aarohi', 'ananya', 'veena', 'priya', 'female'];
const MALE_HINTS = ['ravi', 'hemant', 'madhur', 'rishi', 'prabhat', 'male', 'mark', 'david', 'ryan'];

function scoreVoice(v: SpeechSynthesisVoice, lang: 'en' | 'hi'): number {
  const name = v.name.toLowerCase();
  const loc = v.lang.toLowerCase().replace('_', '-');
  const isHindi = loc.startsWith('hi');
  const isEnIndia = loc === 'en-in';
  let s = 0;
  if (lang === 'hi') {
    if (isHindi) s += 100;
    else if (isEnIndia) s += 40; // can at least pronounce Indian words
  } else {
    if (isEnIndia) s += 100;
    // No en-IN installed? A Hindi voice reading English text still sounds
    // Indian — much better for this product than a US/UK voice.
    else if (isHindi) s += 60;
    else if (loc.startsWith('en')) s += 20;
  }
  if (FEMALE_HINTS.some((h) => name.includes(h))) s += 20;
  if (MALE_HINTS.some((h) => name.includes(h))) s -= 30;
  if (name.includes('google')) s += 6; // typically clear + pleasant
  return s;
}

function pickVoice(lang: 'en' | 'hi'): SpeechSynthesisVoice | undefined {
  const voices = refreshVoices();
  if (!voices.length) return undefined;
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = -Infinity;
  for (const v of voices) {
    const sc = scoreVoice(v, lang);
    if (sc > bestScore) {
      bestScore = sc;
      best = v;
    }
  }
  return best;
}

// ─── Name transliteration (roman → Devanagari) ────────────────────────────

// Common Indian first/last names get exact spellings (covers the demo queue
// and the overwhelming majority of walk-ins); anything unknown falls back to
// the phonetic transliterator below.
const NAME_DICT: Record<string, string> = {
  shailesh: 'शैलेश', raj: 'राज', kumar: 'कुमार', verma: 'वर्मा', saurabh: 'सौरभ',
  singh: 'सिंह', pooja: 'पूजा', sharma: 'शर्मा', ramesh: 'रमेश', jha: 'झा',
  aman: 'अमन', anjali: 'अंजलि', devi: 'देवी', manoj: 'मनोज', yadav: 'यादव',
  pinky: 'पिंकी', kumari: 'कुमारी', vikas: 'विकास', sah: 'साह', sumit: 'सुमित',
  roy: 'रॉय', neha: 'नेहा', aditya: 'आदित्य', mishra: 'मिश्रा', sunita: 'सुनीता',
  rohit: 'रोहित', paswan: 'पासवान', priya: 'प्रिया', choudhary: 'चौधरी',
  deepak: 'दीपक', tiwari: 'तिवारी', kavita: 'कविता', arjun: 'अर्जुन',
  pandey: 'पांडे', babita: 'बबीता', naresh: 'नरेश', gupta: 'गुप्ता',
  reshma: 'रेशमा', khatun: 'ख़ातून', sanjay: 'संजय', mahto: 'महतो',
  geeta: 'गीता', rakesh: 'राकेश', thakur: 'ठाकुर', mamta: 'ममता',
  sinha: 'सिन्हा', bipin: 'बिपिन', ranjan: 'रंजन', shweta: 'श्वेता',
  ankit: 'अंकित', kiran: 'किरण', bala: 'बाला', anil: 'अनिल',
  priyanka: 'प्रियंका', patel: 'पटेल', dr: 'डॉक्टर',
};

// Greedy phonetic fallback — approximate but reliably intelligible.
const CONSONANTS: [string, string][] = [
  ['chh', 'छ'], ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'],
  ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'],
  ['k', 'क'], ['g', 'ग'], ['j', 'ज'], ['t', 'त'], ['d', 'द'], ['n', 'न'],
  ['p', 'प'], ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'],
  ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['f', 'फ़'], ['z', 'ज़'],
  ['q', 'क'], ['c', 'क'], ['x', 'क्स'],
];
const VOWELS_INDEPENDENT: [string, string][] = [
  ['aa', 'आ'], ['ai', 'ऐ'], ['au', 'औ'], ['ee', 'ई'], ['oo', 'ऊ'],
  ['a', 'अ'], ['e', 'ए'], ['i', 'इ'], ['o', 'ओ'], ['u', 'उ'],
];
const VOWELS_MATRA: [string, string][] = [
  ['aa', 'ा'], ['ai', 'ै'], ['au', 'ौ'], ['ee', 'ी'], ['oo', 'ू'],
  ['a', ''], ['e', 'े'], ['i', 'ि'], ['o', 'ो'], ['u', 'ु'],
];

function transliterateWord(word: string): string {
  const w = word.toLowerCase();
  if (NAME_DICT[w]) return NAME_DICT[w];
  let out = '';
  let i = 0;
  let prevWasConsonant = false;
  while (i < w.length) {
    let matched = false;
    // Try consonant first.
    for (const [rom, dev] of CONSONANTS) {
      if (w.startsWith(rom, i)) {
        out += dev;
        i += rom.length;
        prevWasConsonant = true;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    // Then vowel — matra after a consonant, independent otherwise.
    const table = prevWasConsonant ? VOWELS_MATRA : VOWELS_INDEPENDENT;
    for (const [rom, dev] of table) {
      if (w.startsWith(rom, i)) {
        out += dev;
        i += rom.length;
        prevWasConsonant = false;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1; // skip anything unmappable
  }
  return out || word;
}

/** Convert a full name ("Shailesh Raj") to Devanagari ("शैलेश राज"). */
export function nameToDevanagari(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => transliterateWord(w.replace(/[^a-zA-Z]/g, '')))
    .join(' ');
}

// ─── Templates + speaking ─────────────────────────────────────────────────

/** Default call sentences — used until the clinic saves its own template. */
export const DEFAULT_TEMPLATE_EN = 'Token number [Token no], [Name], please proceed to the consultation room.';
export const DEFAULT_TEMPLATE_HI = 'टोकन नंबर [Token no], [Name], कृपया परामर्श कक्ष में पधारें।';

// Placeholders are forgiving: [Token no], [token], {token number}, [NAME],
// {name} … all work. Token number and patient name are filled automatically.
const TOKEN_RE = /[[{]\s*token[^\]}]*[\]}]/gi;
const NAME_RE = /[[{]\s*name[^\]}]*[\]}]/gi;

/** Fill a clinic-written template with the live token + patient name. The
 *  name is transliterated to Devanagari for the Hindi voice. */
export function fillTemplate(template: string, token: number, name: string, lang: 'en' | 'hi'): string {
  const spokenName = lang === 'hi' ? nameToDevanagari(name) : name;
  return template.replace(TOKEN_RE, String(token)).replace(NAME_RE, spokenName);
}

interface Templates {
  templateEn?: string;
  templateHi?: string;
}

function sentenceFor(lang: 'en' | 'hi', token: number, name: string, t?: Templates): string {
  const tpl = lang === 'hi'
    ? (t?.templateHi?.trim() || DEFAULT_TEMPLATE_HI)
    : (t?.templateEn?.trim() || DEFAULT_TEMPLATE_EN);
  return fillTemplate(tpl, token, name, lang);
}

function utter(lang: 'en' | 'hi', text: string): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  }
  u.volume = 1;     // max — actual loudness follows the device volume
  u.rate = 0.92;    // a touch slower so it carries across a waiting room
  u.pitch = 1.12;   // slightly raised → clearer, reads as female
  return u;
}

/**
 * Speak the "now serving" announcement. For 'both', Hindi is spoken first
 * then English (queued back-to-back). No-op if speechSynthesis is missing.
 */
export function speakAnnouncement(opts: {
  token: number;
  name: string;
  lang: AnnounceLang;
  templateEn?: string;
  templateHi?: string;
}): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  // Clear anything mid-speech so rapid "complete" clicks don't pile up.
  synth.cancel();

  const langs: ('en' | 'hi')[] = opts.lang === 'both' ? ['hi', 'en'] : [opts.lang];
  for (const l of langs) {
    synth.speak(utter(l, sentenceFor(l, opts.token, opts.name, opts)));
  }
}

/**
 * Speak arbitrary operator-written text (custom PA-style announcement).
 * For 'both' the same text is read twice — Hindi voice first, then English.
 */
export function speakCustomText(text: string, lang: AnnounceLang): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const langs: ('en' | 'hi')[] = lang === 'both' ? ['hi', 'en'] : [lang];
  for (const l of langs) {
    synth.speak(utter(l, trimmed));
  }
}

/** Stop any in-progress announcement (e.g. when sound is muted). */
export function cancelSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** A short spoken sample so the operator can preview the chosen voice/lang.
 *  Pass the live current patient's name + the saved templates so the preview
 *  matches exactly what the waiting room will hear. */
export function previewVoice(
  lang: AnnounceLang,
  name = 'Aman Kumar',
  templates?: { templateEn?: string; templateHi?: string },
  token = 1,
): void {
  speakAnnouncement({ token, name, lang, ...templates });
}
