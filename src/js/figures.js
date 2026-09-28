// ---------------------------------------------------------------------------
// Figures — procedurally drawn, rotoscope-style characters.
// Every figure is drawn in local units (feet at 0,0; ~180 units tall, facing
// right) into an offscreen buffer, then lit to match the scene it stands in.
// ---------------------------------------------------------------------------

const LOOKS = {
  jack: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'trench',
    coat: '#b39a73', coatDark: '#7c6546', pants: '#2b2d33', shoes: '#141414', shirt: '#e8e2d6', tie: '#5b1b22', eye: '#4a6a7a', stubble: true,
  },
  jackTux: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'tux',
    coat: '#1b1d22', coatDark: '#0c0d10', pants: '#16171b', shoes: '#0a0a0a', shirt: '#f1ede4', tie: '#0a0a0a', eye: '#4a6a7a', stubble: true,
  },
  ilse: {
    skin: '#e8c3a8', hair: '#e9dcb4', hairStyle: 'bob', top: 'longcoat', female: true,
    coat: '#9c1f2e', coatDark: '#5e0f19', pants: '#1c1618', shoes: '#1b0d0f', shirt: '#1a1a1a', lips: '#a3182a', eye: '#5b7f6a', earrings: true,
  },
  franz: {
    skin: '#d4a07e', hair: '#5a5550', hairStyle: 'bald', top: 'vest', build: 1.12, belly: 0.4, mustache: true,
    coat: '#2b2522', coatDark: '#15110f', pants: '#1d1b1b', shoes: '#101010', shirt: '#ebe5d8', apron: '#e7e1d2', tie: '#1a1a1a',
  },
  vendor: {
    skin: '#c99774', hair: '#8b8a86', hairStyle: 'flatcap', cap: '#4a4238', top: 'jacket', build: 1.05, stoop: 0.12,
    coat: '#4f5446', coatDark: '#2d3128', pants: '#2c2a26', shoes: '#151310', shirt: '#9c8f7a', scarf: '#7a2a24',
  },
  guard: {
    skin: '#d2a07d', hair: '#2a2622', hairStyle: 'cap', cap: '#3d4436', capBand: '#8e1c24', top: 'uniform', build: 1.1,
    coat: '#4a5240', coatDark: '#2a3024', pants: '#3b4234', shoes: '#0f0f0f', shirt: '#3b4234', trim: '#9e1f28', belt: '#1c1a16',
  },
  waiter: {
    skin: '#dcae8c', hair: '#1c1612', hairStyle: 'slick', top: 'waiter',
    coat: '#ece6da', coatDark: '#b9b1a1', pants: '#15161a', shoes: '#0a0a0a', shirt: '#f4f0e8', tie: '#0a0a0a',
  },
  baron: {
    skin: '#e3a38d', hair: '#d8d4cc', hairStyle: 'bald', top: 'tails', build: 1.2, belly: 1, mustache: true, monocle: true, flushed: true, eye: '#5a7a9a',
    coat: '#1e1f26', coatDark: '#0d0e12', pants: '#1a1b20', shoes: '#0a0a0a', shirt: '#f1ede4', tie: '#f1ede4', sash: '#8a1a2c',
  },
  vasko: {
    skin: '#d6a585', hair: '#1a1a1a', hairStyle: 'cap', cap: '#2a2f38', capBand: '#9e1f28', top: 'uniform', build: 1.08, mustache: true, medals: true,
    coat: '#2d3440', coatDark: '#181c24', pants: '#2a303b', shoes: '#0a0a0a', shirt: '#2d3440', trim: '#c9a13b', belt: '#111',
  },
  // --- Chapter Two: Karvograd ---------------------------------------------------
  jackCoat: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'fedora', hat: '#23252b', hatBand: '#111215', top: 'greatcoat',
    coat: '#2e3440', coatDark: '#181b22', pants: '#23252b', shoes: '#141414', shirt: '#e8e2d6', tie: '#5b1b22', eye: '#4a6a7a', stubble: true, scarf: '#8a8f96',
    face: { outfit: 'overcoat', hairStyle: 'fedora', coat: '#2e3440', scarf: '#8a8f96', hat: '#23252b', hatBand: '#111215' },
  },
  jackRail: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'cap', cap: '#232a38', capBand: '#232a38', badge: '#c9a13b', top: 'greatcoat', brass: true,
    coat: '#39414f', coatDark: '#1f242d', pants: '#23252b', shoes: '#141414', shirt: '#e8e2d6', eye: '#4a6a7a', stubble: true,
    face: { outfit: 'railcoat', hairStyle: 'cap', cap: '#232a38', capBand: '#232a38', coat: '#39414f', trim: '#c9a13b' },
  },
  novak: {
    skin: '#ecc4a8', hair: '#7a2a1a', hairStyle: 'furhat', fur: '#efe8dc', top: 'longcoat', female: true, build: 1.12, belly: 0.35,
    coat: '#4a1a3a', coatDark: '#2a0c20', pants: '#1c1618', shoes: '#1b0d0f', shirt: '#1a1a1a', lips: '#b0182a', eye: '#5a4a3a', earrings: true,
  },
  zora: {
    skin: '#e0b090', hair: '#8a8580', hairStyle: 'kerchief', kerchief: '#2a4a8a', top: 'dress', female: true, build: 1.22, belly: 0.9, glasses: true,
    coat: '#7a3a2a', coatDark: '#4a2016', pants: '#2a1a14', shoes: '#1a1210', shirt: '#7a3a2a', apron: '#e8e0d0', lips: '#a0504a', eye: '#4a5a6a',
  },
  borderGuard: {
    skin: '#d2a07d', hair: '#2a2622', hairStyle: 'ushanka', fur: '#5a4a3a', capBadge: '#c9a13b', top: 'greatcoat', build: 1.12, brass: true, belt: '#1c1a16',
    coat: '#56604a', coatDark: '#323a2a', pants: '#3b4234', shoes: '#0f0f0f', shirt: '#3b4234', trim: '#9e1f28',
  },
  militia: {
    skin: '#caa07e', hair: '#3a3028', hairStyle: 'cap', cap: '#3a4658', capBand: '#9e1f28', top: 'greatcoat', build: 1.08, brass: true, belt: '#1c1a16', mustache: true,
    coat: '#4a5668', coatDark: '#2a3240', pants: '#2a3240', shoes: '#0f0f0f', shirt: '#2a3240', trim: '#9e1f28',
  },
  soldier: {
    skin: '#d8a882', hair: '#4a3a2a', hairStyle: 'ushanka', fur: '#3a3228', capBadge: '#b31c2e', top: 'greatcoat', build: 1.05, brass: true, belt: '#1c1a16',
    coat: '#4a5240', coatDark: '#2a3024', pants: '#3b4234', shoes: '#0f0f0f', shirt: '#3b4234', trim: '#9e1f28',
  },
  kolar: {
    skin: '#d8ac8c', hair: '#1a1612', hairStyle: 'cap', cap: '#2a2f38', capBand: '#9e1f28', top: 'greatcoat', build: 0.98, brass: true, belt: '#111',
    coat: '#3a3e36', coatDark: '#1e211c', pants: '#2a2d26', shoes: '#050505', shirt: '#2a2d26', trim: '#c9a13b', eye: '#6a7a8a',
  },
  // --- Chapter Three: the Iron Arrow ---------------------------------------------
  jackWaiter: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'waiter', stubble: true, eye: '#4a6a7a',
    coat: '#ece6da', coatDark: '#b9b1a1', pants: '#15161a', shoes: '#0a0a0a', shirt: '#f4f0e8', tie: '#0a0a0a',
    face: { outfit: 'waiter', hairStyle: 'slick', coat: '#ece6da', collar: '#f4f0e8', tie: '#0a0a0a' },
  },
  franzChef: {
    skin: '#d4a07e', hair: '#5a5550', hairStyle: 'chef', top: 'waiter', build: 1.12, belly: 0.5, mustache: true,
    coat: '#f2eee6', coatDark: '#c8c0b0', pants: '#2a2a2e', shoes: '#101010', shirt: '#f2eee6', tie: '#9e1f28', apron: '#f8f6f0',
  },
  bogdan: {
    skin: '#d8a482', hair: '#6a6258', hairStyle: 'cap', cap: '#23304a', capBand: '#9e1f28', badge: '#c9a13b', top: 'greatcoat', brass: true, build: 1.15, belly: 0.7, mustache: true, flushed: true,
    coat: '#2e3b56', coatDark: '#1a2234', pants: '#1f2638', shoes: '#101010', shirt: '#e8e2d6', belt: '#1a1a1a',
  },
  olga: {
    skin: '#e4bca0', hair: '#7a7470', hairStyle: 'bun', top: 'longcoat', female: true, build: 1.28, belly: 1, glasses: true,
    coat: '#1e3a2a', coatDark: '#0e2016', pants: '#1a1612', shoes: '#120a08', shirt: '#1a1a1a', lips: '#8a3a3a', eye: '#3a4a3a', earrings: true,
  },
  anicka: {
    skin: '#f0cbb0', hair: '#6a3a1a', hairStyle: 'braids', top: 'longcoat', female: true, build: 0.92,
    coat: '#2a5aa8', coatDark: '#16326a', pants: '#e8e0d0', shoes: '#6a1a1a', shirt: '#e8e0d0', lips: '#c8606a', eye: '#5b7f6a',
  },
  pavel: {
    skin: '#d49c7a', hair: '#9a948c', hairStyle: 'cap', cap: '#232a38', capBand: '#232a38', badge: '#c9a13b', top: 'jacket', build: 1.1, belly: 0.6, mustache: true, flushed: true,
    coat: '#39414f', coatDark: '#1f242d', pants: '#23252b', shoes: '#141414', shirt: '#8a8478',
  },
  // --- Chapter Four: Zlatá Hora and the mountain --------------------------------
  jackBaker: {
    skin: '#eadcce', hair: '#2a1d16', hairStyle: 'flatcap', cap: '#ece6da', top: 'jacket', stubble: true, eye: '#4a6a7a',
    coat: '#ece6da', coatDark: '#bcb4a4', pants: '#8a8274', shoes: '#2a1e14', shirt: '#f4f0e8', apron: '#f6f2ea',
    face: { outfit: 'jacket', hairStyle: 'flatcap', cap: '#ece6da', coat: '#ece6da', collar: '#f4f0e8', skin: '#eadcce', skinDark: '#bfae9c' },
  },
  marta: {
    skin: '#e2b494', hair: '#6a3a2a', hairStyle: 'kerchief', kerchief: '#9e1f28', top: 'dress', female: true, build: 1.25, belly: 0.8,
    coat: '#2a4a3a', coatDark: '#16281e', pants: '#1a1612', shoes: '#1a1210', shirt: '#2a4a3a', apron: '#ece4d4', lips: '#a0504a', eye: '#4a3a2a', earrings: true,
  },
  mirek: {
    skin: '#dca888', hair: '#3a2a1e', hairStyle: 'cap', cap: '#2e3a2c', capBand: '#2e3a2c', top: 'jacket', build: 1.05, stubble: true, flushed: true,
    coat: '#3e4c3a', coatDark: '#232c20', pants: '#3e4c3a', shoes: '#141414', shirt: '#8a8a80', eye: '#4a5a4a',
  },
  vlasta: {
    skin: '#e8c2a4', hair: '#b8b0a8', hairStyle: 'kerchief', kerchief: '#f0ece4', top: 'dress', female: true, build: 1.15, belly: 0.5,
    coat: '#6a5a8a', coatDark: '#3e3252', pants: '#1a1612', shoes: '#2a1a10', shirt: '#6a5a8a', apron: '#f6f2ea', lips: '#a05a5a', eye: '#5a6a7a', flushed: true,
  },
  hana: {
    skin: '#ecc8ac', hair: '#3a2418', hairStyle: 'bun', top: 'longcoat', female: true, build: 0.95, glasses: true,
    coat: '#e8ecee', coatDark: '#b4bcc2', pants: '#2a2e36', shoes: '#1a1a1a', shirt: '#3a4a6a', lips: '#9a4a4a', eye: '#4a6a5a',
  },
  hruby: {
    skin: '#dcaa88', hair: '#2a2218', hairStyle: 'cap', cap: '#3d4436', capBand: '#9e1f28', top: 'greatcoat', build: 1.25, belly: 0.8, brass: true, belt: '#1c1a16', mustache: true, flushed: true,
    coat: '#4a5240', coatDark: '#2a3024', pants: '#3b4234', shoes: '#0f0f0f', shirt: '#3b4234', trim: '#9e1f28',
  },
  // --- Chapter Five: Istanbul ----------------------------------------------------
  jackTowel: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'jacket', bare: true, stubble: true, eye: '#4a6a7a',
    coat: '#d9a883', coatDark: '#b48460', pants: '#b31c2e', shoes: '#c8a878', shirt: '#d9a883',
    face: { outfit: 'bare', hairStyle: 'slick', coat: '#d4a07c' },
  },
  jackDupont: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'slick', top: 'tux', mustache: true, eye: '#4a6a7a',
    coat: '#1b1d22', coatDark: '#0c0d10', pants: '#16171b', shoes: '#0a0a0a', shirt: '#f1ede4', tie: '#0a0a0a',
    face: { outfit: 'tux', hairStyle: 'slick', mustache: '#1c1612', mustacheStyle: 'pencil', stubble: 0 },
  },
  selim: {
    skin: '#caa07e', hair: '#d8d4cc', hairStyle: 'slick', top: 'tux', build: 1.05, mustache: true, glasses: true,
    coat: '#e8e2d6', coatDark: '#b8b0a0', pants: '#1a1a1e', shoes: '#0a0a0a', shirt: '#f4f0e8', tie: '#9e1f28', eye: '#3a2a1a',
  },
  airGuard: {
    skin: '#c89a78', hair: '#1a1612', hairStyle: 'cap', cap: '#3a4a5a', capBand: '#1a2a3a', top: 'jacket', build: 1.05, mustache: true,
    coat: '#4a5a6a', coatDark: '#2a3440', pants: '#2a3440', shoes: '#0f0f0f', shirt: '#8aa0b8', belt: '#1a1a1a',
  },
  cayci: {
    skin: '#d0a07e', hair: '#1a1210', hairStyle: 'slick', top: 'vest', build: 0.9,
    coat: '#3a2a1e', coatDark: '#1e140e', pants: '#2a2a2e', shoes: '#1a1a1a', shirt: '#f0ece4', eye: '#3a2a1a',
  },
  riza: {
    skin: '#c89874', hair: '#9a948c', hairStyle: 'flatcap', cap: '#3a3430', top: 'vest', build: 1.1, belly: 0.6, mustache: true, glasses: true,
    coat: '#5a2a24', coatDark: '#3a1812', pants: '#2a2a2e', shoes: '#2a1a10', shirt: '#e8e2d6', eye: '#3a2a1a',
  },
  mustafa: {
    skin: '#c0906c', hair: '#1a1410', hairStyle: 'bald', top: 'jacket', bare: true, build: 1.45, belly: 1.1, mustache: true,
    coat: '#c0906c', coatDark: '#98684a', pants: '#2a5a9a', shoes: '#c8a878', shirt: '#c0906c', eye: '#2a1a10',
  },
  nuri: {
    skin: '#cfa27e', hair: '#e8e4dc', hairStyle: 'bald', top: 'vest', build: 0.95, mustache: true,
    coat: '#2a3a4a', coatDark: '#16202a', pants: '#2a2a2e', shoes: '#1a1a1a', shirt: '#f0ece4', eye: '#3a3a3a',
  },
  leyla: {
    skin: '#dcae8c', hair: '#1a1210', hairStyle: 'bob', top: 'dress', female: true, build: 0.95,
    coat: '#1e4a4a', coatDark: '#0e2a2a', pants: '#1a1612', shoes: '#1a0d0f', shirt: '#1e4a4a', lips: '#a3182a', eye: '#3a2a1a', earrings: true,
  },
  brunner: {
    skin: '#e8c4a8', hair: '#c8c0b0', hairStyle: 'slick', top: 'tux', build: 1.0, glasses: true,
    coat: '#3a3e46', coatDark: '#22262c', pants: '#22262c', shoes: '#0a0a0a', shirt: '#f1ede4', tie: '#2a4a8a', eye: '#5a6a7a',
  },
  hollis: {
    skin: '#e4b294', hair: '#e8e0d0', hairStyle: 'fedora', hat: '#e8e0cc', hatBand: '#6a3a1a', top: 'jacket', build: 1.25, belly: 0.9, flushed: true,
    coat: '#c8b08a', coatDark: '#98805a', pants: '#8a7050', shoes: '#4a2a14', shirt: '#f1ede4', tie: '#9e1f28', eye: '#5a7a8a',
  },
  // --- Chapter Six: Venice --------------------------------------------------------
  jackGondolier: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'fedora', hat: '#e8d8a0', hatBand: '#9e1f28', top: 'jacket', bare: true, stripes: '#1a2a4a', stubble: true, eye: '#4a6a7a',
    coat: '#f4f0e8', coatDark: '#c8c2b4', pants: '#141418', shoes: '#0a0a0a', shirt: '#f4f0e8',
    face: { outfit: 'jacket', hairStyle: 'fedora', hat: '#e8d8a0', hatBand: '#9e1f28', coat: '#f4f0e8', collar: '#f4f0e8' },
  },
  toni: {
    skin: '#d4a07c', hair: '#1a1410', hairStyle: 'fedora', hat: '#e8d8a0', hatBand: '#9e1f28', top: 'jacket', bare: true, stripes: '#9e1f28', build: 1.15, belly: 0.7, mustache: true,
    coat: '#f4f0e8', coatDark: '#c8c2b4', pants: '#141418', shoes: '#0a0a0a', shirt: '#f4f0e8', eye: '#3a2a1a',
  },
  // --- Chapter Seven: East Berlin ---------------------------------------------------
  jackCleaner: {
    skin: '#d9a883', hair: '#2a1d16', hairStyle: 'flatcap', cap: '#5a5a54', top: 'longcoat', stubble: true, eye: '#4a6a7a',
    coat: '#7a7a70', coatDark: '#4a4a44', pants: '#3a3a36', shoes: '#141414', shirt: '#d8d4c8',
    face: { outfit: 'overcoat', hairStyle: 'flatcap', cap: '#5a5a54', coat: '#7a7a70' },
  },
  // --- Chapter Eight: Monte Carlo ------------------------------------------------------
  croupier: {
    skin: '#e0b494', hair: '#1a1410', hairStyle: 'slick', top: 'tux', build: 0.95, mustache: true,
    coat: '#1b1d22', coatDark: '#0c0d10', pants: '#16171b', shoes: '#0a0a0a', shirt: '#f4f0e8', tie: '#0a0a0a', eye: '#3a2a1a',
  },
  pitboss: {
    skin: '#dcae8c', hair: '#c8c2b8', hairStyle: 'bald', top: 'tux', build: 1.15, belly: 0.6, glasses: true,
    coat: '#2a1a2a', coatDark: '#140a14', pants: '#16171b', shoes: '#0a0a0a', shirt: '#f4f0e8', tie: '#9e1f28', eye: '#4a4a3a',
  },
  // Franz in West Berlin, in a camel coat and a hat, like a man with a Mercedes
  franzCoat: {
    skin: '#d4a07e', hair: '#5a5550', hairStyle: 'fedora', hat: '#3a3028', hatBand: '#1a1410', top: 'greatcoat', build: 1.12, belly: 0.4, mustache: true, scarf: '#9e1f28',
    coat: '#a8865a', coatDark: '#6a5234', pants: '#2a2622', shoes: '#101010', shirt: '#ebe5d8', tie: '#1a1a1a',
  },
  uwe: {
    skin: '#dcac8a', hair: '#6a5a4a', hairStyle: 'flatcap', cap: '#2a3a5a', top: 'vest', build: 1.1, belly: 0.5, mustache: true, apron: '#2a4a7a',
    coat: '#2a4a7a', coatDark: '#1a2a4a', pants: '#2a4a7a', shoes: '#1a1a1a', shirt: '#c8c8c0', eye: '#4a5a6a',
  },
  nina: {
    skin: '#f0d4c0', hair: '#e8408a', hairStyle: 'mohawk', top: 'jacket', female: true, earrings: true,
    coat: '#141414', coatDark: '#050505', pants: '#1a1a1a', shoes: '#0a0a0a', shirt: '#e8e2d6', lips: '#2a1a2a', eye: '#3a6a5a',
  },
  kalle: {
    skin: '#dcae8c', hair: '#3a3028', hairStyle: 'slick', top: 'vest', build: 1.15, belly: 0.6, mustache: true,
    coat: '#3a3028', coatDark: '#1a1612', pants: '#1a1a1a', shoes: '#0a0a0a', shirt: '#d8d0c0', eye: '#3a3a3a',
  },
  kessler: {
    skin: '#e6c4aa', hair: '#b8b2a8', hairStyle: 'bun', top: 'dress', female: true, glasses: true, build: 1.1,
    coat: '#7a6a4a', coatDark: '#4a3e2a', pants: '#3a3228', shoes: '#1a1612', shirt: '#7a6a4a', lips: '#9a5c5a', eye: '#4a4a3a',
  },
  stasi: {
    skin: '#d8a882', hair: '#4a3a2a', hairStyle: 'cap', cap: '#4a5a4a', capBand: '#8a1a1a', top: 'uniform', build: 1.08, brass: true, belt: '#1c1a16',
    coat: '#5a6a58', coatDark: '#3a463a', pants: '#3a463a', shoes: '#0f0f0f', shirt: '#3a463a', trim: '#8a1a1a',
  },
  // Toni, having lent Jack his jersey and his hat: a white vest and a lot of hair
  toniVest: {
    skin: '#d4a07c', hair: '#1a1410', hairStyle: 'slick', top: 'jacket', bare: true, build: 1.15, belly: 0.7, mustache: true,
    coat: '#f4f0e8', coatDark: '#c8c2b4', pants: '#141418', shoes: '#0a0a0a', shirt: '#f4f0e8', eye: '#3a2a1a',
    face: { outfit: 'jacket', hairStyle: 'slick', coat: '#f4f0e8', collar: '#f4f0e8' },
  },
  bepi: {
    skin: '#d0a07e', hair: '#e8e4dc', hairStyle: 'bald', top: 'vest', build: 1.0, mustache: true, glasses: true, apron: '#5a3a1e',
    coat: '#3a3a3e', coatDark: '#1e1e22', pants: '#2a2a2e', shoes: '#1a1a1a', shirt: '#d8d0c0', eye: '#3a3a3a',
  },
  lucrezia: {
    skin: '#ecc6aa', hair: '#2a1a12', hairStyle: 'bun', top: 'dress', female: true, build: 1.0, earrings: true, mask: 'domino', maskColor: '#c9a13b',
    coat: '#5a1a4a', coatDark: '#2a0a24', pants: '#1a1612', shoes: '#1b0d0f', shirt: '#5a1a4a', lips: '#b0182a', eye: '#4a3a2a',
  },
  plague: {
    skin: '#d8b090', hair: '#8a847c', hairStyle: 'fedora', hat: '#0c0c0e', hatBand: '#0c0c0e', top: 'longcoat', build: 1.05, mask: 'plague',
    coat: '#0e0e12', coatDark: '#050507', pants: '#0e0e12', shoes: '#050505', shirt: '#0e0e12', eye: '#4a5a6a',
  },
  control: {
    skin: '#e0b898', hair: '#8a847c', hairStyle: 'slick', top: 'longcoat', build: 1.05, mustache: true,
    coat: '#0e0e12', coatDark: '#050507', pants: '#0e0e12', shoes: '#050505', shirt: '#f1ede4', tie: '#0a0a0a', eye: '#4a5a6a',
  },
};

