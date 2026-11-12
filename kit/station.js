// station.js — example set built only from kit primitives (replace with any other location: same recipe).
import { THREE, box, grp, mat, sign, textTex, rng, makeChar, OUTFITS, SKIN } from './blockkit.js';
const STONE = '#d9c39b', WALL = '#dcbf96', FLOOR = '#c7aa7d', WOOD = '#4a2a16', GOLD = '#e0990d', NAVY = '#16203a';

function tileTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#cdb184'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#c2a578'; x.fillRect(0, 0, 128, 128); x.fillRect(128, 128, 128, 128);
  x.strokeStyle = '#a98c60'; x.lineWidth = 7; x.strokeRect(0, 0, 256, 256); x.lineWidth = 5; x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.moveTo(0, 128); x.lineTo(256, 128); x.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 16); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function windowPane(parent, w, h, pos, rot = [0, 0, 0], arch = false) {
  const g = grp(parent, pos); g.rotation.set(...rot);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: '#c9deee' })); g.add(sky);
  if (arch) { const d = new THREE.Mesh(new THREE.CircleGeometry(w / 2, 32, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#c9deee' })); d.position.y = h / 2; g.add(d); }
  const n = Math.round(w / .55); for (let i = 1; i < n; i++) box(.045, h + (arch ? w / 2 : 0), .05, '#0d1216', { parent: g, pos: [-w / 2 + i * w / n, arch ? w / 4 : 0, .03], r: .01, line: false });
  const m = Math.round(h / .6); for (let j = 0; j <= m; j++) box(w, .045, .05, '#0d1216', { parent: g, pos: [0, -h / 2 + j * h / m, .03], r: .01, line: false });
  if (arch) for (let k = 1; k < 6; k++) { const a = Math.PI * k / 6; box(.045, w / 2, .05, '#0d1216', { parent: g, pos: [Math.cos(a) * w / 4, h / 2 + Math.sin(a) * w / 4, .03], rot: [0, 0, a - Math.PI / 2], r: .01, line: false }); }
  return g;
}
export function archRing(parent, R, pos, depth = .6) {
  const n = 19, g = grp(parent, pos);
  for (let i = 0; i < n; i++) { const a = Math.PI * (i + .5) / n; box(.62, .6 + (i % 2) * .08, depth, STONE, { parent: g, pos: [Math.cos(a) * (R + .3), Math.sin(a) * (R + .3), 0], rot: [0, 0, a - Math.PI / 2], r: .05, line: true }); }
  return g;
}
export function door(parent, pos, rot = [0, 0, 0]) {
  const g = grp(parent, pos); g.rotation.set(...rot);
  box(1.9, 3.0, .25, NAVY, { parent: g, pos: [0, 1.5, 0], r: .03 }); box(.05, 3.0, .27, GOLD, { parent: g, pos: [0, 1.5, 0], r: .01, line: false });
  box(2.15, .16, .35, GOLD, { parent: g, pos: [0, 3.08, 0], r: .03 }); sign(g, 'TO TRAINS', 1.5, .42, [0, 3.45, .06], [0, 0, 0], { bg: '#15275a', fg: '#f2f5fb', border: null, font: '800 92px Poppins' });
  return g;
}
export function chair(parent, pos, rot = [0, 0, 0]) {
  const g = grp(parent, pos); g.rotation.set(...rot);
  box(.5, .12, .55, GOLD, { parent: g, pos: [0, .06, 0], r: .05 }); box(.1, .35, .1, GOLD, { parent: g, pos: [0, .28, 0], r: .03 });
  box(.62, .16, .62, '#a3160f', { parent: g, pos: [0, .52, 0], r: .06 }); box(.62, .72, .14, '#a3160f', { parent: g, pos: [0, .95, -.3], rot: [-.12, 0, 0], r: .06 }); box(.66, .08, .6, '#6b1410', { parent: g, pos: [0, .43, 0], r: .03, line: false });
  for (const s of [-1, 1]) { box(.08, .08, .5, GOLD, { parent: g, pos: [s * .36, .78, 0], r: .03 }); box(.07, .3, .07, GOLD, { parent: g, pos: [s * .36, .62, .17], r: .02, line: false }); }
  box(.4, .06, .3, GOLD, { parent: g, pos: [0, .2, .55], rot: [.2, 0, 0], r: .02 });
  return g;
}
export function bench(parent, pos, rot = 0) {
  const g = grp(parent, pos); g.rotation.y = rot;
  box(1.8, .09, .45, WOOD, { parent: g, pos: [0, .5, 0], r: .03 }); box(1.8, .5, .07, WOOD, { parent: g, pos: [0, .78, -.2], rot: [-.12, 0, 0], r: .03 });
  for (const s of [-.8, .8]) box(.08, .5, .4, '#2c1a0e', { parent: g, pos: [s, .25, 0], r: .02, line: false }); return g;
}
export function lamp(parent, pos) {
  const g = grp(parent, pos); box(.03, 3, .03, '#2a2623', { parent: g, pos: [0, 1.5, 0], line: false }); box(.5, .22, .5, '#3a2f22', { parent: g, pos: [0, -.1, 0], r: .1 });
  const s = new THREE.Mesh(new THREE.SphereGeometry(.17, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff3c9' })); s.position.y = -.28; g.add(s); return g;
}
export function clockStand(parent, pos) {
  const g = grp(parent, pos); box(1.4, .35, 1.4, '#b8892a', { parent: g, pos: [0, .17, 0], r: .12 }); box(.22, 1.9, .22, GOLD, { parent: g, pos: [0, 1.3, 0], r: .06 });
  const f = box(.9, .9, .18, '#f2eee4', { parent: g, pos: [0, 2.55, 0], r: .1 }); const hand = (l, a) => box(.04, l, .02, '#1b1109', { parent: g, pos: [Math.sin(a) * l / 2, 2.55 + Math.cos(a) * l / 2, .11], rot: [0, 0, -a], r: .01, line: false }); hand(.3, 2.2); hand(.22, .4);
  const back = f.clone(); g.add(back); back.position.z = 0; return g;
}
export function coffeeCart(parent, pos, rot = 0) {
  const g = grp(parent, pos); g.rotation.y = rot;
  box(1.9, .9, .8, '#e9eef0', { parent: g, pos: [0, .55, 0], r: .05 }); box(1.9, .5, .84, '#1f8f8c', { parent: g, pos: [0, .25, 0], r: .05 }); box(2.0, .08, .9, '#d8dde0', { parent: g, pos: [0, 1.02, 0], r: .02 });
  for (const s of [-.9, .9]) box(.06, 1.6, .06, '#1f8f8c', { parent: g, pos: [s, 1.85, -.35], line: false }); box(2.1, .3, 1.0, '#1f8f8c', { parent: g, pos: [0, 2.7, -.2], r: .05 }); sign(g, 'COFFEE', 1.2, .3, [0, 2.7, .32], [0, 0, 0], { bg: '#1f8f8c', fg: '#ffffff', border: null, font: '800 90px Poppins' });
  for (let i = 0; i < 3; i++) box(.1, .18, .1, '#cfe7e6', { parent: g, pos: [-.3 + i * .22, 1.16, .1], r: .03 });
  return g;
}

/** build the hall. Axis: hall runs along -z; shoeshine stand on the left wall (x=-5.2, z=-1). Returns handles. */
export function buildStation(scene) {
  const S = grp(scene); const H = { chairPos: [-4.3, .22, -1.0], standCentre: [-4.1, 0, -1.2] };
  const floorMat = new THREE.MeshLambertMaterial({ map: tileTex() }); const floor = new THREE.Mesh(new THREE.BoxGeometry(12.4, .2, 40), floorMat); floor.position.set(0, -.1, -14); floor.receiveShadow = true; S.add(floor);
  box(.4, 9, 40, WALL, { parent: S, pos: [-6.2, 4.5, -14], line: false, r: .02 }); box(.4, 9, 40, WALL, { parent: S, pos: [6.2, 4.5, -14], line: false, r: .02 }); box(12.8, 9, .4, WALL, { parent: S, pos: [0, 4.5, -30.2], line: false, r: .02 });
  box(12.8, 9, .4, WALL, { parent: S, pos: [0, 4.5, 8.2], line: false, r: .02 });
  box(.2, 1.1, 40, '#b99a6f', { parent: S, pos: [-5.98, .55, -14], line: false, r: .02 }); box(.2, 1.1, 40, '#b99a6f', { parent: S, pos: [5.98, .55, -14], line: false, r: .02 });
  box(12.2, 1.1, .2, '#b99a6f', { parent: S, pos: [0, .55, -29.98], line: false, r: .02 });
  box(.26, .08, 40, '#8a6a42', { parent: S, pos: [-5.9, 1.12, -14], line: false, r: .02 }); box(.26, .08, 40, '#8a6a42', { parent: S, pos: [5.9, 1.12, -14], line: false, r: .02 });
  const CE = grp(S); H.ceiling = CE;   // ceiling + beams (no shadow casting so the sun still lights the hall); hide H.ceiling for crane / top-down shots
  box(12.8, .3, 40.6, '#d6bd92', { parent: CE, pos: [0, 9.1, -14], line: false, shadow: false, r: .02 });
  for (let i = 0; i < 8; i++) box(12.4, .32, .5, '#6b4a2a', { parent: CE, pos: [0, 8.85, 4 - i * 5], line: false, shadow: false, r: .05 });
  // end wall: big arch window
  windowPane(S, 6.2, 3.4, [0, 4.3, -29.9], [0, 0, 0], true); archRing(S, 3.1, [0, 6.0, -29.8]); for (const s of [-1, 1]) box(.7, 4.6, .6, STONE, { parent: S, pos: [s * 3.45, 4.0, -29.8], r: .05 });
  box(1.4, 0.9, .1, '#0d1216', { parent: S, pos: [0, 2.9, -29.8], r: .02, line: false });
  door(S, [-2.4, 0, -29.75]); door(S, [2.4, 0, -29.75]); sign(S, ['DEPARTURES', '8:20 NORTH BAY  ON TIME', '8:35 OAK RIVER  BOARDING', '8:50 MAPLE HILL  ON TIME'], 2.4, 1.1, [0, 3.0, -29.7], [0, 0, 0], { bg: '#0d1216', fg: '#f2c14e', font: '700 40px Poppins', border: '#e0990d' });
  // side walls: tall windows with stone frames, doors
  for (const sx of [-1, 1]) { for (let i = 0; i < 6; i++) { const z = -4 - i * 4.6; windowPane(S, 1.5, 2.6, [sx * 5.97, 5.2, z], [0, -sx * Math.PI / 2, 0]); box(.2, .18, 1.9, STONE, { parent: S, pos: [sx * 5.9, 3.8, z], r: .03 }); box(.2, .18, 1.9, STONE, { parent: S, pos: [sx * 5.9, 6.6, z], r: .03 }); } door(S, [sx * 5.95, 0, -12], [0, -sx * Math.PI / 2, 0]); door(S, [sx * 5.95, 0, -20], [0, -sx * Math.PI / 2, 0]); }
  // pillars with stepped arch ribs along the left wall (the 'stone arch' look)
  for (let i = 0; i < 3; i++) { const z = -2.2 - i * 9.2; box(.6, 9, .7, STONE, { parent: S, pos: [-5.8, 4.5, z], r: .06 }); box(.6, 9, .7, STONE, { parent: S, pos: [5.8, 4.5, z], r: .06 }); }
  // shoe-shine stand
  box(2.6, .22, 2.4, '#4a2610', { parent: S, pos: [H.standCentre[0], .11, H.standCentre[2]], r: .04 }); box(1.2, .14, .8, '#5b3014', { parent: S, pos: [-4.3, .05, 0.4], r: .03 });
  H.chair = chair(S, [-4.3, .22, -1.0], [0, Math.PI / 2 + .35, 0]); sign(S, 'SHOE SHINE', 1.9, .5, [-5.9, 2.7, -1.2], [0, Math.PI / 2, 0], { font: '800 56px Poppins' });
  const shoeBox = grp(S, [-3.4, .3, .3]); box(.7, .35, .45, '#5b3014', { parent: shoeBox, pos: [0, 0, 0], r: .03 }); box(.5, .06, .3, '#7a4a22', { parent: shoeBox, pos: [0, .2, 0], r: .02 });
  // hall furniture
  [[-2.2, -6], [2.4, -6], [-2.2, -10.5], [2.4, -10.5], [-2.2, -15], [2.4, -15]].forEach(([x, z], i) => bench(S, [x, 0, z], i % 2 ? .06 : -.06)); clockStand(S, [0, 0, -17]);
  coffeeCart(S, [4.7, 0, -4], -Math.PI / 2 + .2); for (let i = 0; i < 6; i++) lamp(S, [(i % 2 ? 1 : -1) * 3.2, 8.4, -3 - i * 4.2]);
  return H;
}

/** low-detail background people (no fingers, fewer boxes, no outlines on far ones) */
export function crowd(scene, n, { x = [-4.5, 4.5], z = [-16, 3], seed = 4, avoid = () => false } = {}) {
  const R = rng(seed), out = [], skins = [SKIN.peach, SKIN.tan, SKIN.brown, SKIN.dark, SKIN.light], hairs = ['#14110f', '#59321a', '#8a6a3a', '#2a1a10', '#b09060'], fits = ['gray', 'green', 'tan', 'navy', 'teal', 'suit'];
  for (let i = 0; i < n; i++) {
    const c = makeChar({ skin: skins[(R() * skins.length) | 0], hair: hairs[(R() * hairs.length) | 0], hairStyle: ['short', 'quiff', 'long'][(R() * 3) | 0], outfit: fits[(R() * fits.length) | 0], seed: i + 11, lod: 1 });
    c.p.x = x[0] + R() * (x[1] - x[0]); c.p.z = z[0] + R() * (z[1] - z[0]); c.p.yaw = (R() - .5) * 6; if (avoid(c.p.x, c.p.z)) { c.p.x += 2.4; }
    scene.add(c.root); out.push(c);
  } return out;
}
