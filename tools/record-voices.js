// Records every line in tools/lines-ch<N>.json with the free, offline Kokoro
// voice model (via sherpa-onnx), shapes each character with ffmpeg, and writes
// src/js/ch<N>/voicelines.js: a map of "speaker|text" -> embedded MP3.
//   node tools/record-voices.js <chapter> <path-to-kokoro-model-dir> <ffmpeg>
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const sherpa = require(process.env.SHERPA || 'sherpa-onnx-node');
const [, , CH, MODEL, FFMPEG] = process.argv;
const OUT = path.join(__dirname, 'voice-cache');
fs.mkdirSync(OUT, { recursive: true });

// Kokoro v0.19 speakers: 0 af, 1 af_bella, 2 af_nicole, 3 af_sarah, 4 af_sky,
// 5 am_adam, 6 am_michael, 7 bf_emma, 8 bf_isabella, 9 bm_george, 10 bm_lewis
const CAST = {
  jack:        { sid: 10, speed: 1.0,  pitch: 1.0 },
  narrator:    { sid: 9,  speed: 0.92, pitch: 0.97 },
  control:     { sid: 9,  speed: 0.97, pitch: 0.94, phone: true },
  ilse:        { sid: 8,  speed: 0.93, pitch: 0.97 },
  franz:       { sid: 6,  speed: 0.95, pitch: 0.92 },
  vendor:      { sid: 5,  speed: 0.9,  pitch: 0.88 },
  gateGuard:   { sid: 5,  speed: 0.95, pitch: 0.84 },
  stairGuard:  { sid: 6,  speed: 0.95, pitch: 0.83 },
  officeGuard: { sid: 5,  speed: 1.05, pitch: 0.87 },
  waiter:      { sid: 6,  speed: 1.05, pitch: 1.05 },
  baron:       { sid: 9,  speed: 0.9,  pitch: 0.86 },
  // Chapter Two
  novak:       { sid: 7,  speed: 0.9,  pitch: 0.97 },
  zora:        { sid: 3,  speed: 0.9,  pitch: 0.9 },
  borderGuard: { sid: 5,  speed: 0.98, pitch: 0.86 },
  militia:     { sid: 6,  speed: 0.92, pitch: 0.85 },
  kolar:       { sid: 9,  speed: 1.08, pitch: 0.92 },
  soldier1:    { sid: 6,  speed: 1.05, pitch: 1.02 },
  soldier2:    { sid: 5,  speed: 0.95, pitch: 0.9 },
  pavel:       { sid: 9,  speed: 0.8,  pitch: 0.84 },
  vasko:       { sid: 5,  speed: 0.86, pitch: 0.8 },
  tannoy:      { sid: 2,  speed: 0.95, pitch: 1.0, pa: true },
  // Chapter Three
  bogdan:      { sid: 6,  speed: 1.02, pitch: 0.86 },
  olga:        { sid: 7,  speed: 0.88, pitch: 0.84 },
  anicka:      { sid: 4,  speed: 1.06, pitch: 1.2 },
  // Chapter Four
  marta:       { sid: 1,  speed: 0.95, pitch: 0.88 },
  mirek:       { sid: 5,  speed: 0.86, pitch: 0.92 },
  vlasta:      { sid: 0,  speed: 0.9,  pitch: 0.86 },
  hana:        { sid: 2,  speed: 1.0,  pitch: 0.97 },
  hruby:       { sid: 6,  speed: 0.95, pitch: 0.8 },
  // Chapter Five
  selim:       { sid: 9,  speed: 0.92, pitch: 0.9 },
  airGuard:    { sid: 5,  speed: 1.0,  pitch: 0.85 },
  cayci:       { sid: 6,  speed: 0.9,  pitch: 1.1 },
  riza:        { sid: 5,  speed: 0.9,  pitch: 0.93 },
  mustafa:     { sid: 6,  speed: 0.88, pitch: 0.72 },
  nuri:        { sid: 9,  speed: 0.82, pitch: 0.82 },
  dupont:      { sid: 6,  speed: 0.95, pitch: 0.97 },
  leyla:       { sid: 3,  speed: 1.0,  pitch: 1.0 },
  brunner:     { sid: 9,  speed: 0.9,  pitch: 1.0 },
  hollis:      { sid: 5,  speed: 0.95, pitch: 0.95 },
  // Chapter Six
  toni:        { sid: 5,  speed: 1.05, pitch: 0.9 },
  bepi:        { sid: 9,  speed: 0.85, pitch: 0.82 },
  lucrezia:    { sid: 8,  speed: 0.95, pitch: 0.95 },
  plague:      { sid: 9,  speed: 0.95, pitch: 0.9, muffle: true },
  // Chapter Seven
  uwe:         { sid: 5,  speed: 0.98, pitch: 0.86 },
  nina:        { sid: 4,  speed: 1.08, pitch: 1.02 },
  kalle:       { sid: 6,  speed: 0.95, pitch: 0.85 },
  kessler:     { sid: 3,  speed: 0.88, pitch: 0.86 },
  stasi:       { sid: 6,  speed: 1.0,  pitch: 0.82 },
  // Chapter Eight
  croupier:    { sid: 6,  speed: 1.0,  pitch: 1.02 },
  pitboss:     { sid: 9,  speed: 0.92, pitch: 0.86 },
  cashier:     { sid: 5,  speed: 0.95, pitch: 1.04 },
};
// Per-chapter voices: in Chapter Six, Control is heard in person, not down a telephone line.
const CAST_CH = { 6: { control: { sid: 9, speed: 0.97, pitch: 0.94 } } };

