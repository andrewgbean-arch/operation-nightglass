// Chapter One: Vienna — remastered. The same mission, the same lines (and the same
// recorded voices) as the original chapter, staged in three dimensions.
import { G, say, think, choose, flag, has, addItem, removeItem, setObjective, toast, actor, wait } from '../core/game.js';
import { Actor } from '../core/actors.js';
import { Audio } from '../core/audio.js';
import { linGrad, radGrad, rrect, poly } from '../core/draw2d.js';
import { buildStreet } from '../scenes/street.js';

export const NAMES = { jack: 'Jack Harrow', vendor: 'Newspaper vendor', ilse: 'Ilse', control: 'Control' };

export const ITEMS = {
  coins: {
    name: 'Schillings', desc: 'A few Austrian schillings. Enough for a newspaper, not enough for a bribe.',
    icon(c) { for (const [x, y, r] of [[-14, 8, 20], [12, 4, 18], [0, -12, 16]]) { c.fillStyle = radGrad(c, x - 5, y - 5, 2, r, [[0, '#f4e2a0'], [1, '#9a7a2a']]); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,60,20,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r - 4, 0, 7); c.stroke(); } },
  },
  pen: {
    name: 'Fountain Pen', desc: 'Technical Section\'s finest. Twist the cap and it fires one sleeping dart. Effective range: about four metres.',
    icon(c) { c.rotate(-0.7); c.fillStyle = linGrad(c, 0, -7, 0, 7, [[0, '#3a3a40'], [0.5, '#111'], [1, '#2a2a30']]); rrect(c, -38, -7, 70, 14, 6); c.fill(); c.fillStyle = '#c9a13b'; c.fillRect(-10, -7, 4, 14); c.fillRect(10, -8, 22, 3); poly(c, [32, -5, 44, 0, 32, 5], '#d9c27a'); },
  },
  newspaper: {
    name: 'Evening Paper', desc: 'Wiener Abendpost, evening edition. Colonel Vasko is on the front page, naturally.',
    icon(c) { c.rotate(-0.12); c.fillStyle = '#e8e0cc'; c.fillRect(-36, -30, 72, 60); c.fillStyle = '#1a1a1a'; c.fillRect(-30, -24, 60, 8); c.fillStyle = '#6b6b6b'; for (let i = 0; i < 5; i++) c.fillRect(-30, -10 + i * 7, i === 0 ? 28 : 60, 3); c.fillStyle = '#4a4a4a'; c.fillRect(4, -10, 26, 22); },
  },
};

export const LOOKS = {
  jack: { model: 'jack', hat: { kind: 'fedora', color: 0x26282e, band: 0x101114 } },
  vendor: { model: 'vendor', idle: 'paper', height: 0.97 },
};

async function buyPaper() {
  const v = actor('vendor');
  if (has('newspaper') || flag('boughtPaper')) return say(v, 'You already have the last copy, sir!');
  if (!has('coins')) { await say(G.jack, 'I\'ll take a paper... ah. My money is back in the hotel room.'); return say(v, 'Then the news will have to wait for you, mein Herr.'); }
  removeItem('coins'); Audio.sfx('coin');
  await say(v, 'Four schillings. The last evening edition. Danke schön!');
  flag('boughtPaper', true); addItem('newspaper');
  setObjective('Find the contact in Café Adler');
}

async function talkVendor() {
  const v = actor('vendor');
  await say(v, 'Evening paper, sir? Hot off the press and wet from the rain.');
  for (;;) {
    const c = await choose([
      !flag('boughtPaper') && { text: 'I\'ll take a paper.', value: 'buy' },
      { text: 'Anything interesting in the news?', value: 'news' },
      { text: 'What do you know about the Karvonian Consulate?', value: 'consulate' },
      { text: 'Goodbye.', value: 'bye' },
    ]);
    if (c === 'buy') { await say(G.jack, 'I\'ll take a paper.'); await buyPaper(); }
    if (c === 'news') { await say(G.jack, 'Anything interesting in the news?'); await say(v, 'The Karvonians are throwing a party. Their Colonel is on page one again.'); await say(v, 'Vain as a peacock, that one. They say he has his own face on his cufflinks.'); }
    if (c === 'consulate') { await say(G.jack, 'What do you know about the Karvonian Consulate?'); await say(v, 'Big black cars. Big men with no necks. And tonight, champagne by the crate.'); await say(v, 'Back home, the Colonel\'s birthday is practically a national holiday.'); }
    if (c === 'bye') { await say(G.jack, 'Goodbye.'); return say(v, 'Servus! Mind the puddles.'); }
  }
}

