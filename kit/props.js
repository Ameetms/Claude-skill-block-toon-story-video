// props.js — set pieces built only from box(); copy the pattern for any location (shop, school, street, kitchen…)
import { THREE, box, grp, rng, makeChar, SKIN } from './blockkit.js';
export const PAL = { wall: '#dcbf96', floor: '#c7aa7d', stone: '#d9c39b', wain: '#b99a6f', wood: '#4a2a16', gold: '#e0990d', navy: '#16203a', red: '#a3160f', teal: '#1f8f8c' };
export function tileTex(rep = [10, 16]) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#cdb184'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#c2a578'; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128);
  x.strokeStyle = '#a98c60'; x.lineWidth = 7; x.strokeRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
/** room along -z: floor, 3 walls (+ back wall behind camera), wainscot + rail. w=width(x) d=depth(z) h=height. returns group */
export function room(scene, { w = 12, d = 40, h = 9, z0 = -14 } = {}) {
  const S = grp(scene), W = PAL.wall;
  const fl = new THREE.Mesh(new THREE.BoxGeometry(w, .2, d), new THREE.MeshLambertMaterial({ map: tileTex() })); fl.position.set(0, -.1, z0); fl.receiveShadow = true; S.add(fl);
  box(.4, h, d, W, { parent: S, pos: [-w / 2, h / 2, z0], line: false }); box(.4, h, d, W, { parent: S, pos: [w / 2, h / 2, z0], line: false });
  box(w + .4, h, .4, W, { parent: S, pos: [0, h / 2, z0 - d / 2], line: false }); box(w + .4, h, .4, W, { parent: S, pos: [0, h / 2, z0 + d / 2], line: false });
  for (const s of [-1, 1]) { box(.2, 1.1, d, PAL.wain, { parent: S, pos: [s * (w / 2 - .2), .55, z0], line: false }); box(.26, .08, d, '#8a6a42', { parent: S, pos: [s * (w / 2 - .27), 1.12, z0], line: false }); }
  return S;
}
export function chair(parent, pos, rot = [0, 0, 0]) {     // gold-framed red barber/shoeshine chair
  const g = grp(parent, pos); g.rotation.set(...rot);
  box(.5, .12, .55, PAL.gold, { parent: g, pos: [0, .06, 0], r: .05 }); box(.1, .35, .1, PAL.gold, { parent: g, pos: [0, .28, 0], r: .03 });
  box(.62, .16, .62, PAL.red, { parent: g, pos: [0, .52, 0], r: .06 }); box(.62, .72, .14, PAL.red, { parent: g, pos: [0, .95, -.3], rot: [-.12, 0, 0], r: .06 });
  for (const s of [-1, 1]) { box(.08, .08, .5, PAL.gold, { parent: g, pos: [s * .36, .78, 0], r: .03 }); box(.07, .3, .07, PAL.gold, { parent: g, pos: [s * .36, .62, .17], r: .02, line: false }); }
  box(.4, .06, .3, PAL.gold, { parent: g, pos: [0, .2, .55], rot: [.2, 0, 0], r: .02 }); return g;
}
export function bench(parent, pos, rot = 0) {
  const g = grp(parent, pos); g.rotation.y = rot;
  box(1.8, .09, .45, PAL.wood, { parent: g, pos: [0, .5, 0], r: .03 }); box(1.8, .5, .07, PAL.wood, { parent: g, pos: [0, .78, -.2], rot: [-.12, 0, 0], r: .03 });
  for (const s of [-.8, .8]) box(.08, .5, .4, '#2c1a0e', { parent: g, pos: [s, .25, 0], r: .02, line: false }); return g;
}
/** low-detail background people (lod:1 = no fingers, fewer boxes). avoid(x,z) keeps a zone clear */
export function crowd(scene, n, { x = [-4.5, 4.5], z = [-16, 3], seed = 4, avoid = () => false } = {}) {
  const R = rng(seed), out = [], skins = [SKIN.peach, SKIN.tan, SKIN.brown, SKIN.dark, SKIN.light], hairs = ['#14110f', '#59321a', '#8a6a3a', '#2a1a10', '#b09060'], fits = ['gray', 'green', 'tan', 'navy', 'teal', 'suit'];
  for (let i = 0; i < n; i++) {
    const c = makeChar({ skin: skins[(R() * skins.length) | 0], hair: hairs[(R() * hairs.length) | 0], hairStyle: ['short', 'quiff', 'long'][(R() * 3) | 0], outfit: fits[(R() * fits.length) | 0], seed: i + 11, lod: 1 });
    c.p.x = x[0] + R() * (x[1] - x[0]); c.p.z = z[0] + R() * (z[1] - z[0]); c.p.yaw = (R() - .5) * 6; if (avoid(c.p.x, c.p.z)) c.p.x += 2.4;
    scene.add(c.root); out.push(c);
  } return out;
}
