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

/** A single spoken language. Bhojpuri ('bho') is written in Devanagari and
 *  read by the Hindi voice (no dedicated Bhojpuri TTS voice exists). */
export type Lang = 'en' | 'hi' | 'bho';
/** Ordered list of languages to speak, in the order chosen by the clinic. */
export type AnnounceLang = Lang[];

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

/**
 * Score a voice for a target language. We push hard for an **Indian accent**
 * (en-IN / hi-IN — the closest the OS offers to a Bihar/Hindi-belt accent) and
 * for **high-quality** voices (Microsoft "Online (Natural)", Google, neural),
 * which sound far better than the default offline voices. A true Bhojpuri /
 * Bihari accent isn't available from any browser voice — that needs a cloud
 * TTS, which the static deploy can't call.
 */
function scoreVoice(v: SpeechSynthesisVoice, lang: 'en' | 'hi'): number {
  const name = v.name.toLowerCase();
  const loc = v.lang.toLowerCase().replace('_', '-');
  const isHindi = loc.startsWith('hi');
  const isEnIndia = loc === 'en-in';
  const isIndia = loc.endsWith('-in');
  let s = 0;
  if (lang === 'hi') {
    if (isHindi) s += 120;
    else if (isEnIndia) s += 40; // can at least pronounce Indian words
    else if (loc.startsWith('en')) s += 5;
  } else {
    if (isEnIndia) s += 120;
    // No en-IN installed? A Hindi voice reading English text still sounds
    // Indian — much better for this product than a US/UK voice.
    else if (isHindi) s += 70;
    else if (loc.startsWith('en')) s += 15;
  }
  if (isIndia) s += 25;
  // Reliability first: offline/local voices don't stream, so they don't break
  // up mid-sentence. Online "network" voices (Google/Edge natural) sound nicer
  // but stutter or get blocked — badly in privacy browsers like Brave — which
  // is the "breaking voice" the operator heard on Hindi/Bhojpuri.
  if (v.localService) s += 45;
  else s -= 25;
  // Quality markers — secondary to reliability.
  if (/(natural|neural)/.test(name)) s += 16;
  if (name.includes('microsoft')) s += 12; // offline MS Heera/Kalpana = stable
  if (name.includes('google')) s += 8;
  if (FEMALE_HINTS.some((h) => name.includes(h))) s += 20;
  if (MALE_HINTS.some((h) => name.includes(h))) s -= 30;
  return s;
}

/** Is a real Hindi (hi-*) voice installed on this device? When not, Devanagari
 *  text is unreadable by an English voice — it ends up speaking only the digits
 *  (the "it only says the number" bug). We romanize as a fallback in that case. */
function hasHindiVoice(): boolean {
  return refreshVoices().some((v) => v.lang.toLowerCase().replace('_', '-').startsWith('hi'));
}

// ─── Devanagari → Latin (romanization fallback) ────────────────────────────
// Used only when no Hindi voice is installed, so an English/Indian voice can
// still read the full Hindi/Bhojpuri sentence phonetically instead of skipping
// every Devanagari word.
const DEV_CONS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f', 'य़': 'y',
};
const DEV_MATRA: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri',
};
const DEV_VOWEL: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri',
};

export function devToLatin(s: string): string {
  let out = '';
  let pending = ''; // a consonant awaiting its vowel
  const flush = (vowel: string) => { out += pending + vowel; pending = ''; };
  for (const ch of s) {
    if (DEV_CONS[ch]) { if (pending) flush('a'); pending = DEV_CONS[ch]; }
    else if (DEV_MATRA[ch] !== undefined) { if (pending) flush(DEV_MATRA[ch]); else out += DEV_MATRA[ch]; }
    else if (ch === '्') { if (pending) { out += pending; pending = ''; } } // virama → no vowel
    else if (ch === 'ं' || ch === 'ँ') { if (pending) flush('a'); out += 'n'; }
    else if (ch === 'ः') { if (pending) flush('a'); out += 'h'; }
    else if (ch === '़') { /* nukta — ignore, base already mapped */ }
    else if (DEV_VOWEL[ch]) { if (pending) flush('a'); out += DEV_VOWEL[ch]; }
    else { if (pending) flush('a'); out += ch; } // digits, latin, spaces, punctuation
  }
  if (pending) flush('a');
  return out;
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
export const DEFAULT_TEMPLATE_BHO = 'टोकन नंबर [Token no], [Name], कृपया डॉक्टर साहेब के कमरा में आईं।';

export const LANG_META: Record<Lang, { label: string; short: string }> = {
  en: { label: 'English', short: 'EN' },
  hi: { label: 'हिन्दी', short: 'हि' },
  bho: { label: 'भोजपुरी', short: 'भोज' },
};

// Placeholders are forgiving: [Token no], [token], {token number}, [NAME],
// {name} … all work. Token number and patient name are filled automatically.
const TOKEN_RE = /[[{]\s*token[^\]}]*[\]}]/gi;
const NAME_RE = /[[{]\s*name[^\]}]*[\]}]/gi;