const comingNext = () => toast('This part of the remaster is still being built. The street is the preview.', 3.5);

export const SCENES = {
  street: {
    title: 'Michaelerplatz · Vienna · 21:40',
    build: buildStreet,
    actors: () => {
      const v = new Actor('vendor', LOOKS.vendor); v.root.position.set(3.9, 0, -1.65); v.faceAngle(0.1); v.root.rotation.y = 0.1;
      return [v];
    },
    async enter() {
      if (flag('streetIntro')) return;
      flag('streetIntro', true);
      await wait(1.2);
      await think('Vienna in the rain. Somewhere in this city, Colonel Vasko is celebrating his birthday with the plans for an aircraft that doesn\'t exist.');
      setObjective('Buy the evening paper, then find the contact in Café Adler');
    },
    hotspots: [
      { name: 'Hotel Imperial', box: [-9.5, 1.6, -2.4, 3.2, 3.2, 1.2], at: [-9.5, -1.6], exitLabel: 'Enter the Hotel Imperial', look: () => say(G.jack, 'My hotel. Five stars, and a doorman who works for the Russians.'), exit: comingNext },
      { name: 'Café Adler', box: [-3.5, 1.4, -2.5, 6, 2.8, 0.8], at: [-3.5, -1.6], exitLabel: 'Enter Café Adler', look: () => say(G.jack, 'Café Adler. The contact should be inside.'), exit: comingNext },
      { name: 'Café Window', box: [-2.0, 1.55, -2.5, 2, 1.9, 0.4], look: () => say(G.jack, 'Warm light, strong coffee, Viennese gossip. Half the spies in Europe drink here.') },
      { name: 'Street Lamp', box: [-6.3, 2.4, -1.9, 0.6, 4.8, 0.6], look: () => say(G.jack, 'In this rain, the whole square looks like an oil painting. A gloomy one.') },
      { name: 'Advertising Column', box: [1.0, 1.6, -1.6, 1.3, 3.4, 1.3], at: [1.0, -0.4], look: () => say(G.jack, 'Posters for Die Fledermaus at the State Opera, and a pop concert at the Stadthalle. Vienna does both with a straight face.') },
      { name: 'Karlskirche', box: [2.5, 12, -62, 22, 24, 6], look: () => say(G.jack, 'The dome of the Karlskirche. Baroque, beautiful, and bugged by at least three embassies.') },
      { name: 'Little Yellow Car', box: [7.4, 0.8, 1.4, 4.2, 1.7, 1.9], at: [5.4, 1.5], look: () => say(G.jack, 'A little yellow car with Munich plates. Someone\'s West German cousin is visiting.'), use: () => think('Stealing a car is loud. Walking is quiet.'), useVerb: 'Borrow' },
      { name: 'Newspapers', box: [3.9, 1.1, -0.95, 2.2, 0.4, 0.6], at: [3.9, -0.3], look: () => say(G.jack, 'Tonight\'s Abendpost. Colonel Vasko\'s moustache takes up half the front page.'), take: () => buyPaper() },
      { name: 'Karvonian Consulate', box: [11, 4, -2.8, 6, 8, 1], at: [11.5, -1.5], exitLabel: 'Walk to the Karvonian Consulate', look: () => say(G.jack, 'At the end of the avenue: red flags and floodlights. The Karvonian Consulate.'), exit: comingNext },
      { name: 'Newspaper vendor', actor: 'vendor', at: [3.9, -0.3], look: () => say(G.jack, 'An old man in a flat cap. He\'s probably sold papers here since the Habsburgs.'), talk: () => talkVendor(), item: id => (id === 'coins' ? buyPaper() : false) },
    ],
  },
};

export function newGame() {
  G.flags = {}; G.inv = ['coins', 'pen']; G.objective = '';
  return { scene: 'street', at: [-8, 0.8], facing: Math.PI / 2 };
}
