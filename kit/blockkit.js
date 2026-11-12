// blockkit.js — "chunky block toon" 3D characters + set pieces for three.js (r160). ES module.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE };

/* ---------- maths / easing (all animation is a pure function of time t) ---------- */
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ease = u => (u = clamp(u), u * u * (3 - 2 * u));                       // smoothstep
export const easeIO = u => (u = clamp(u), u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
export const easeBack = u => { u = clamp(u); const c = 1.5, d = c + 1; return 1 + d * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
/** keyframes: [[t,v],...] -> value at t with smooth easing between keys (v can be number or array) */
export function kf(keys, t, fn = ease) {
  if (t <= keys[0][0]) return keys[0][1]; const n = keys.length; if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0; while (t > keys[i + 1][0]) i++;
  const [t0, a] = keys[i], [t1, b] = keys[i + 1], u = fn((t - t0) / (t1 - t0));
  return Array.isArray(a) ? a.map((x, k) => lerp(x, b[k], u)) : lerp(a, b, u);
}

/* ---------- materials & primitives ---------- */
const MAT = new Map();
export function mat(color, o = {}) {
  const k = color + JSON.stringify(o); if (MAT.has(k)) return MAT.get(k);
  const m = new THREE.MeshLambertMaterial({ color, ...o }); MAT.set(k, m); return m;
}
const OUTLINE_W = { value: 0.003 };                                       // screen-constant outline width (fraction of distance)
export const outlineMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, uniforms: { w: OUTLINE_W, col: { value: new THREE.Color('#1c0f06') } },
  vertexShader: `uniform float w; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vec3 n = normalize(normalMatrix*normal); mv.xyz += n*w*(-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 col;
void main(){ gl_FragColor = vec4(col,1.);
#include <colorspace_fragment>
}`,
});
export function setOutlineWidth(w) { OUTLINE_W.value = w; }
/** rounded box: size [w,h,d], radius r. Adds a toon outline hull unless line=false. Origin at centre. */
export function box(w, h, d, color, { r = Math.min(w, h, d) * .16, line = true, pos = [0, 0, 0], rot = [0, 0, 0], parent, shadow = true, m } = {}) {
  const g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) / 2 - 1e-4));
  const mesh = new THREE.Mesh(g, m || mat(color));
  mesh.position.set(...pos); mesh.rotation.set(...rot); mesh.castShadow = shadow; mesh.receiveShadow = true;
  if (line) { const o = new THREE.Mesh(g, outlineMat); mesh.add(o); }
  if (parent) parent.add(mesh); return mesh;
}
/** soft cloth ball: hides the gap at a joint (centre it on the joint pivot, radius = limb half-width + ~0.002, stretched along the limb with sc, so it fills the groove between two rounded boxes without bulging) */
export function ball(r, color, { parent, pos = [0, 0, 0], sc = [1, 1, 1], line = true } = {}) {
  const g = new THREE.SphereGeometry(r, 22, 16), m = new THREE.Mesh(g, mat(color));
  m.position.set(...pos); m.scale.set(...sc); m.castShadow = true; m.receiveShadow = true;
  if (line) m.add(new THREE.Mesh(g, outlineMat));
  if (parent) parent.add(m); return m;
}
export const grp = (parent, pos = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...pos); parent && parent.add(g); return g; };

