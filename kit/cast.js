// cast.js — five original characters in the block-toon style (reusable in any scene.html: `import { makeCast, makeOne, pose } from '/cast.js'`)
import * as K from '/blockkit.js';
const { box } = K;

/* swatches are shown on the design sheet: [skin, hair, outfit, accent] */
export const DEF = {
  mira: { name: 'MIRA', role: 'Lead / narrator', sw: ['#8a5230', '#2a1a10', '#1c8a8a', '#ff5b4d'] },
  pip:  { name: 'PIP', role: 'Kid sidekick', sw: ['#f4c49a', '#c9622a', '#f5c32c', '#2a3340'] },
  dana: { name: 'OFFICER DANA', role: 'Strict authority', sw: ['#f4c49a', '#14110f', '#1c2a49', '#e0990d'] },
  gus:  { name: 'GUS', role: 'Cheerful baker', sw: ['#d89a62', '#6a3a1a', '#fbf8f1', '#c0392b'] },
  pim:  { name: 'PROF. PIM', role: 'Wise older man', sw: ['#efaa71', '#c8c8cc', '#a9a9ad', '#a3160f'] },
};

const BUILD = {
  /* MIRA: long dark hair, round glasses, teal jacket, coral scarf, gold hair clip */
  mira() {
    const C = K.makeChar({ skin: K.SKIN.brown, hair: '#2a1a10', hairStyle: 'long', glasses: true, seed: 21,
      outfit: { top: '#1c8a8a', trim: '#146a6a', pants: '#2a2f45', shoes: '#f2efe9', shirt: '#f2efe9' } });
    box(.27, .09, .25, '#ff5b4d', { parent: C.torso, pos: [0, .56, 0], r: .04 });                  // scarf around the neck
    box(.085, .3, .03, '#ff5b4d', { parent: C.torso, pos: [.085, .4, .13], r: .014 });             // scarf tail
    box(.06, .05, .03, '#f5c32c', { parent: C.head, pos: [-.17, .52, .14], r: .012 });             // hair clip
    C.iris = '#3a2414'; C.face.blush = true; return C;
  },
  /* PIP: small, big head, orange quiff, yellow hoodie, white sneakers */
  pip() {
    const C = K.makeChar({ skin: K.SKIN.light, hair: '#c9622a', hairStyle: 'quiff', seed: 22, scale: .72, headScale: 1.22,
      outfit: { top: '#f5c32c', trim: '#d9a91c', pants: '#2a3340', shoes: '#f2efe9', shirt: '#f5c32c' } });
    box(.4, .14, .2, '#e8b51f', { parent: C.torso, pos: [0, .55, -.12], r: .06 });                 // hood bunched behind the neck
    box(.3, .12, .03, '#d9a91c', { parent: C.torso, pos: [0, .1, .135], r: .015 });                // pocket
    C.iris = '#3a8a4a'; C.face.blush = true; return C;
  },
  /* DANA: police cap, black ponytail, navy uniform, chest radio */
  dana() {
    const C = K.makeChar({ skin: K.SKIN.light, hair: '#14110f', hairStyle: 'short', hat: 'police', outfit: 'uniform', seed: 23, scale: 1.06 });
    box(.11, .3, .11, '#14110f', { parent: C.head, pos: [0, .24, -.27], rot: [.25, 0, 0], r: .04 }); // ponytail
    box(.065, .13, .05, '#111111', { parent: C.torso, pos: [-.14, .42, .14], r: .015 });            // chest radio
    box(.02, .08, .02, '#111111', { parent: C.torso, pos: [-.14, .53, .14], line: false });
    C.iris = '#2f5f8a'; return C;
  },
  /* GUS: tall chef hat, red apron, brown mustache */
  gus() {
    const C = K.makeChar({ skin: K.SKIN.tan, hair: '#6a3a1a', hairStyle: 'short', seed: 24, scale: 1.04,
      outfit: { top: '#fbf8f1', trim: '#e4dccd', pants: '#3a3a44', shoes: '#0c0a0a', apron: '#c0392b', shirt: '#fbf8f1' } });
    box(.48, .1, .43, '#fbf8f1', { parent: C.head, pos: [0, .53, -.005], r: .04 });                 // hat band
    box(.54, .34, .48, '#fbf8f1', { parent: C.head, pos: [0, .79, -.005], r: .15 });                // hat puff
    box(.2, .05, .05, '#4a2810', { parent: C.head, pos: [0, .135, .2], r: .02 });                   // mustache
    C.iris = '#4a2e1a'; C.face.blush = true; return C;
  },
  /* PROF. PIM: grey hair, glasses, white mustache + brows, grey suit, red pocket square */
  pim() {
    const C = K.makeChar({ skin: K.SKIN.peach, hair: '#c8c8cc', hairStyle: 'short', glasses: true, outfit: 'gray', seed: 25, scale: .98 });
    box(.2, .04, .05, '#f4f1ea', { parent: C.head, pos: [0, .152, .2], r: .018 });                  // white mustache (sits above the painted mouth)
    box(.055, .05, .02, '#ff5b4d', { parent: C.torso, pos: [-.15, .42, .135], r: .01, line: false });
    C.iris = '#6a7a8a'; C.browCol = '#d9d9dc'; return C;
  },
};
export const makeOne = name => BUILD[name]();
export const makeCast = () => Object.fromEntries(Object.keys(BUILD).map(n => [n, BUILD[n]()]));

/* clean "model sheet" poses: call every frame BEFORE idle()/applyPose(); name = cast key */
export function pose(name, C) {
  const f = K.FACE0(); f.glasses = C.face.glasses; f.iris = C.iris; f.blush = C.face.blush; if (C.browCol) f.browCol = C.browCol; C.face = f;
  const P = C.p; Object.assign(P, { x: 0, y: 0, z: 0, yaw: 0, lean: 0, twist: 0, sway: 0, bob: 0, headYaw: 0, headPitch: 0, headRoll: 0, armL: [0, .12, .1, .25], armR: [0, .12, .1, .25], legs: [0, 0, 0, 0] });
  if (name === 'mira') { f.smile = .7; f.mouth = .25; f.brow = [.25, -.15, .3]; P.armR = [.95, .22, 1.55, .12, .5, .3]; P.headRoll = .06; P.yaw = -.15; }   // open-palm "explaining" gesture
  if (name === 'pip')  { f.smile = .9; f.mouth = .7; f.brow = [.5, -.2, .4]; P.armR = [2.5, .35, .3, .05, .7, .6]; P.headRoll = .1; P.yaw = .25; P.lean = -.04; }
  if (name === 'dana') { f.smile = -.45; f.mouth = 0; f.brow = [-.15, .85, .2]; f.squint = .25; P.armL = [.25, .45, 1.15, .7]; P.armR = [.25, .45, 1.15, .7]; }
  if (name === 'gus')  { f.smile = 1; f.mouth = .55; f.brow = [.35, -.25, .4]; P.armR = [1.0, .3, 1.5, .9, 0, 1]; P.yaw = -.2; P.headRoll = -.07; }
  if (name === 'pim')  { f.smile = .1; f.mouth = 0; f.brow = [.45, -.55, .3]; P.armR = [1.25, .08, 2.3, .6]; P.headRoll = .09; P.headPitch = .1; P.lean = .05; P.yaw = .2; }
}