// Scratch buffer the figure is rendered into before lighting.
const FIG_BUF = makeCanvas(720, 760);
const FIG_CTX = FIG_BUF.getContext('2d');

// Pose resolver: turns a figure's state into joint angles.
function resolvePose(f, t) {
  const p = {
    hipY: -92, lean: (f.look.stoop || 0),
    legs: [{ thigh: 0, knee: 0.04 }, { thigh: 0, knee: 0.04 }],
    arms: [{ upper: 0.08, fore: -0.15 }, { upper: -0.04, fore: -0.1 }],
    bob: 0, headTilt: 0,
  };
  const breathe = Math.sin(t * 1.7 + (f.seed || 0)) * 0.8;
  p.bob = breathe * 0.6;

  if (f.walking) {
    const ph = f.walkPhase;
    for (let i = 0; i < 2; i++) {
      const q = ph + i * Math.PI;
      p.legs[i].thigh = 0.46 * Math.sin(q);
      p.legs[i].knee = 0.06 + 0.75 * Math.max(0, Math.cos(q)) * (Math.sin(q) < 0.6 ? 1 : 0.6);
      p.arms[1 - i].upper = -0.4 * Math.sin(q);
      p.arms[1 - i].fore = 0.2 + 0.35 * Math.max(0, -Math.sin(q));
    }
    p.bob = -Math.abs(Math.cos(ph)) * 4 + 2;
    p.lean += f.running ? 0.18 : 0.03;
  }
  if (f.pose === 'sit') {
    p.hipY = -50;
    p.legs[0] = { thigh: 1.45, knee: 1.45 };
    p.legs[1] = { thigh: 1.35, knee: 1.5 };
  }
  if (f.crouch) {
    const c = f.crouch;
    p.hipY += c * 42;
    p.legs[0].thigh += 1.05 * c; p.legs[0].knee += 2.0 * c;
    p.legs[1].thigh += 0.7 * c; p.legs[1].knee += 1.9 * c;
    p.lean += 0.35 * c;
  }
  if (f.airborne) {
    p.legs[0] = { thigh: 0.9, knee: 1.3 }; p.legs[1] = { thigh: -0.3, knee: 0.9 };
    p.arms[0] = { upper: -1.2, fore: 0.4 }; p.arms[1] = { upper: 1.8, fore: 0.5 };
  }
  // Arm poses (index 1 = near arm, drawn in front).
  const arm = f.arm || 'rest';
  const wob = Math.sin(t * 2.3) * 0.04;
  if (arm === 'tray') p.arms[1] = { upper: 0.2, fore: 1.35 + wob };
  if (arm === 'phone') p.arms[1] = { upper: 0.45, fore: 2.45 };
  if (arm === 'point') p.arms[1] = { upper: 1.5, fore: 0.05 };
  if (arm === 'reach') p.arms[1] = { upper: 0.95, fore: 0.35 };
  if (arm === 'behind') { p.arms[0] = { upper: -0.2, fore: -0.5 }; p.arms[1] = { upper: -0.18, fore: -0.55 }; }
  if (arm === 'toast') p.arms[1] = { upper: 2.5 + wob * 3, fore: 0.35 };
  if (arm === 'hold') p.arms[1] = { upper: 0.4, fore: 1.3 };
  if (arm === 'cuffed') { p.arms[1] = { upper: 2.7, fore: 0.25 }; p.headTilt = -0.05; }
  if (arm === 'knit') { p.arms[1] = { upper: 0.6, fore: 1.5 + Math.sin(t * 7) * 0.12 }; p.arms[0] = { upper: 0.55, fore: 1.45 + Math.sin(t * 7 + 1) * 0.12 }; }
  if (arm === 'panic') { p.arms[1] = { upper: 2.9 + Math.sin(t * 14) * 0.2, fore: 0.3 }; p.arms[0] = { upper: 2.6 + Math.sin(t * 13) * 0.2, fore: 0.4 }; }
  if (arm === 'hug') { p.arms[1] = { upper: 1.2, fore: 1.2 }; p.arms[0] = { upper: 1.1, fore: 1.3 }; }
  if (arm === 'wheel') { p.arms[1] = { upper: 1.3 + Math.sin(t * 6) * 0.35, fore: 0.6 }; p.arms[0] = { upper: 1.2 - Math.sin(t * 6) * 0.35, fore: 0.7 }; }
  if (arm === 'push') { p.arms[1] = { upper: 0.85, fore: 0.35 }; p.arms[0] = { upper: 0.8, fore: 0.4 }; }
  if (arm === 'wrist') { p.arms[1] = { upper: 0.3, fore: 1.7 }; p.arms[0] = { upper: 0.25, fore: 1.5 }; p.headTilt = 0.12; }
  if (arm === 'sign') p.arms[1] = { upper: 0.55, fore: 1.45 + Math.sin(t * 9) * 0.08 };
  if (arm === 'warm') { p.arms[1] = { upper: 0.7, fore: 1.2 + Math.sin(t * 3) * 0.1 }; p.arms[0] = { upper: 0.65, fore: 1.25 }; }
  if (arm === 'cig') {
    const up = (Math.sin(t * 0.5 + 1) > 0.55);
    p.arms[1] = up ? { upper: 0.35, fore: 2.35 } : { upper: 0.15, fore: 1.3 };
    f._cigUp = up;
  }
  if (arm === 'drunk') {
    p.arms[1] = { upper: 1.3 + Math.sin(t * 1.3) * 0.5, fore: 0.8 };
    p.lean += Math.sin(t * 0.9) * 0.06;
    p.headTilt = Math.sin(t * 1.1) * 0.12;
  }
  if (f.pose === 'sit' && arm === 'rest') p.arms[1] = { upper: 0.5, fore: 1.1 };
  if (f.doze) {
    // asleep at the table, head down by the plate
    p.lean = 0.95; p.headTilt = 0.5 + Math.sin(t * 0.8) * 0.03;
    p.arms[1] = { upper: 1.25, fore: 0.55 }; p.arms[0] = { upper: 1.1, fore: 0.7 };
  }
  if (f.slump) {
    p.hipY = -16; p.lean = 1.35; p.headTilt = 0.6;
    p.legs[0] = { thigh: 1.55, knee: 0.1 }; p.legs[1] = { thigh: 1.4, knee: 0.3 };
    p.arms[0] = { upper: 0.2, fore: 0.1 }; p.arms[1] = { upper: 0.8, fore: 0.2 };
  }
  return p;
}