// Spell foreign words and shouted capitals so the English model says them well.
function speakable(t) {
  const fixes = [
    [/Grüß Gott/g, 'Grooss Gott'], [/Danke schön/g, 'Dunkeh shern'], [/mein Herr/g, 'mine hair'],
    [/Fräulein/g, 'Froyline'], [/Bitte sehr/g, 'Bitteh zair'], [/\bBitte\b/g, 'Bitteh'], [/Servus/g, 'Zervus'],
    [/Dom Pérignon/g, 'Dom Perinyon'], [/Karlskirche/g, 'Karls-keer-kheh'], [/Melange/g, 'Meh-lahnzh'],
    [/STRENG GEHEIM/g, 'streng geh-hime'], [/Abendpost/g, 'Ahbent-post'], [/yoooou/g, 'yooou'], [/toooo/g, 'tooo'],
    [/Obstler/g, 'Obst-ler'], [/Café/g, 'Caffay'], [/\.\.\./g, '…'],
    [/Guten Morgen/g, 'Gooten Morgen'], [/Gute Reise/g, 'Gooteh Rye-zeh'], [/Mozartkugeln/g, 'Mozart-koogeln'], [/Anička/g, 'Anichka'],
    [/Sachertorte/g, 'Sacher-torteh'], [/Fledermaus/g, 'Fleder-mouse'], [/\bHerr\b/g, 'Hair'], [/\bGraz\b/g, 'Grahts'],
    [/Karvograd/g, 'Karvo-grad'], [/\bMr (?=[A-Z])/g, 'Mister '], [/slivovitz/g, 'slivo-vitz'], [/Walther/g, 'Valter'], [/T-25/g, 'T 25'],
    [/Zlatá/g, 'Zlahta'], [/Rıza/g, 'Reeza'], [/Bay Selim/g, 'Bye Seleem'], [/Selim/g, 'Seleem'], [/yalı/g, 'yahluh'], [/Yalı/g, 'Yahluh'], [/Çemberlitaş/g, 'Chemberlitash'],
    [/Çay/g, 'Chai'], [/çay/g, 'chai'], [/\babi\b/g, 'abee'], [/\bDur\b/g, 'Door'], [/Hoş geldiniz/g, 'Hosh geldiniz'], [/Beyazıt/g, 'Beyazut'], [/peştamal/g, 'peshtamal'],
    [/là/g, 'la'], [/Zürich/g, 'Zurich'], [/Kandilli/g, 'Kandeelee'], [/Allah allah/g, 'Allah, allah'], [/ZLATÁ/g, 'Zlahta'], [/GİRİLMEZ/g, 'Geerilmez'], [/DVOŘÁK/g, 'Dvorzhak'], [/\s·\s/g, ', '], [/\bM\. (?=[A-Z])/g, 'M '], [/Pepík/g, 'Pepeek'], [/Hrubý/g, 'Hroobee'], [/Veselá/g, 'Vesselah'], [/Dvořák/g, 'Dvorzhak'],
    [/Rohlíky/g, 'Rohleekee'], [/koláče/g, 'kolahcheh'], [/Na zdraví/g, 'Nah zdravee'], [/Tomáš/g, 'Tomahsh'], [/\bSt Wenceslas/g, 'Saint Wenceslas'],
    [/Mamma mia/g, 'Mahmma mee-ah'], [/\bVia!/g, 'Vee-ah!'], [/Grazie/g, 'Grahts-yeh'], [/signore/g, 'seen-yoreh'], [/signora/g, 'seen-yora'], [/Signor\b/g, 'Seen-yor'],
    [/Bellissimo/g, 'Belleesseemo'], [/Buonanotte/g, 'Bwonna-nottay'], [/Buonasera/g, 'Bwonna-sehra'], [/dottore/g, 'dot-toreh'],
    [/O sole mio… sta nfronte a te…/g, 'Oh sohleh mee-oh, stah n-fronteh ah teh.'], [/Volare, oh oh… cantare, oh oh oh oh…/g, 'Volahreh, oh oh, cantahreh, oh oh oh oh.'],
    [/O Sole Mio/g, 'Oh Sohleh Mee-oh'], [/Maestro/g, 'My-stro'], [/Bepi/g, 'Beppy'], [/Murano/g, 'Moo-rahno'], [/\blire\b/g, 'leereh'], [/Contessa/g, 'Con-tessa'],
    [/Lucrezia/g, 'Loo-kretsia'], [/Giacomo/g, 'Jahcomo'], [/Ca' Rosa/g, 'Kah Rosa'], [/Danieli/g, 'Dan-yelly'],
    [/Scheibenkleister/g, 'Shyben-klyster'], [/Prenzlauer Berg/g, 'Prentslauer Bairg'], [/Normannenstra(ß|ss)e/gi, 'Normannen-shtrahsseh'], [/\bStasi\b/g, 'Shtahzee'],
    [/\bWessi\b/g, 'Vessy'], [/Trabant/g, 'Trah-bahnt'], [/Zwickau/g, 'Tsvickow'], [/Kartei/g, 'Kar-tie'], [/\bSchrank\b/g, 'Shrank'], [/TEEKANNE|Teekanne/g, 'Tay-kanneh'],
    [/GANS, WEISS/g, 'Gahns, Vice'], [/Wache!/g, 'Vakheh!'], [/Kaffee-Mix/g, 'Kaffay-Mix'], [/Leipzig/g, 'Lipe-tsig'], [/Jochen/g, 'Yokhen'], [/Gisela/g, 'Geezela'],
    [/Bernauer Stra(ss|ß)e/g, 'Bernower Shtrahsseh'], [/\bUwe\b/g, 'Oova'], [/Kalle/g, 'Kalleh'], [/Volkspolizei/g, 'Folks-politsai'], [/[Cc]urrywurst/g, 'curry-voorst'],
    [/Wachsamkeit ist unsere Waffe/g, 'Vakhsamkite ist oonzereh Vaffeh'], [/Keine Zukunft/g, 'Kyneh Tsookoonft'], [/NUR MIT GENEHMIGUNG/g, 'Noor mit Geh-naymigoong'],
    [/Frankfurter Allee/g, 'Frankfurter Allay'], [/Kreuzberg/g, 'Kroyts-bairg'], [/Lichtenberg/g, 'Likhten-bairg'],
    [/Faites vos jeux/g, 'Fet voh zhuh'], [/Messieurs/g, 'Mess-yuh'], [/Monsieur/g, 'Muh-syuh'], [/monsieur/g, 'muh-syuh'], [/Mon Dieu/g, 'Mon Dyuh'], [/Bonne chance/g, 'Bon shonss'],
    [/Salle Blanche/g, 'Sal Blonsh'], [/Au revoir/g, 'Oh rev-wahr'], [/\bBlanc\b/g, 'Blon'], [/[Bb]accarat/g, 'bacca-rah'], [/croupier/g, 'kroo-pee-ay'], [/soufflé/g, 'soo-flay'],
    [/Pardon, mon Colonel/g, 'Par-don, mon Colonel'], [/\bNon, non, non\b/g, 'Non, non, non'],
    [/\bDr (?=[A-Z])/g, 'Doctor '], [/D\. V\./g, 'D V'], [/Frantisek/g, 'Frantishek'], [/kefir/g, 'keh-feer'], [/borscht/g, 'borsht'], [/Sovetskoye Shampanskoye/g, 'Sov-yet-skoya Shampahn-skoya'],
  ];
  for (const [a, b] of fixes) t = t.replace(a, b);
  // Abbreviations make the voice stop dead: spell them out.
  t = t.replace(/\bMr\.? J\. /g, 'Mister J ').replace(/\bMr\. /g, 'Mister ').replace(/\bCol\. /g, 'Colonel ').replace(/\bJ\. /g, 'J ');
  // Trailing-off dots and dashes become a short comma pause.
  t = t.replace(/…\s*/g, ', ').replace(/^,\s*/, '').replace(/\s+—\s+/g, ', ');
  // Join very short sentences to their neighbours with a comma, so fragments
  // like "Tempting. But..." flow as one phrase instead of stop-start.
  const parts = t.split(/(?<=\.)\s+/);
  if (parts.length > 1) {
    const words = x => x.replace(/[^A-Za-z' ]/g, '').trim().split(/\s+/).length;
    t = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const short = words(parts[i - 1]) <= 4 || words(parts[i]) <= 4;
      t = short ? t.replace(/\.$/, ',') + ' ' + parts[i] : t + ' ' + parts[i];
    }
  }
  // ALL-CAPS words (shouting or names) → Title case, so they aren't spelled out.
  t = t.replace(/\b([A-Z]{2,})\b/g, w => w === 'UP' || w === 'AM' ? w.toLowerCase() : w[0] + w.slice(1).toLowerCase());
  return t.replace(/[“”"]/g, '');
}

const tts = new sherpa.OfflineTts({
  model: { kokoro: { model: MODEL + '/model.int8.onnx', voices: MODEL + '/voices.bin', tokens: MODEL + '/tokens.txt', dataDir: MODEL + '/espeak-ng-data' }, numThreads: 4, debug: false },
  maxNumSentences: 2,
});
const lines = JSON.parse(fs.readFileSync(path.join(__dirname, `lines-ch${CH}.json`), 'utf8'));
const out = {};
let n = 0;
for (const { id, text } of lines) {
  const c = (CAST_CH[CH] || {})[id] || CAST[id] || CAST.jack;
  const key = crypto.createHash('sha1').update(JSON.stringify(['v2', c, speakable(text)])).digest('hex').slice(0, 16);
  const mp3 = path.join(OUT, key + '.mp3');
  if (!fs.existsSync(mp3)) {
    const wav = path.join(OUT, key + '.wav');
    const a = tts.generate({ text: speakable(text), sid: c.sid, speed: c.speed });
    sherpa.writeWave(wav, { samples: a.samples, sampleRate: a.sampleRate });
    const f = [];
    if (c.pitch !== 1) f.push(`asetrate=${Math.round(24000 * c.pitch)}`, 'aresample=24000', `atempo=${(1 / c.pitch).toFixed(4)}`);
    f.push('silenceremove=start_periods=1:start_threshold=-50dB:stop_periods=-1:stop_duration=0.3:stop_threshold=-45dB:stop_silence=0.2');
    if (c.phone) f.push('highpass=f=320', 'lowpass=f=3300', 'acompressor=threshold=-22dB:ratio=5:attack=5:release=60', 'volume=1.6');
    if (c.muffle) f.push('lowpass=f=1900', 'volume=1.4');
    if (c.pa) f.push('highpass=f=380', 'lowpass=f=3600', 'aecho=0.8:0.6:160|320:0.35|0.2', 'acompressor=threshold=-20dB:ratio=4:attack=5:release=80');
    f.push('loudnorm=I=-17:TP=-1.5:LRA=9');
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', wav, '-af', f.join(','), '-ac', '1', '-ar', '24000', '-b:a', '56k', mp3]);
    fs.unlinkSync(wav);
  }
  // Voices are embedded at 32 kbps: clear speech on a phone, at little more than half the size.
  const small = mp3.replace(/\.mp3$/, '.32k.mp3');
  if (!fs.existsSync(small)) execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', mp3, '-ac', '1', '-ar', '24000', '-b:a', '32k', small]);
  out[id + '|' + text] = fs.readFileSync(small).toString('base64');
  if (++n % 10 === 0) console.log(`${n}/${lines.length}`);
}
const js = '// Generated by tools/record-voices.js — pre-recorded dialogue (Kokoro, Apache-2.0).\nconst VOICE_LINES = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', `src/js/ch${CH}/voicelines.js`), js);
console.log('done', n, 'lines,', (js.length / 1e6).toFixed(1), 'MB');