/** Fill a clinic-written template with the live token + patient name. The
 *  name is transliterated to Devanagari for the Hindi / Bhojpuri voices. */
export function fillTemplate(template: string, token: number, name: string, lang: Lang): string {
  const spokenName = lang === 'en' ? name : nameToDevanagari(name);
  return template.replace(TOKEN_RE, String(token)).replace(NAME_RE, spokenName);
}

interface Templates {
  templateEn?: string;
  templateHi?: string;
  templateBho?: string;
}

function templateFor(lang: Lang, t?: Templates): string {
  if (lang === 'hi') return t?.templateHi?.trim() || DEFAULT_TEMPLATE_HI;
  if (lang === 'bho') return t?.templateBho?.trim() || DEFAULT_TEMPLATE_BHO;
  return t?.templateEn?.trim() || DEFAULT_TEMPLATE_EN;
}

function sentenceFor(lang: Lang, token: number, name: string, t?: Templates): string {
  return fillTemplate(templateFor(lang, t), token, name, lang);
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
  u.rate = 0.95;    // a touch slower so it carries across a waiting room
  u.pitch = 1.0;    // natural — high-quality voices sound off when pitched up
  return u;
}

/** Whether any Indian-locale voice (hi-IN / en-IN, …) is installed. Used to
 *  hint the operator when only foreign-accent voices are available. */
export function hasIndianVoice(): boolean {
  return refreshVoices().some((v) => v.lang.toLowerCase().replace('_', '-').endsWith('-in'));
}

// Chromium pauses long-running synthesis and can drop utterances queued right
// after cancel() — both surface as a "breaking"/choppy voice. A periodic
// pause→resume keeps it alive; we stop the timer once nothing is speaking.
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
function startKeepAlive(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || keepAliveTimer) return;
  keepAliveTimer = setInterval(() => {
    const s = window.speechSynthesis;
    if (s.speaking || s.pending) { try { s.pause(); s.resume(); } catch { /* ignore */ } }
    else if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
  }, 6000);
}

// Build the utterance for one language. Hindi & Bhojpuri use the Hindi voice;
// when no Hindi voice exists we romanize so the available voice reads it fully
// (instead of speaking only the digits).
function utterFor(lang: Lang, sentence: string): SpeechSynthesisUtterance {
  const needsDevanagari = lang === 'hi' || lang === 'bho';
  if (needsDevanagari && !hasHindiVoice()) return utter('en', devToLatin(sentence));
  return utter(needsDevanagari ? 'hi' : 'en', sentence);
}

const normLangs = (lang: AnnounceLang): Lang[] => (Array.isArray(lang) && lang.length ? lang : ['en']);

// Speak a list of utterances reliably: cancel, wait a tick (so Chromium
// doesn't swallow the first one), then queue them and keep the engine alive.
function speakSequence(utterances: SpeechSynthesisUtterance[]): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  setTimeout(() => {
    for (const u of utterances) synth.speak(u);
    startKeepAlive();
  }, 90);
}

/**
 * Speak the "now serving" announcement. Languages are spoken back-to-back in
 * the order the clinic chose. No-op if speechSynthesis is missing.
 */
export function speakAnnouncement(opts: {
  token: number;
  name: string;
  lang: AnnounceLang;
  templateEn?: string;
  templateHi?: string;
  templateBho?: string;
}): void {
  const utterances = normLangs(opts.lang).map((l) => utterFor(l, sentenceFor(l, opts.token, opts.name, opts)));
  speakSequence(utterances);
}

/**
 * Speak arbitrary operator-written text (custom PA-style announcement). Read
 * once, with the voice picked from the primary language / the script used.
 */
export function speakCustomText(text: string, lang: AnnounceLang): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const primary = normLangs(lang)[0];
  const isDevanagari = /[ऀ-ॿ]/.test(trimmed) || primary === 'hi' || primary === 'bho';
  const u = (isDevanagari && !hasHindiVoice())
    ? utter('en', devToLatin(trimmed))
    : utter(isDevanagari ? 'hi' : 'en', trimmed);
  speakSequence([u]);
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
  templates?: { templateEn?: string; templateHi?: string; templateBho?: string },
  token = 1,
): void {
  speakAnnouncement({ token, name, lang, ...templates });
}