/* ---------- painted face (re-drawn every frame from parameters => smooth expressions) ---------- */
export const SKIN = { peach: '#efaa71', tan: '#d89a62', brown: '#8a5230', dark: '#5a3320', light: '#f4c49a' };
function drawFace(ctx, W, H, f, skin) {
  ctx.clearRect(0, 0, W, H);
  const g = f.glasses, eyeY = H * (.47 + (f.eyeY || 0)), ex = W * (g ? .245 : .235), er = W * (g ? .066 : .085), ink = '#1b1109';
  for (const s of [-1, 1]) {
    const cx = W / 2 + s * ex, open = clamp(f.open[s < 0 ? 0 : 1], 0.04, 1), sq = clamp(f.squint || 0, 0, 1);
    const ry = Math.max(er * 1.12 * open * (1 - .4 * sq), 2.5);
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, eyeY, er, ry, 0, 0, 7); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.clip();
    const ix = cx + f.lookX * er * .5, iy = eyeY + f.lookY * er * .5, ir = er * .78;
    ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 7); ctx.fillStyle = f.iris || '#4a6a3a'; ctx.fill();
    ctx.beginPath(); ctx.arc(ix, iy, ir * .5, 0, 7); ctx.fillStyle = ink; ctx.fill();
    ctx.beginPath(); ctx.arc(ix - ir * .3, iy - ir * .34, ir * .22, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(cx, eyeY, er, ry, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = W * .013; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.stroke();   // upper lid
    if (g) { ctx.beginPath(); ctx.arc(cx, eyeY, er * 2.05, 0, 7); ctx.lineWidth = W * .03; ctx.strokeStyle = ink; ctx.stroke(); }
    // brow: f.brow = [height(-1..1), tilt(+ angry .. - worried), arch]
    const by = eyeY - er * (g ? 3.55 : 2.35) - f.brow[0] * er * 1.1, ang = -s * f.brow[1] * .55;
    ctx.save(); ctx.translate(cx, by); ctx.rotate(ang); ctx.beginPath();
    const bl = W * .085, bt = W * .021; ctx.moveTo(-bl, bt * .6); ctx.quadraticCurveTo(0, -bt * (1.2 + f.brow[2]), bl, -bt * .5); ctx.lineTo(bl, bt * .7); ctx.quadraticCurveTo(0, bt * (.9 - f.brow[2]), -bl, bt * 1.3);
    ctx.fillStyle = f.browCol || ink; ctx.fill(); ctx.restore();
  }
  if (g) {   // glasses frame: nose bridge joins the two rings, temple arms run to the sides of the head
    const rr = er * 2.05, y = eyeY; ctx.lineWidth = W * .03; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.moveTo(W / 2 - ex + rr * .99, y - rr * .12); ctx.quadraticCurveTo(W / 2, y - rr * .5, W / 2 + ex - rr * .99, y - rr * .12); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(W / 2 + s * (ex + rr * .99), y - rr * .12); ctx.lineTo(W / 2 + s * W * .5, y - rr * .2); ctx.stroke(); }
  }
  // mouth: open 0..1, smile -1..1, mouthW
  const my = H * .745, mw = W * (.075 + .06 * (f.mouthW ?? .5)), op = clamp(f.mouth, 0, 1), sm = f.smile;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (op < .06) { ctx.beginPath(); ctx.moveTo(W / 2 - mw, my); ctx.quadraticCurveTo(W / 2, my + sm * H * .06, W / 2 + mw, my); ctx.lineWidth = W * .017; ctx.strokeStyle = ink; ctx.stroke(); }
  else {
    const mh = H * (.02 + .09 * op); ctx.beginPath(); ctx.moveTo(W / 2 - mw, my);
    ctx.quadraticCurveTo(W / 2, my - mh * .25 + sm * H * .03, W / 2 + mw, my); ctx.quadraticCurveTo(W / 2 + mw * .75, my + mh * 1.5, W / 2, my + mh * 1.55); ctx.quadraticCurveTo(W / 2 - mw * .75, my + mh * 1.5, W / 2 - mw, my);
    ctx.fillStyle = '#7a1a16'; ctx.fill(); ctx.lineWidth = W * .013; ctx.strokeStyle = ink; ctx.stroke();
    ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(W / 2, my + mh * 1.55, mw * .6, mh * .6, 0, 0, 7); ctx.fillStyle = '#e8605a'; ctx.fill(); ctx.restore();
  }
  if (f.blush) { ctx.fillStyle = 'rgba(230,120,90,.28)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(W / 2 + s * W * .32, H * .64, W * .07, H * .035, 0, 0, 7); ctx.fill(); } }
}
export const FACE0 = () => ({ open: [1, 1], lookX: 0, lookY: 0, brow: [0, 0, 0.2], mouth: 0, smile: .35, glasses: false, squint: 0, mouthW: .5, iris: '#4a6a3a' });