function limb(ctx, x, y, a1, l1, a2, l2, w1, w2, color) {
  // a1/a2 are angles from straight-down, positive = forward.
  const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1;
  const ex = kx + Math.sin(a2) * l2, ey = ky + Math.cos(a2) * l2;
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = w1;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
  ctx.lineWidth = w2;
  ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ex, ey); ctx.stroke();
  return [kx, ky, ex, ey];
}

function drawFigureLocal(ctx, f, t) {
  const L = f.look, p = resolvePose(f, t), b = L.build || 1;
  const hipY = p.hipY + p.bob;

  const drawLeg = (i, shade) => {
    const lg = p.legs[i];
    const hx = (i ? 3 : -3);
    const [kx, ky, ax, ay] = limb(ctx, hx, hipY, lg.thigh, 46, lg.thigh - lg.knee, 44, 15 * b, 12 * b, shade ? L.coatDark && L.pants ? shadeColor(L.pants, -0.35) : L.pants : L.pants);
    if (L.top === 'tux' || L.top === 'tails' || L.top === 'uniform') {
      // side stripe down the trouser leg
      ctx.strokeStyle = L.top === 'uniform' ? (L.trim || '#9e1f28') : 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(hx, hipY); ctx.lineTo(kx, ky); ctx.lineTo(ax, ay); ctx.stroke();
    }
    // shoe
    const fa = f.airborne ? 0.4 : (f.pose === 'sit' ? 0 : Math.max(-0.4, Math.min(0.5, lg.thigh - lg.knee)) * 0.5);
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(-fa);
    ctx.fillStyle = shade ? shadeColor(L.shoes, -0.3) : L.shoes;
    ctx.beginPath(); ctx.moveTo(-6, -5); ctx.quadraticCurveTo(14, -8, 17, 1); ctx.lineTo(17, 4); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(4, -5.5, 8, 1);
    ctx.restore();
  };

  // Upper body is rotated around the hip by the lean angle.
  const withUpper = fn => {
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(p.lean); ctx.translate(0, -hipY); fn(); ctx.restore();
  };
  const shoulderY = hipY - 56, sx = 2;

  const drawArm = (i, shade) => {
    withUpper(() => {
      const a = p.arms[i];
      const col = shade ? L.coatDark : L.coat;
      const [ex, ey, hx, hy] = limb(ctx, sx + (i ? 2 : -4), shoulderY + 6, a.upper, 30, a.upper + a.fore, 28, 12 * b, 10.5 * b, col);
      // cuff + hand
      ellipse(ctx, hx, hy, 5, 5.5, shade ? shadeColor(L.skin, -0.3) : L.skin);
      if (i === 1 && f.arm === 'tray') {
        ctx.fillStyle = '#c9ccd0'; ctx.fillRect(hx - 26, hy - 8, 52, 4);
        for (let k = 0; k < (f.trayGlasses ?? 3); k++) drawFlute(ctx, hx - 18 + k * 14, hy - 8);
      }
      if (i === 1 && (f.arm === 'toast' || f.holding === 'glass')) drawFlute(ctx, hx, hy - 4);
      if (i === 1 && f.arm === 'phone') { ctx.fillStyle = '#111'; ctx.fillRect(hx - 4, hy - 16, 8, 30); }
      if (i === 1 && f.arm === 'point') { ctx.fillStyle = '#1b1b1b'; ctx.fillRect(hx, hy - 2, 16, 3.5); ctx.fillStyle = '#c9a13b'; ctx.fillRect(hx + 13, hy - 2, 3, 3.5); }
      if (i === 1 && f.arm === 'cig') {
        ctx.fillStyle = '#eee'; ctx.fillRect(hx + 2, hy - 3, 10, 2);
        glow(ctx, hx + 12, hy - 2, 6, 'rgba(255,120,40,0.9)', 0.9);
        f._cigTip = [hx + 12, hy - 2];
      }
      if (i === 1 && f.holding === 'film') { ctx.fillStyle = '#2a2a2a'; ctx.fillRect(hx - 3, hy - 8, 6, 10); }
    });
  };

  // shadow
  if (!f.airborne) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(4, 0, 38 * b, 7, 0, 0, Math.PI * 2); ctx.fill();
  }

  drawArm(0, true);
  drawLeg(0, true);
  const coatLong = L.top === 'trench' || L.top === 'longcoat' || L.top === 'tails' || L.top === 'greatcoat' || L.top === 'dress';
  if (!coatLong) drawLeg(1, false);

  withUpper(() => {
    const top = hipY - 58, w = 17 * b;
    // Coat skirt (for long coats) swings with the legs.
    if (coatLong) {
      const sw = f.walking ? Math.sin(f.walkPhase) * 6 : 0;
      const hem = L.top === 'tails' ? hipY + 18 : f.pose === 'sit' ? hipY + 8 : hipY + 52 + (L.female ? 6 : 0) + (L.top === 'greatcoat' ? 10 : 0);
      if (L.top === 'tails') {
        poly(ctx, [-w + 1, hipY - 6, -w - 2 - sw * 0.5, hem + 26, -w + 10, hem + 30, 0, hipY], L.coatDark);
      } else {
        poly(ctx, [-w, hipY - 8, w + 2, hipY - 8, w + 8 + sw, hem, -w - 6 - sw * 0.5, hem + 2], linGrad(ctx, -w, 0, w, 0, [[0, L.coatDark], [0.7, L.coat], [1, shadeColor(L.coat, 0.08)]]));
        // fold line
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(4, hipY); ctx.lineTo(6 + sw, hem); ctx.stroke();
      }
    }
    if (L.apron) poly(ctx, [-w + 3, hipY - 12, w - 1, hipY - 12, w + 2, hipY + 62, -w + 1, hipY + 62], L.apron);
    // Torso
    const torso = [-w + 2, top + 4, -w - 1 * b, top + 30, -w + 3, hipY + 2, w, hipY + 2, w + 3 + (L.belly || 0) * 7, top + 38, w + 1, top + 4];
    poly(ctx, torso, linGrad(ctx, -w, 0, w, 0, [[0, L.coatDark], [0.65, L.coat], [1, shadeColor(L.coat, 0.1)]]));
    if (L.belly) ellipse(ctx, w - 2, top + 38, 10 * L.belly, 17 * L.belly, L.top === 'tails' || L.top === 'vest' ? L.shirt : L.coat);
    // Shirt / lapels
    if (L.top === 'tux' || L.top === 'tails' || L.top === 'trench' || L.top === 'waiter' || L.top === 'vest') {
      poly(ctx, [w - 12, top + 3, w - 1, top + 3, w + 1 + (L.belly || 0) * 5, top + 34, w - 5, top + 34], L.shirt);
      if (L.top !== 'waiter' && L.top !== 'vest') {
        poly(ctx, [w - 14, top + 2, w - 7, top + 2, w - 2, top + 36, w - 8, top + 42], shadeColor(L.coat, L.top === 'trench' ? -0.12 : 0.18));
      }
      // bow tie / tie
      if (L.top === 'tux' || L.top === 'tails' || L.top === 'waiter') {
        poly(ctx, [w - 7, top + 5, w + 1, top + 2, w + 1, top + 10, w - 7, top + 7], L.tie);
      } else if (L.top === 'trench') {
        poly(ctx, [w - 4, top + 4, w, top + 4, w + 1, top + 30, w - 3, top + 32], L.tie);
      }
    }
    if (L.top === 'greatcoat') {
      // wide collar, two rows of buttons, a belt for the uniformed ones
      poly(ctx, [-w + 1, top - 3, w - 1, top - 5, w - 8, top + 16, -w + 5, top + 12], shadeColor(L.coat, -0.14));
      poly(ctx, [w - 12, top + 2, w - 1, top + 2, w - 4, top + 14], L.scarf ? shadeColor(L.shirt, -0.05) : shadeColor(L.coat, -0.25));
      const bc = L.brass ? '#c9a13b' : '#15161a';
      for (let k = 0; k < 4; k++) { ellipse(ctx, w - 10, top + 18 + k * 11, 1.5, 1.5, bc); ellipse(ctx, w - 2, top + 18 + k * 11, 1.5, 1.5, bc); }
      if (L.belt) { rect(ctx, -w, hipY - 16, w * 2 + 2, 6, L.belt); rect(ctx, w - 9, hipY - 15, 6, 4, '#b8a14a'); }
      if (L.trim && L.brass) { rect(ctx, -w + 3, top - 1, 12, 3, L.trim); } // shoulder board
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(w - 6, top + 16); ctx.lineTo(w - 5, hipY); ctx.stroke();
    }
    if (L.top === 'dress') {
      // a cardigan over a flowered dress
      const r = rng(4); for (let k = 0; k < 14; k++) ellipse(ctx, -w + 3 + r() * (w * 2 - 6), top + 6 + r() * 50, 1.3, 1.3, 'rgba(240,210,160,0.45)');
      poly(ctx, [w - 12, top + 2, w - 1, top + 2, w - 6, top + 22], shadeColor(L.coat, 0.25));
    }
    if (L.top === 'trench') {
      // belt + collar
      rect(ctx, -w, hipY - 16, w * 2 + 2, 6, L.coatDark);
      poly(ctx, [-w + 2, top - 2, w - 4, top - 4, w - 10, top + 14, -w + 6, top + 10], shadeColor(L.coat, -0.08));
    }
    if (L.top === 'uniform') {
      rect(ctx, -w + 1, hipY - 14, w * 2, 6, L.belt);
      rect(ctx, w - 8, hipY - 13, 6, 4, '#b8a14a');
      for (let k = 0; k < 4; k++) ellipse(ctx, w - 3, top + 10 + k * 11, 1.8, 1.8, '#c9a13b');
      poly(ctx, [-w + 2, top + 2, w, top + 2, w - 4, top - 4, -w + 6, top - 4], L.trim);
      rect(ctx, -w + 2, top + 16, 10, 7, L.trim); // ribbon bar
      if (L.medals) {
        const rib = ['#9e1f28', '#1f4a9e', '#e8c040', '#2a7a3a', '#e8e0cc', '#9e1f28'];
        rib.forEach((c, k) => rect(ctx, -w + 2 + (k % 3) * 4, top + 24 + Math.floor(k / 3) * 3.5, 3.6, 3, c));
        for (let k = 0; k < 3; k++) { ellipse(ctx, -w + 4 + k * 4.5, top + 36, 1.8, 1.8, k % 2 ? '#c0c0c0' : '#d9b35c'); }
      }
    }
    if (L.sash) poly(ctx, [-w + 2, top + 6, -w + 12, top + 2, w + 6, hipY - 6, w - 4, hipY], L.sash);
    if (L.scarf) poly(ctx, [-w + 4, top - 2, w + 2, top - 3, w + 1, top + 8, -w + 4, top + 7], L.scarf);
    if (L.female && L.top === 'longcoat') {
      poly(ctx, [-w + 3, top - 4, w - 2, top - 6, w - 7, top + 16, -w + 6, top + 10], shadeColor(L.coat, -0.15));
    }

    // --- tailoring details -------------------------------------------------
    if (L.top === 'trench') {
      // double-breasted buttons, epaulette, belt buckle, storm flap seam
      for (let k = 0; k < 3; k++) { ellipse(ctx, w - 9, top + 16 + k * 10, 1.4, 1.4, '#3a2a1a'); ellipse(ctx, w - 2, top + 16 + k * 10, 1.4, 1.4, '#3a2a1a'); }
      rect(ctx, -w + 2, top - 1, 14, 3.5, shadeColor(L.coat, -0.15));
      ellipse(ctx, -w + 13, top + 0.8, 1, 1, '#3a2a1a');
      rect(ctx, w - 12, hipY - 17, 7, 8, '#3a2a1a'); rect(ctx, w - 10.5, hipY - 15.5, 4, 5, L.coat);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-w + 4, top + 22); ctx.lineTo(w - 12, top + 20); ctx.stroke();
    }
    if (L.top === 'tux' || L.top === 'tails') {
      // satin lapel sheen, shirt studs, pocket square, cufflink glint
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(w - 13.4, top + 3); ctx.lineTo(w - 7.6, top + 38); ctx.stroke();
      for (let k = 0; k < 3; k++) ellipse(ctx, w - 4.5, top + 14 + k * 7, 0.8, 0.8, '#111');
      if (L.top === 'tux') poly(ctx, [-w + 5, top + 14, -w + 11, top + 12, -w + 10, top + 16, -w + 5, top + 16.5], '#f4f0e8');
      if (L.top === 'tux') ellipse(ctx, w - 7, hipY - 3, 1.2, 1.2, '#1a1a1a');
    }
    if (L.top === 'waiter') for (let k = 0; k < 3; k++) ellipse(ctx, w - 3, top + 16 + k * 9, 1.2, 1.2, '#c9a13b');
    if (L.stripes) { ctx.fillStyle = L.stripes; for (let k = 0; k < 6; k++) ctx.fillRect(-w + 1, top + 8 + k * 7, w * 2 - 1, 2.6); }
    if (L.top === 'vest') {
      for (let k = 0; k < 4; k++) ellipse(ctx, w - 2, top + 16 + k * 7, 1, 1, '#c9a13b');
      ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(w - 2, top + 30); ctx.quadraticCurveTo(w - 8, top + 36, w - 12, top + 31); ctx.stroke();
    }
    if (L.top === 'longcoat' && L.female) {
      // fur collar and buttons
      for (let k = 0; k < 7; k++) ellipse(ctx, -w + 5 + k * 4, top - 1 + Math.sin(k) * 1.5, 3.4, 3, k % 2 ? '#e8dfd0' : '#d8cfbf');
      for (let k = 0; k < 3; k++) ellipse(ctx, w - 3, top + 18 + k * 11, 1.4, 1.4, '#2a0a0e');
    }
    if (L.top === 'jacket' && !L.bare) {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.6;
      for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(-w + 3 + k * 4, top + 4); ctx.lineTo(-w + 2 + k * 4, hipY); ctx.stroke(); } // tweed
      for (let k = 0; k < 3; k++) ellipse(ctx, w - 3, top + 14 + k * 11, 1.2, 1.2, '#2a2418');
    }
    if (L.sash) {
      // order star pinned on the sash
      ctx.save(); ctx.translate(-w + 9, top + 20); ctx.fillStyle = '#e8d08a';
      ctx.beginPath(); for (let k = 0; k < 12; k++) { const r = k % 2 ? 1.6 : 4, a = k / 12 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill();
      ellipse(ctx, 0, 0, 1.4, 1.4, '#9e1f28'); ctx.restore();
    }
    // Neck + head
    const hx = 6, hy = top - 16;
    rect(ctx, hx - 5, top - 10, 10, 12, shadeColor(L.skin, -0.18));
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(p.headTilt + (f.headTurn || 0));
    drawHead(ctx, f, L, t);
    ctx.restore();
  });

  if (coatLong) {
    // near leg below the coat hem
    ctx.save();
    drawLeg(1, false);
    ctx.restore();
    // redraw hem over the near thigh for long coats
    withUpper(() => {
      if (L.top === 'tails') return;
      const w = 17 * b, sw = f.walking ? Math.sin(f.walkPhase) * 6 : 0;
      const hem = hipY + 52 + (L.female ? 6 : 0) + (L.top === 'greatcoat' ? 10 : 0);
      if (f.pose === 'sit' || f.crouch > 0.4 || f.slump) return;
      poly(ctx, [-w, hipY - 8, w + 2, hipY - 8, w + 8 + sw, hem, -w - 6 - sw * 0.5, hem + 2], linGrad(ctx, -w, 0, w, 0, [[0, L.coatDark], [0.7, L.coat], [1, shadeColor(L.coat, 0.08)]]));
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(4, hipY); ctx.lineTo(6 + sw, hem); ctx.stroke();
      if (L.top === 'trench') rect(ctx, -w, hipY - 16, w * 2 + 2, 6, L.coatDark);
      if (L.top === 'greatcoat' && L.belt) rect(ctx, -w, hipY - 16, w * 2 + 2, 6, L.belt);
      if (L.apron) poly(ctx, [-w + 3, hipY - 12, w - 1, hipY - 12, w + 2, hipY + 62, -w + 1, hipY + 62], L.apron);
    });
  }
  if (f.pushing) drawTrolley(ctx, f);
  drawArm(1, false);
}