/* ---------- hands: palm + 4 finger blocks + thumb, curl-able ---------- */
function makeHand(parent, skin, sgn, lod = 0) {
  const h = grp(parent), palm = box(.115, .105, .05, skin, { r: .022, parent: h, pos: [0, -.055, 0] });
  const fingers = []; if (lod) { box(.1, .09, .05, skin, { r: .03, parent: h, pos: [0, -.14, 0] }); h.userData = { fingers, th: grp(h), sgn }; return h; }
  for (let i = 0; i < 4; i++) {
    const L = [.9, 1, .95, .8][i], pv = grp(h, [(i - 1.5) * .0275, -.105, 0]); box(.0265, .04 * L, .034, skin, { r: .011, parent: pv, pos: [0, -.02 * L, 0] });
    const pv2 = grp(pv, [0, -.04 * L, 0]); box(.025, .034 * L, .032, skin, { r: .011, parent: pv2, pos: [0, -.017 * L, 0] }); fingers.push([pv, pv2]);
  }
  const th = grp(h, [sgn * .062, -.04, .0]); box(.034, .05, .036, skin, { r: .014, parent: th, pos: [sgn * .006, -.02, .0], rot: [0, 0, sgn * .3] });
  h.userData = { fingers, th, sgn };
  return h;
}
function curl(hand, c, spread = 0, thumbOut = 0) {          // c 0 open … 1 fist
  const { fingers, th, sgn } = hand.userData;
  fingers.forEach(([a, b], i) => { a.rotation.x = -c * 1.1 - i * .03 * c; b.rotation.x = -c * 1.15; a.rotation.z = (i - 1.5) * spread * .25; });
  th.rotation.z = sgn * (.2 + thumbOut * .9 - c * .4); th.rotation.x = -c * .5;
}

/* ---------- character ---------- */
export const OUTFITS = {
  suit: { top: '#570d0e', trim: '#3c0809', pants: '#17110f', shoes: '#0c0a0a', tie: '#0e1220', shirt: '#f2efe9', lanyard: true },
  uniform: { top: '#1c2a49', trim: '#142038', pants: '#1c2a49', shoes: '#0c0a0a', tie: null, shirt: '#1c2a49', badge: true, belt: true },
  apron: { top: '#f4efe6', trim: '#d8d0c2', pants: '#2a2623', shoes: '#0c0a0a', apron: '#6a3a1a', shirt: '#f4efe6' },
  gray: { top: '#a9a9ad', trim: '#8e8e93', pants: '#a9a9ad', shoes: '#16120f', tie: '#a3160f', shirt: '#f2efe9' },
  green: { top: '#5f7a4a', trim: '#4a6238', pants: '#26303a', shoes: '#16120f', shirt: '#5f7a4a' },
  tan: { top: '#b78a52', trim: '#9a7040', pants: '#3a2d22', shoes: '#16120f', shirt: '#b78a52' },
  navy: { top: '#2a3340', trim: '#1e2630', pants: '#222831', shoes: '#0c0a0a', shirt: '#2a3340' },
  teal: { top: '#1c8a8a', trim: '#146a6a', pants: '#2a2623', shoes: '#0c0a0a', shirt: '#1c8a8a' },
};
export const HAIRS = {
  quiff: c => [[.5, .11, .44, [0, .02, 0]], [.46, .05, .1, [-.02, -.01, .055]], ],
};
export function makeChar({ skin = SKIN.peach, hair = '#59321a', hairStyle = 'quiff', outfit = 'suit', glasses = false, scale = 1, hat = null, mustache = false, patch = false, seed = 1, headScale = 1, lod = 0 } = {}) {
  const O = typeof outfit === 'string' ? OUTFITS[outfit] : outfit, R = rng(seed);
  const root = grp(null), hips = grp(root, [0, .58, 0]);
  const C = { root, hips, face: FACE0(), blink: 0, skin };
  C.face.glasses = glasses;
  // legs
  C.legs = [-1, 1].map(s => { const hip = grp(hips, [s * .105, 0, 0]); box(.17, .3, .17, O.pants, { parent: hip, pos: [0, -.15, 0], r: .04 }); ball(.087, O.pants, { parent: hip, pos: [0, -.01, 0], sc: [1, 1.2, 1], line: !lod }); const kn = grp(hip, [0, -.29, 0]); box(.165, .27, .165, O.pants, { parent: kn, pos: [0, -.135, 0], r: .04 }); ball(.0845, O.pants, { parent: kn, sc: [1, 1.4, 1], line: !lod }); box(.18, .09, .27, O.shoes, { parent: kn, pos: [0, -.27, .045], r: .035 }); return { hip, kn }; });
  box(.37, .13, .22, O.pants, { parent: hips, pos: [0, -.03, 0], r: .045, line: !lod });          // pelvis: joins both hips under the torso
  // torso
  const torso = grp(hips, [0, 0, 0]); C.torso = torso;
  box(.46, .56, .26, O.top, { parent: torso, pos: [0, .28, 0], r: .06 });
  box(.2, .055, .17, O.shirt || O.top, { parent: torso, pos: [0, .572, 0], r: .022, line: !lod });   // collar: hides the neck/torso seam
  if (O.apron && !lod) { box(.34, .5, .02, O.apron, { parent: torso, pos: [0, .22, .135], r: .015 }); box(.3, .16, .03, O.apron, { parent: torso, pos: [0, -.0, .14], r: .015 }); for (let i = 0; i < 3; i++) box(.025, .025, .012, '#f2e3c4', { parent: torso, pos: [-.09 + (i === 1 ? 0 : 0), .42 - i * .1, .152], r: .008, line: false }); }
  if (O.top === OUTFITS.suit.top || O.tie !== undefined) { box(.12, .42, .02, O.shirt, { parent: torso, pos: [0, .34, .134], r: .008, line: false }); if (O.tie) box(.045, .36, .024, O.tie, { parent: torso, pos: [0, .31, .14], r: .01, line: false }); box(.1, .05, .03, O.trim, { parent: torso, pos: [-.075, .55, .12], rot: [0, 0, .5], r: .01, line: false }); box(.1, .05, .03, O.trim, { parent: torso, pos: [.075, .55, .12], rot: [0, 0, -.5], r: .01, line: false }); }
  if (O.lanyard && !lod) { for (const s of [-1, 1]) box(.022, .4, .016, '#e0990d', { parent: torso, pos: [s * .06, .36, .148], rot: [0, 0, s * -.12], r: .006, line: false }); box(.075, .1, .016, '#f4f1ea', { parent: torso, pos: [0, .1, .152], r: .008 }); box(.045, .025, .018, '#1d3a73', { parent: torso, pos: [0, .12, .16], r: .004, line: false }); }
  if (O.badge) { box(.05, .06, .02, '#e0990d', { parent: torso, pos: [.12, .4, .14], r: .012 }); }
  if (O.belt) { box(.47, .05, .27, '#0c0a0a', { parent: torso, pos: [0, .03, 0], r: .012 }); box(.05, .04, .02, '#e0990d', { parent: torso, pos: [0, .03, .14], r: .008, line: false }); }
  // arms
  C.arms = [-1, 1].map(s => {
    const sh = grp(torso, [s * .275, .52, 0]); box(.14, .27, .14, O.top, { parent: sh, pos: [0, -.115, 0], r: .045 }); ball(.073, O.top, { parent: sh, pos: [0, -.012, 0], sc: [1, 1.15, 1], line: !lod });
    const el = grp(sh, [0, -.255, 0]); ball(.0645, O.top, { parent: el, sc: [1, 1.4, 1], line: !lod }); box(.125, .26, .125, O.top, { parent: el, pos: [0, -.12, 0], r: .042 }); box(.133, .03, .133, O.shirt || '#f2efe9', { parent: el, pos: [0, -.25, 0], r: .01, line: false });
    const wr = grp(el, [0, -.265, 0]); if (!lod) box(.088, .05, .06, skin, { parent: wr, pos: [0, -.005, 0], r: .022, line: false }); const hand = makeHand(wr, skin, s, lod); curl(hand, .25); return { sh, el, wr, hand, s };
  });
  // head
  const neck = grp(torso, [0, .58, 0]); box(.12, .08, .12, skin, { parent: neck, pos: [0, 0, 0], r: .03 });
  const head = grp(neck, [0, .04, 0]); C.head = head; head.scale.setScalar(headScale);
  box(.44, .41, .39, skin, { parent: head, pos: [0, .22, 0], r: .07 });
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(.405, .38), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); fm.position.set(0, .215, .1975); head.add(fm);
  C.drawFace = () => { drawFace(cv.getContext('2d'), 512, 512, C.face, skin); tex.needsUpdate = true; };
  // hair / hats
  const H = (w, h, d, p, r = [0, 0, 0], rad = .03, col = hair) => box(w, h, d, col, { parent: head, pos: p, rot: r, r: rad });
  if (lod && hairStyle && !hat) { H(.47, .13, .43, [0, .445, -.01], [0, 0, 0], .045); H(.46, .3, .08, [0, hairStyle === 'long' ? .2 : .3, -.2], [0, 0, 0], .04); H(.1, hairStyle === 'long' ? .45 : .22, .4, [-.225, .34, -.02], [0, 0, 0], .035); H(.1, hairStyle === 'long' ? .45 : .22, .4, [.225, .34, -.02], [0, 0, 0], .035); }
  else if (hairStyle === 'quiff') { H(.47, .13, .43, [0, .445, -.01], [0, 0, 0], .045); H(.1, .22, .4, [-.225, .34, -.02], [0, 0, 0], .035); H(.1, .22, .4, [.225, .34, -.02], [0, 0, 0], .035); H(.2, .12, .15, [.07, .47, .17], [-.25, 0, -.18], .035); H(.16, .12, .12, [.0, .55, .06], [.4, 0, .5], .03); H(.47, .22, .08, [0, .35, -.2], [0, 0, 0], .04); }
  else if (hairStyle === 'short') { H(.46, .12, .42, [0, .445, -.005], [0, 0, 0], .045); H(.09, .2, .38, [-.23, .34, -.02], [0, 0, 0], .03); H(.09, .2, .38, [.23, .34, -.02], [0, 0, 0], .03); H(.46, .2, .06, [0, .34, -.2], [0, 0, 0], .035); H(.3, .07, .08, [-.05, .41, .2], [0, 0, -.14], .025); }
  else if (hairStyle === 'long') { H(.48, .13, .44, [0, .445, -.01], [0, 0, 0], .05); H(.1, .45, .4, [-.235, .2, -.03], [0, 0, 0], .035); H(.1, .45, .4, [.235, .2, -.03], [0, 0, 0], .035); H(.48, .4, .07, [0, .27, -.22], [0, 0, 0], .04); H(.3, .08, .06, [0, .43, .2], [0, 0, 0], .025); }
  if (hat === 'flat') { H(.5, .09, .46, [0, .46, -.01], [0, 0, 0], .04, '#4a3226'); H(.5, .05, .22, [0, .43, .22], [.15, 0, 0], .02, '#3a261b'); H(.12, .1, .2, [-.24, .37, .05], [0, 0, 0], .03, '#efefec'); }
  if (hat === 'police') { H(.5, .15, .45, [0, .47, -.01], [0, 0, 0], .05, '#1c2a49'); H(.5, .035, .2, [0, .4, .26], [.2, 0, 0], .015, '#0c0a0a'); H(.1, .1, .02, [0, .5, .24], [0, 0, 0], .01, '#e0990d'); H(.1, .22, .36, [-.225, .32, -.02], [0, 0, 0], .03, '#0c0a0a'); H(.1, .22, .36, [.225, .32, -.02], [0, 0, 0], .03, '#0c0a0a'); }
  if (mustache) H(.17, .045, .05, [0, .13, .2], [0, 0, 0], .02, '#f4f1ea');
  // pose state
  C.p = { x: 0, y: 0, z: 0, yaw: 0, lean: 0, twist: 0, bob: 0, headYaw: 0, headPitch: 0, headRoll: 0, armL: [0, 0, 0, .25], armR: [0, 0, 0, .25], legs: [0, 0, 0, 0] };
  root.scale.setScalar(scale); root.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  return C;
}