// Auntie Zora's tea trolley: a dented urn, a row of glasses in metal holders.
function drawTrolley(ctx, f) {
  const x0 = 46, x1 = 118, top = -96;
  ctx.strokeStyle = '#5a5e62'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(40, top - 10); ctx.lineTo(x0, top); ctx.moveTo(x0, top); ctx.lineTo(x0, -8); ctx.moveTo(x1, top); ctx.lineTo(x1, -8); ctx.stroke();
  rect(ctx, x0 - 2, top - 3, x1 - x0 + 4, 5, '#8a8e92');
  rect(ctx, x0 - 2, -36, x1 - x0 + 4, 4, '#6a6e72');
  for (const wx of [x0 + 4, x1 - 4]) { ellipse(ctx, wx, -5, 5, 5, '#141414'); ellipse(ctx, wx, -5, 2, 2, '#8a8e92'); }
  // urn
  ctx.fillStyle = linGrad(ctx, 70, 0, 100, 0, [[0, '#6a4a1a'], [0.45, '#e0b060'], [1, '#6a4a1a']]);
  ctx.fillRect(70, top - 44, 30, 42); ellipse(ctx, 85, top - 44, 15, 4, '#c9a050'); ellipse(ctx, 85, top - 50, 5, 5, '#3a2a10');
  rect(ctx, 99, top - 16, 6, 3, '#8a6a2a');
  // glasses of tea in holders
  for (let k = 0; k < 3; k++) { rect(ctx, x0 + 2 + k * 8, top - 12, 6, 10, 'rgba(160,70,20,0.85)'); rect(ctx, x0 + 1 + k * 8, top - 6, 8, 4, '#9aa0a6'); }
  for (let k = 0; k < 5; k++) rect(ctx, x0 + 4 + k * 13, -48, 7, 11, 'rgba(210,220,230,0.6)');
  if (f.steam !== false) { ctx.save(); ctx.globalAlpha = 0.18; ellipse(ctx, 85 + Math.sin(G.t * 2) * 3, top - 62, 8, 5, '#f0f0f0'); ellipse(ctx, 87 + Math.sin(G.t * 2 + 1) * 4, top - 74, 10, 6, '#f0f0f0'); ctx.restore(); }
}

// Carnival masks, drawn over the face: a domino over the eyes, a white bauta, or the plague doctor's beak.
function drawMask(ctx, kind, col = '#1a1a1a') {
  if (kind === 'domino') {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(2, -5.5); ctx.quadraticCurveTo(9, -8, 14.5, -4); ctx.lineTo(14.8, 1); ctx.quadraticCurveTo(11, 3, 9, 1); ctx.quadraticCurveTo(6, 3, 2.5, 1.5); ctx.closePath(); ctx.fill();
    ellipse(ctx, 9, -1.4, 1.6, 1.2, '#050404');
    ctx.strokeStyle = '#c9a13b'; ctx.lineWidth = 0.6; ctx.stroke();
  } else if (kind === 'plague') {
    ctx.fillStyle = col === '#1a1a1a' ? '#ece6d8' : col;
    ctx.beginPath(); ctx.moveTo(-6, -13); ctx.quadraticCurveTo(8, -15, 13, -6); ctx.quadraticCurveTo(26, 0, 36, 14); ctx.quadraticCurveTo(24, 10, 14, 13); ctx.quadraticCurveTo(4, 18, -6, 12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(14, 2); ctx.quadraticCurveTo(24, 6, 35, 13.5); ctx.stroke();
    ellipse(ctx, 8.8, -2, 2.8, 2.8, '#101014'); ellipse(ctx, 8, -2.8, 0.9, 0.9, 'rgba(255,255,255,0.6)');
    ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(8.8, -2, 3, 0, 7); ctx.stroke();
  } else if (kind === 'bauta') {
    ctx.fillStyle = col === '#1a1a1a' ? '#f0ece4' : col;
    ctx.beginPath(); ctx.moveTo(-4, -13); ctx.quadraticCurveTo(10, -16, 14, -6); ctx.lineTo(16, 5); ctx.lineTo(19, 14); ctx.quadraticCurveTo(10, 18, -4, 13); ctx.closePath(); ctx.fill();
    ellipse(ctx, 9, -1.8, 1.6, 1.1, '#050404');
  }
}

function drawHead(ctx, f, L, t) {
  const skin = L.skin, dark = shadeColor(skin, -0.3);
  // back of head / hair under
  if (L.hairStyle === 'bob') ellipse(ctx, -3, 2, 15, 17, shadeColor(L.hair, -0.25));
  // face, lit from the front
  ctx.fillStyle = linGrad(ctx, -12, 0, 13, 0, [[0, dark], [0.55, skin], [1, shadeColor(skin, 0.07)]]);
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.quadraticCurveTo(4, -17, 11, -8);
  ctx.lineTo(12, -1.5);                         // brow ridge
  ctx.quadraticCurveTo(12, 0, 13.2, 1.5);
  ctx.lineTo(15.2, 4.6);                        // nose tip
  ctx.quadraticCurveTo(14.4, 6.2, 12, 6.2);
  ctx.lineTo(12.3, 8.4);                        // upper lip
  ctx.lineTo(11.6, 9.6);
  ctx.lineTo(12, 11);                           // lower lip
  ctx.quadraticCurveTo(10.5, 15.5, 4.5, 16.2);  // chin
  ctx.quadraticCurveTo(-6, 16.5, -10, 6);
  ctx.closePath(); ctx.fill();
  // cheek + jaw shading
  ctx.fillStyle = 'rgba(70,30,20,0.1)';
  ctx.beginPath(); ctx.ellipse(2, 12.5, 5, 2.4, 0.2, 0, 7); ctx.fill();
  if (L.flushed) glow(ctx, 7, 5, 7, 'rgba(210,50,40,0.55)', 0.8);
  if (L.female) glow(ctx, 7, 5, 3, 'rgba(230,110,110,0.25)', 0.6);
  if (L.stubble) { ctx.fillStyle = 'rgba(40,25,15,0.1)'; ctx.beginPath(); ctx.ellipse(6, 12.5, 5, 2.6, 0.1, 0, 7); ctx.fill(); }
  // ear with inner shadow
  ellipse(ctx, -3, 2, 3, 4.5, shadeColor(skin, -0.2));
  ellipse(ctx, -2.6, 2.4, 1.3, 2.4, shadeColor(skin, -0.42));
  if (L.earrings) ellipse(ctx, -2.5, 7.4, 1.3, 1.3, '#f4efe4');
  // eye: white, iris, lid; blinks now and then
  const blink = (Math.sin(t * 0.9 + (f.seed || 0) * 3) > 0.985) || f.slump;
  if (!blink) {
    ctx.fillStyle = '#efe8de';
    ctx.beginPath(); ctx.moveTo(5.6, -1.2); ctx.quadraticCurveTo(8.2, -3.4, 10.8, -1.4); ctx.quadraticCurveTo(8.2, 0.6, 5.6, -1.2); ctx.fill();
    ellipse(ctx, 9, -1.4, 1.35, 1.35, L.eye || '#3a2a1e');
    ellipse(ctx, 9.1, -1.4, 0.7, 0.7, '#050404');
    ctx.strokeStyle = L.female ? '#140a08' : 'rgba(30,15,10,0.8)'; ctx.lineWidth = L.female ? 0.9 : 0.6;
    ctx.beginPath(); ctx.moveTo(5.4, -1.3); ctx.quadraticCurveTo(8.2, -3.8, 11, -1.4); ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(30,15,10,0.8)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(5.6, -1); ctx.quadraticCurveTo(8.2, 0, 10.8, -1); ctx.stroke();
  }
  // brow
  ctx.strokeStyle = shadeColor(L.hair === '#d8d4cc' ? '#9a948a' : L.hairStyle === 'bob' ? '#a88a5a' : L.hair, -0.1);
  ctx.lineWidth = L.female ? 0.9 : 1.5; ctx.lineCap = 'round';
  const lift = (f.mouthOpen || 0) * 0.8;
  ctx.beginPath(); ctx.moveTo(4.8, -4 - lift * 0.5); ctx.quadraticCurveTo(8.4, -6.2 - lift, 11.6, -4.4 - lift * 0.6); ctx.stroke();
  // nose shading + nostril
  ctx.fillStyle = 'rgba(80,35,20,0.25)';
  ctx.beginPath(); ctx.moveTo(12, -1); ctx.quadraticCurveTo(12.6, 3, 11.4, 5.6); ctx.lineTo(13.4, 5.2); ctx.closePath(); ctx.fill();
  ellipse(ctx, 12.8, 5.4, 0.9, 0.5, 'rgba(40,15,10,0.6)');
  if (L.glasses) {
    ctx.strokeStyle = '#3a3026'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(8.6, -1.3, 3.4, 0, 7); ctx.moveTo(12, -1.5); ctx.lineTo(13.5, -1.8); ctx.moveTo(5.2, -1.6); ctx.lineTo(-2, -0.5); ctx.stroke();
  }
  if (L.monocle) {
    ctx.strokeStyle = '#d9c27a'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(8.6, -1.2, 3.8, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8.6, 2.6); ctx.quadraticCurveTo(6, 14, 2, 22); ctx.lineWidth = 0.4; ctx.stroke();
  }
  // mouth: opens with the voice
  const open = clamp(f.mouthOpen || 0, 0, 1);
  if (open > 0.05) ellipse(ctx, 11.4, 9.2 + open * 0.8, 1.9, 0.5 + open * 1.8, '#2a0c0a');
  ctx.fillStyle = L.lips || shadeColor(skin, -0.38);
  ctx.beginPath(); ctx.moveTo(9, 8.6); ctx.quadraticCurveTo(10.6, 7.6, 12.4, 8.4); ctx.lineTo(12, 9); ctx.lineTo(9.4, 9.1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(9.4, 9.6 + open * 1.6); ctx.quadraticCurveTo(10.8, 11.2 + open * 2, 12.1, 9.8 + open * 1.6); ctx.lineTo(9.4, 9.6 + open * 1.6); ctx.fill();
  if (L.mustache) {
    ctx.fillStyle = shadeColor(L.hair === '#5a5550' ? '#3a3632' : L.hair, -0.1);
    ctx.beginPath(); ctx.moveTo(8, 6.8); ctx.quadraticCurveTo(11, 5.6, 14, 7); ctx.quadraticCurveTo(14.6, 8.4, 13.4, 8.6); ctx.quadraticCurveTo(11, 7.8, 8.4, 8.8); ctx.fill();
  }
  // hair
  const h = L.hair;
  if (L.hairStyle === 'slick') {
    ctx.fillStyle = linGrad(ctx, -14, -16, 12, -4, [[0, shadeColor(h, -0.2)], [0.6, h], [1, shadeColor(h, 0.15)]]);
    ctx.beginPath(); ctx.moveTo(-11, 4); ctx.quadraticCurveTo(-14, -16, 2, -17.5); ctx.quadraticCurveTo(12.5, -17, 12.4, -7);
    ctx.quadraticCurveTo(4, -12.5, -4, -8); ctx.quadraticCurveTo(-6, -2, -6.5, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,220,0.18)'; ctx.lineWidth = 0.6;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-9 + k, -9 - k * 1.5); ctx.quadraticCurveTo(0, -16 + k, 10 - k, -11 + k * 0.5); ctx.stroke(); }
    ctx.fillStyle = shadeColor(h, -0.1); ctx.fillRect(-7.2, -2, 2, 7); // sideburn
  } else if (L.hairStyle === 'bob') {
    ctx.fillStyle = linGrad(ctx, -14, 0, 12, 0, [[0, shadeColor(h, -0.25)], [1, h]]);
    ctx.beginPath(); ctx.moveTo(-14, 12); ctx.quadraticCurveTo(-18, -18, 2, -18); ctx.quadraticCurveTo(14, -18, 13, -4);
    ctx.quadraticCurveTo(6, -10, 2, -6); ctx.quadraticCurveTo(-1, 4, -2, 13); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,250,230,0.45)'; ctx.lineWidth = 0.7;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-6 + k * 3, -15); ctx.quadraticCurveTo(-12 + k * 3, 0, -11 + k * 3, 11); ctx.stroke(); }
  } else if (L.hairStyle === 'bald') {
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-11, 6); ctx.quadraticCurveTo(-12, -4, -7, -8); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
    ellipse(ctx, 1, -13.5, 5, 1.6, 'rgba(255,255,255,0.22)');
  } else if (L.hairStyle === 'mohawk') {
    // shaved sides, and a crest of spikes from brow to nape
    ctx.fillStyle = 'rgba(40,30,30,0.35)'; ctx.beginPath(); ctx.moveTo(-11, 5); ctx.quadraticCurveTo(-13, -12, 0, -16); ctx.quadraticCurveTo(10, -16, 12, -8); ctx.quadraticCurveTo(4, -12, -6, -6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-12, -6);
    for (let k = 0; k <= 6; k++) { const x = -12 + k * 3.8, y = -15 - Math.sin((k / 6) * Math.PI) * 3; ctx.lineTo(x - 1.6, y); ctx.lineTo(x + 0.4, y - 10 - (k % 2) * 3); }
    ctx.lineTo(12, -12); ctx.quadraticCurveTo(0, -18, -12, -6); ctx.fill();
  } else if (L.hairStyle === 'cap') {
    ctx.fillStyle = h; ctx.fillRect(-10, -8, 6, 12);
    poly(ctx, [-13, -11, 13, -11, 16, -21, -9, -24], L.cap);
    rect(ctx, -12, -13, 26, 4, L.capBand);
    poly(ctx, [6, -10, 20, -8, 20, -6, 6, -7], '#111');
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(8, -9.4, 10, 0.6);
    ellipse(ctx, 4, -19, 2.2, 2.2, L.badge || '#c9a13b');
  } else if (L.hairStyle === 'fedora') {
    ctx.fillStyle = h; ctx.fillRect(-7.2, -4, 2.2, 9); ctx.fillRect(-11, -8, 5, 10);
    poly(ctx, [-11, -10, 12, -10, 10, -23, 4, -21, -2, -24, -8, -23], L.hat);
    rect(ctx, -11, -13, 23, 3.4, L.hatBand);
    ctx.fillStyle = L.hat; ctx.beginPath(); ctx.ellipse(1, -10.5, 18, 3.2, -0.04, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(-6, -21, 12, 1);
  } else if (L.hairStyle === 'ushanka') {
    const fur = L.fur;
    ellipse(ctx, -6, 3, 6.5, 10, shadeColor(fur, -0.15));            // ear flap
    ellipse(ctx, 0, -15, 15.5, 9.5, fur);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.6;
    for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.moveTo(-13 + k * 2.8, -12); ctx.lineTo(-12.5 + k * 2.8, -9); ctx.stroke(); }
    ctx.fillStyle = shadeColor(fur, 0.12); rrect(ctx, -12, -15, 27, 7, 3); ctx.fill();   // turned-up front
    ctx.fillStyle = L.capBadge || '#c9a13b';
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.2 : 2.8, a = -Math.PI / 2 + k / 10 * Math.PI * 2; ctx.lineTo(8 + Math.cos(a) * r, -11.5 + Math.sin(a) * r); } ctx.fill();
  } else if (L.hairStyle === 'furhat') {
    ctx.fillStyle = h; ctx.beginPath(); ctx.moveTo(-12, 10); ctx.quadraticCurveTo(-15, -8, 0, -12); ctx.lineTo(9, -9); ctx.quadraticCurveTo(-2, -6, -4, 4); ctx.quadraticCurveTo(-5, 10, -12, 10); ctx.fill();
    ellipse(ctx, -9, 3, 5, 6, shadeColor(h, -0.2)); // bun
    ellipse(ctx, 0, -16, 15, 7.5, L.fur);
    ctx.strokeStyle = 'rgba(120,110,100,0.35)'; ctx.lineWidth = 0.6;
    for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.moveTo(-13 + k * 2, -20 + (k % 3)); ctx.lineTo(-12 + k * 2, -12); ctx.stroke(); }
    ellipse(ctx, 0, -11, 15, 2.4, shadeColor(L.fur, -0.12));
  } else if (L.hairStyle === 'kerchief') {
    ctx.fillStyle = h; ctx.fillRect(4, -12, 7, 3);
    ctx.fillStyle = L.kerchief;
    ctx.beginPath(); ctx.moveTo(-12, 12); ctx.quadraticCurveTo(-16, -14, 2, -18.5); ctx.quadraticCurveTo(12, -17, 12.5, -9); ctx.lineTo(8, -11); ctx.quadraticCurveTo(-2, -12, -4, 2); ctx.lineTo(-3, 13); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip(); const r = rng(3);
    for (let k = 0; k < 30; k++) ellipse(ctx, -14 + r() * 26, -19 + r() * 32, 0.9, 0.9, k % 3 ? 'rgba(255,240,200,0.55)' : 'rgba(220,60,60,0.6)');
    ctx.restore();
    poly(ctx, [-4, 12, 4, 15, -1, 21, -8, 18], L.kerchief); // knot
  } else if (L.hairStyle === 'chef') {
    ctx.fillStyle = h; ctx.fillRect(-10, -6, 6, 10);
    ctx.fillStyle = '#f8f6f0'; ctx.fillRect(-11, -16, 22, 8);
    ctx.beginPath(); ctx.moveTo(-12, -15); ctx.bezierCurveTo(-18, -36, 0, -44, 2, -34); ctx.bezierCurveTo(6, -46, 22, -36, 12, -15); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.8; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-6 + k * 5, -16); ctx.lineTo(-7 + k * 5, -32); ctx.stroke(); }
  } else if (L.hairStyle === 'bun') {
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-11, 6); ctx.quadraticCurveTo(-15, -16, 2, -17.5); ctx.quadraticCurveTo(12, -17, 12.4, -8); ctx.quadraticCurveTo(4, -12, -4, -8); ctx.quadraticCurveTo(-6, -2, -6, 6); ctx.closePath(); ctx.fill();
    ellipse(ctx, -9, -12, 7, 7, shadeColor(h, -0.1));
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.6; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-8 + k * 3, -15); ctx.quadraticCurveTo(0, -17, 8, -12 + k); ctx.stroke(); }
  } else if (L.hairStyle === 'braids') {
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.moveTo(-11, 6); ctx.quadraticCurveTo(-15, -16, 2, -17.5); ctx.quadraticCurveTo(12, -17, 12.4, -6); ctx.quadraticCurveTo(6, -12, 3, -8); ctx.quadraticCurveTo(-2, -2, -5, 6); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 4; k++) ellipse(ctx, -8 + Math.sin(t * 2) * 0.5, 8 + k * 5, 3.2, 3, shadeColor(h, k % 2 ? -0.1 : 0.05));
    ellipse(ctx, -8, 28, 3, 2, '#c8303a'); // ribbon
  } else if (L.hairStyle === 'flatcap') {
    ctx.fillStyle = h; ctx.fillRect(-11, -6, 7, 10);
    poly(ctx, [-13, -9, 10, -14, 20, -8, 12, -6, -12, -3], L.cap);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-10 + k * 5, -10); ctx.lineTo(-9 + k * 5, -4); ctx.stroke(); }
  }
  if (f.mask || L.mask) drawMask(ctx, f.mask || L.mask, f.maskColor || L.maskColor);
}