/* apply a pose (angles in radians). arm = [pitch, out, elbow, curl]; arm pitch + = forward/up */
export function applyPose(C, p) {
  C.root.position.set(p.x, p.y, p.z); C.root.rotation.y = p.yaw;
  C.hips.position.y = .58 + p.bob; C.torso.rotation.set(p.lean, p.twist, p.sway || 0);
  C.head.rotation.set(p.headPitch, p.headYaw, p.headRoll);
  [p.armL, p.armR].forEach((a, i) => { const A = C.arms[i]; A.sh.rotation.set(-a[0], 0, A.s * (.06 + a[1])); A.el.rotation.set(-a[2], 0, 0); curl(A.hand, a[3], a[4] || 0, a[5] || 0); });
  C.legs.forEach((L, i) => { L.hip.rotation.x = p.legs[i * 2]; L.kn.rotation.x = Math.max(0, p.legs[i * 2 + 1]); });
}
/* always-on life: breathing, sway, blinks, eye darts. t in seconds, returns nothing (mutates C.p & C.face) */
export function idle(C, t, seed = 0) {
  const R = x => Math.sin(x + seed * 7.3);
  C.p.bob = .004 * R(t * 2.2); C.p.sway = .012 * R(t * .9 + 1); C.p.headRoll = (C.p.headRoll || 0) + .012 * R(t * .7); C.p.headPitch += .015 * R(t * 1.1);
  const per = 3.1 + (seed % 5) * .37, ph = (t + seed * 1.3) % per, bl = ph < .13 ? Math.sin(Math.PI * ph / .13) : 0;
  C.face.open = [1 - bl * .96, 1 - bl * .96]; C.face.lookX += .12 * R(t * .6 + 2) * .3; C.face.lookY += .08 * R(t * .5);
}
/* walk cycle, phase in cycles */
export function walk(C, ph, amp = 1) {
  const s = Math.sin(ph * 2 * Math.PI), c = Math.cos(ph * 2 * Math.PI);
  C.p.legs = [.55 * s * amp, Math.max(0, -c) * .7 * amp, -.55 * s * amp, Math.max(0, c) * .7 * amp];
  /* arms OPPOSE the same-side leg (L leg back when s>0 -> L arm forward); forward-swinging arm bends more */
  C.p.armL = [.5 * s * amp, 0, .15 + .25 * Math.max(0, s) * amp, .3]; C.p.armR = [-.5 * s * amp, 0, .15 + .25 * Math.max(0, -s) * amp, .3];
  C.p.bob = .03 * Math.abs(c) * amp; C.p.twist = -.09 * s * amp; C.p.sway = -.03 * s * amp; C.p.lean = .05 * amp;
}