function drawFlute(ctx, x, y) {
  ctx.fillStyle = 'rgba(230,220,180,0.75)';
  ctx.beginPath(); ctx.moveTo(x - 3, y - 18); ctx.lineTo(x + 3, y - 18); ctx.lineTo(x + 1.5, y - 7); ctx.lineTo(x - 1.5, y - 7); ctx.fill();
  ctx.fillStyle = 'rgba(240,200,90,0.8)'; ctx.fillRect(x - 2.5, y - 15, 5, 7);
  ctx.fillStyle = 'rgba(220,220,220,0.8)'; ctx.fillRect(x - 0.6, y - 7, 1.2, 6); ctx.fillRect(x - 3, y - 1.5, 6, 1.5);
}

function shadeColor(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// Draw a figure into the scene with scene lighting.
// light: { ambient: 'rgba(...)' (multiply tint), key: 'rgba(...)' (rim), keyX }
function drawFigure(ctx, f, t, light) {
  const s = f.scale;
  const bw = FIG_BUF.width, bh = FIG_BUF.height;
  const c = FIG_CTX;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, bw, bh);
  c.globalCompositeOperation = 'source-over';
  // Local render at fixed 3x so thin details survive, then scale into scene.
  const R = 3.4;
  c.setTransform(R * f.facing, 0, 0, R, bw / 2, bh - 30);
  drawFigureLocal(c, f, t);
  c.setTransform(1, 0, 0, 1, 0, 0);
  // Lighting: ambient tint over the figure only.
  if (light) {
    c.globalCompositeOperation = 'source-atop';
    if (light.ambient) { c.fillStyle = light.ambient; c.fillRect(0, 0, bw, bh); }
    if (light.key) {
      const dir = (light.keyX ?? W / 2) < f.x ? -1 : 1;
      c.fillStyle = linGrad(c, bw / 2 - dir * 120, 0, bw / 2 + dir * 120, 0, [[0, 'rgba(0,0,0,0)'], [0.55, 'rgba(0,0,0,0)'], [1, light.key]]);
      c.fillRect(0, 0, bw, bh);
    }
    if (light.top) {
      c.fillStyle = linGrad(c, 0, bh * 0.2, 0, bh, [[0, light.top], [0.6, 'rgba(0,0,0,0)']]);
      c.fillRect(0, 0, bw, bh);
    }
    c.globalCompositeOperation = 'source-over';
  }
  const k = s / R;
  ctx.drawImage(FIG_BUF, f.x - (bw / 2) * k, f.y - (bh - 30) * k, bw * k, bh * k);
}

// Screen-space bounding box of a figure (for hotspots and speech placement).
function figureBox(f) {
  const s = f.scale, h = (f.pose === 'sit' ? 140 : 190) * s;
  return { x: f.x - 34 * s, y: f.y - h, w: 68 * s, h, headY: f.y - h };
}

// Figure factory.
function makeFigure(lookName, x, y, opts = {}) {
  return Object.assign({
    look: LOOKS[lookName], lookName, x, y, scale: 2, facing: 1, walking: false, walkPhase: 0,
    talking: false, arm: 'rest', pose: 'stand', seed: Math.random() * 10, crouch: 0,
  }, opts);
}