/* ---------- scene helpers ---------- */
export function makeStage(w, h, { sky = '#d9e6f2' } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(w, h); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(sky);
  const hemi = new THREE.HemisphereLight('#fff6e6', '#d9bf98', 2.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe6c0', 1.6); sun.position.set(-6, 9, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40; sun.shadow.radius = 5; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  scene.add(sun); scene.add(sun.target);
  const camera = new THREE.PerspectiveCamera(58, w / h, .05, 200);
  return { renderer, scene, camera, sun, hemi };
}
/** camera from keyframes: pos/look/fov/roll each a kf() list or constant */
export function aim(camera, pos, look, fov, roll = 0) {
  camera.position.set(...pos); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(...look); camera.fov = fov; camera.updateProjectionMatrix();
}
export function textTex(lines, w, h, { bg = '#6b1414', fg = '#f1c35a', font = '800 64px Poppins', border = '#e0990d', pad = 8 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h); if (border) { x.strokeStyle = border; x.lineWidth = pad; x.strokeRect(pad / 2, pad / 2, w - pad, h - pad); }
  x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  const L = Array.isArray(lines) ? lines : [lines]; L.forEach((s, i) => x.fillText(s, w / 2, h * (i + 1) / (L.length + 1)));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function sign(parent, lines, w, h, pos, rot = [0, 0, 0], o = {}) {
  const m = box(w, h, .06, o.bg || '#6b1414', { parent, pos, rot, r: .02 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w * .94, h * .9), new THREE.MeshBasicMaterial({ map: textTex(lines, 512, Math.round(512 * h / w), o) })); p.position.z = .032; m.add(p); return m;
}
