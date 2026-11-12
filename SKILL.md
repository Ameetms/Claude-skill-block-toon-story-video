---
name: "block-toon-story-video"
description: "Make 9:16 first-person story-narration shorts in a chunky 3D block-toon style (rounded-box characters with painted faces, ink outlines, always-moving camera, word-by-word colour captions) from a script or voiceover, rendered in code."
---

# Block-toon story video ("Busted by the Shoeshine Man" look)

Use this when the user wants a vertical (720x1280 or 1080x1920, 30 fps) first-person story video, 30-130 s, told over a voiceover, with chunky rounded-block 3D characters, smooth continuous motion and punchy coloured captions. Everything is code: three.js scene in headless Chromium, one deterministic `frame(t)` function, screenshots piped to ffmpeg.

The user's priority is **character design fidelity and animation smoothness**. Do not skip the character checks in step 5.

## 1. What the reference video looks like (measured)

- 720x1280, 30 fps, ~122 s, AAC stereo about -14 LUFS with a quiet continuous bed under the voice.
- ~47 hard cuts (single-frame cuts, never crossfades), average shot ~2.6 s (range 1.2-5 s). Inside a shot the camera is ALWAYS moving: eased push-in, pull-out, crane/high-angle drift, low-angle push, whip-tilt up to a ceiling or window. Under 1 % of frames are static.
- Captions in the lower third (top about 64-68 % of height), 2-3 lowercase words per group, bold rounded geometric sans (Poppins ExtraBold), white base with the key words coloured (gold #f5c32c, cyan #48c9f0, coral #ff5b4d, pink #ff7ac0, green #2ecc8f, orange #ffa21f), thick black stroke, small scale-pop on each group.
- Environment: warm cream/tan interior (wall #dcbf96, floor #c7aa7d, stone #d9c39b, wainscot #b99a6f, sky #c7dcec) with accent maroon #570d0e, navy #1c2a49, gold #e0990d, teal #1f8f8c, red #a3160f.
- Lighting: soft, bright, slightly warm; smooth gradient shading and soft cast shadows. No hard cel bands.

## 2. Character design bible (follow exactly)

**Silhouette and proportions**
- Every body part is a rounded box. Bevel radius is about 15-18 % of the part's smallest dimension. Never use spheres or capsules for body parts.
- Head: a cuboid slightly wider than tall (0.44 x 0.41 x 0.39 units), about 1/4-1/3 of the figure height in close shots, so the figure is ~4 heads tall in wide shots. Short neck block. Torso 0.46 x 0.56 x 0.26. Arms 0.27 + 0.26 (upper + forearm). Legs 0.30 + 0.27. Total height about 1.7 units.
- Hands are chunky mitten blocks: a palm block with four short two-segment fingers and a separate thumb. They can curl from open to fist and spread. Hands must never look spidery.
- White cuff band at each wrist. Black shoes, a flat block with a rounded toe.
- **No visible joint breaks.** Where two rounded boxes meet at a bent joint (hip, knee, shoulder, elbow, wrist, neck/torso, hip/torso) the bevels open a gap or notch that reads as a break. Hide every joint under a cloth layer in the same colour as the clothing: a small sphere (`ball()`) centred on the joint pivot, sized to the limb half-width + ~0.002 and stretched along the limb (`sc` [1,1.2-1.4,1]); a pelvis block joining the two hips; a collar block over the neck/torso seam; a skin-coloured wrist piece under the cuff. Do not oversize the balls (limb half-width + 0.015 made lumpy knees and elbows). Verify with a stress-test of bent poses (arm raised, mid-stride walk, leg lifted), zoomed in.

**Face (flat painted on the front of the head, redrawn every frame on a canvas texture)**
- Large round eyes: white sclera, green or brown iris, black pupil, white highlight. Thick black upper-lid line. Eyes can look around (lookX/lookY), blink and squint.
- Thick tapered brows that tilt (angry/worried) and raise. Black ring glasses are much larger than the eyes (ring radius about 2x eye radius). **Glasses must be one connected frame**: the two rings are joined by a curved bridge arc across the nose and each ring has a temple line running out to the edge of the face. Two floating rings look broken (a user flagged this on the first cast sheet).
- No nose. Mouth is a tiny line/curve, or a filled open mouth with a pink tongue when talking. Smile value -1..1.
- Optional soft blush.

**Hair, hats, accessories (stacked chunky blocks)**
- Hero: brown quiff with a pointed tuft, side pieces and a back block. Others: short, or long (side curtains + back block). Black fringe is a thin angled block.
- Police cap: navy crown block + black visor + gold badge. Flat cap: brown block + short brim + light button.
- Older man: white block mustache + white temple patch.
- Outfits are colour-blocked and simple: suit (maroon jacket, white shirt, dark tie, lapels, gold lanyard V + white ID badge with blue stripe), uniform (navy, gold badge, black belt + gold buckle), apron (white shirt, brown apron with button dots), plus gray/green/tan/navy/teal variants for extras.
- Skin tones: peach #efaa71, tan #d89a62, brown #8a5230, dark #5a3320, light #f4c49a. Hair brown #59321a, black #14110f.

**Rendering**
- Thin dark ink outline (#1c0f06) on every part via an inverted-hull shader with screen-constant width. The width is a fraction of camera distance: `w = px / ((H/2) / tan(fov/2))` where `px` is the wanted line thickness in screen pixels (about 0.003 for 720x1280 video shots, about 1.5-2 px). For far multi-character sheets at 1600x900 use `K.setOutlineWidth(.0009)`, for bust tiles about `.0016`; the default is far too thick on a distant camera. Faces and tiny trim pieces skip the outline.
- Lambert material, hemisphere light (about 2.9) + one soft shadow sun (about 1.5). Soft PCF shadows.
- Background crowd uses `lod: 1` (no fingers, fewer hair blocks). Never build a unique design per extra; vary skin, hair, outfit colour and hairstyle.

**Variety rule:** every named character must be recognisable by silhouette alone (hat, hair block shape, glasses, mustache, skin tone, outfit colour). Use the same proportions for all of them.

**Reference sheets (do these when the user asks for a character design or an environment, before any video)**

Build one `designsheet.html` and one `envsheet.html` next to `scene.html` (same kit, same `render.cjs`, run `node render.cjs designsheet.html out 0,1,2 --w 1600 --h 900`). `frame(t)` picks a mode with `Math.round(t)`; labels are a DOM overlay (Poppins) positioned by projecting 3D points with `new THREE.Vector3(x,y,z).project(camera)`; the page title and swatches are DOM too.

- Cast file `cast.js`: a `DEF` table (name, role, 4 swatches [skin, hair, outfit, accent]), a `BUILD` table of one builder per character (`makeChar` + a few extra `box()` accessories), `makeOne(name)`, `makeCast()`, and `pose(name, C)` which resets the face and pose every frame and applies a clean model-sheet pose. Make each character unique by silhouette: different `scale`/`headScale`, hairstyle, hat, glasses, mustache block, skin tone and one accent colour.
- Sheet 0 lineup: all characters in a row (camera about [0,1.02,15], fov 16.5), name + role + swatch squares under each. Sheet 1 turnaround of the lead at yaw 0, .75, PI/2, PI (front, 3/4, side, back). Sheet 2 expressions: six busts (neutral, happy, angry, surprised, worried, smug) drawn as **scissor tiles**, because stacking six characters in one 3D scene puts rows under the floor and overlapping. Tile pattern: `renderer.autoClear=false; renderer.setScissorTest(true);` then per tile `setViewport(x, H-y-h, w, h); setScissor(...); renderer.clear(); camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.render(scene, camera);` and reset the viewport, scissor test and autoClear at the end of `frame`.
- Brow sign convention: `face.brow = [height, tilt, arch]`, tilt > 0 = inner ends down (angry), tilt < 0 = inner ends up (worried). In `drawFace` that is `ang = -s * f.brow[1] * .55`. (The first version had it inverted and an angry officer looked sad.)
- Environment sheet 0: four 760x318 scissor tiles (hero wide from the entrance, end wall with the arch window, the key prop corner, a high-angle crane with `hall.ceiling.visible = false`), each captioned; stage the cast in the set for scale and make them face the camera or each other (check yaw: yaw 0 faces +z toward a camera on +z; a character with its back to camera is a staging bug). Sheet 1: each prop alone on a far-away prop stage (`x = 400 + i*20`) so it never shows in hall shots, tiles 486x300. Sheet 2: top-down floor plan with `up = [-1,0,0]` (the long axis runs horizontally), camera about [-1,120,-13] looking straight down, narrow fov (about 9.3) and pin labels projected from world points. Always include a palette strip (10 swatches) in the header.
- The hall's ceiling and beams live in one group exposed as `H.ceiling` (shadow casting off, so the sun still lights the hall); hide it for crane and top-down shots. Sign text must be sized to its plane: a 1.9 x 0.5 sign takes `800 56px Poppins`, not 78px (clipped).
- Three.js gotcha: `Object3D.position` and `.rotation` are read-only properties; set components (`m.rotation.x = ...`, `m.position.set(...)`) and never `Object.assign(mesh, { rotation: ... })`, which throws and stops `__ready`.
- Deliver the PNGs plus the `.js` files with SendUserFile; re-render and re-send every sheet after any kit change so the user never holds outdated sheets.
## 3. Animation smoothness rules

1. Animation is a pure function of time: `frame(t)` sets everything from `t`. No state carried between frames, so any frame can be rendered in any order or in parallel.
2. Use `kf([[t0,v0],[t1,v1]], t, easeFn)` for every move. Use `easeOut` for push-ins and arrivals, `easeIO` for crane/whip moves, `ease` for small things. Never linear for a camera or limb.
3. Camera is never static. Each shot has eased position + look-at + fov + a few degrees of roll, plus an always-on handheld drift `[sin(.5t)*.03, sin(.37t)*.02]`.
4. Hard cuts only at shot boundaries, on a word or beat. No crossfades. Average shot 2-3 s.
5. Idle layers on every character, all the time: breathing bob, sway, head roll, blinks every ~3-4 s (0.13 s eased), tiny eye darts. `K.idle()` does this.
6. Mouth open amount comes from the real voiceover loudness (`lipsync.py` writes env.json at 30 fps). Never a looping flap.
7. Gestures: anticipation (small pull-back before a point/slam), overshoot (`easeBack`), hold, settle. Heads lead, torso follows (use `headYaw` before `twist`).
8. Walk cycle: legs opposite, **each arm swings opposite to its same-side leg**, knees only bend backward (`Math.max(0, knee)`), bob 2x per cycle, small torso twist and lean. Phase is in cycles: use about 1 cycle/s for a normal walk.
9. Characters must never overlap furniture: place them with explicit x/z and check a still.

## 4. Pipeline

1. **Script**: first-person, hook in the first 3 seconds, short punchy sentences, escalate, twist, last-line payoff. About 2.5 words/s.
2. **Voiceover**: the user usually supplies an ElevenLabs file. If not, ask for it or synthesize a placeholder track. Save as `voice.wav`.
3. **Word timings**: get word-level timestamps (forced alignment against the script text, e.g. pocketsphinx or whisper word timestamps). Save `words.json` as `[{"w":"my","s":0.20,"e":0.41}, ...]`, using the script's spelling and punctuation (captions use trailing punctuation to break groups).
4. **Lip-sync envelope**: `python3 lipsync.py voice.wav env.json`.
5. **Shot list**: one line per shot: start/end time, what the viewer sees, camera move, who acts. Aim for a cut every ~2.6 s. Vary framing: close-up face, medium two-shot, low-angle push-in, high-angle crane over the crowd, whip-tilt, over-the-shoulder, insert on a prop (phone, badge). Write the shots into `SHOTS` in `scene.html`.
6. **Build the cast + set** from `blockkit.js` / `props.js` (see code). Reuse `room()`, `chair()`, `bench()`, `crowd()`; build new props with `box()` in the palette above.
7. **Check stills first** (cheap): `node render.cjs scene.html outstills 1,4,7,...`; look at close-ups of every named character, one walk, one gesture, one wide. Fix before rendering video.
8. **Render video** (about 1-1.7 s/frame at 720x1280 on 2 cores, so 40 s is about 15-25 min; run chunks in parallel and in the background):

```bash
export NODE_PATH=$(npm root -g)      # playwright is global in the sandbox; otherwise: npm i playwright && npx playwright install chromium
S=30; for i in 0 1; do (node render.cjs scene.html part$i.mp4 --from $((i*S)) --to $(((i+1)*S)) > r$i.log 2>&1 &); done   # 2 chunks of 30 s; wait for both
printf "file 'part0.mp4'\nfile 'part1.mp4'\n" > list.txt && ffmpeg -y -f concat -safe 0 -i list.txt -c copy silent.mp4
```

9. **Audio + mux** (continuous quiet bed under voice, about -14 LUFS):

```bash
D=130   # >= video length
ffmpeg -y -f lavfi -i "sine=f=55:d=$D" -f lavfi -i "sine=f=82.4:d=$D" -f lavfi -i "sine=f=110:d=$D" -filter_complex "[0][1][2]amix=inputs=3:normalize=0,lowpass=f=500,tremolo=f=0.12:d=0.35,aformat=channel_layouts=stereo,afade=t=in:d=1[bed]" -map "[bed]" -ar 44100 bed.wav
ffmpeg -y -i silent.mp4 -i voice.wav -i bed.wav -filter_complex "[2:a]volume=0.12[b];[1:a][b]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7,aformat=channel_layouts=stereo[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k final.mp4
```

10. **QC before delivering**: (a) contact sheet, one frame per ~2.6 s, check characters/captions; (b) motion check, mean frame diff on a downscaled gray stream, expect 0 static frames:

```bash
python3 - <<'E'
import subprocess, numpy as np
W,H=90,160
a=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','final.mp4','-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],capture_output=True).stdout,dtype=np.uint8).reshape(-1,H,W).astype(np.float32)
d=np.abs(np.diff(a,axis=0)).mean(axis=(1,2)); print(len(a),'frames; static:',(d<.02).sum(),'; spikes(cuts):',(d>14).sum())
E
```

(c) loudness `ffmpeg -i final.mp4 -af ebur128 -f null -` (about -14 LUFS), (d) captions match speech.
Deliver with `SendUserFile` (mp4 + a cover still).

## 5. Setup

```bash
mkdir -p work && cd work && npm init -y >/dev/null && npm i three@0.160.0 @fontsource/poppins
# create the files below in this folder: blockkit.js props.js captions.js render.cjs lipsync.py scene.html
# (or copy the ready-made files from this repo's kit/ folder, which also has station.js, cast.js, designsheet.html, envsheet.html, jointtest.html)
```

Always run `render.cjs` from this folder (it serves the CWD over HTTP).

## 6. Code

### blockkit.js (characters, faces, hands, outline, easing, stage)

```js
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
export const grp = (parent, pos = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...pos); parent && parent.add(g); return g; };
/** cloth ball that hides a joint: same colour as the clothing, radius = limb half-width + ~0.002, stretched along the limb with sc */
export function ball(r, color, { parent, pos = [0, 0, 0], sc = [1, 1, 1], line = true } = {}) {
  const g = new THREE.SphereGeometry(r, 22, 16), m = new THREE.Mesh(g, mat(color));
  m.position.set(...pos); m.scale.set(...sc); m.castShadow = true; m.receiveShadow = true;
  if (line) m.add(new THREE.Mesh(g, outlineMat));
  if (parent) parent.add(m); return m;
}

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
  // glasses: nose bridge between the rings + temple lines to the face edges (rings alone look disconnected)
  if (g) {
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
// makeChar options: skin, hair (#hex), hairStyle 'quiff'|'short'|'long', outfit (key of OUTFITS or a custom object), glasses, hat 'flat'|'police', mustache, scale, headScale, seed, lod (1 = crowd extra)
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
  // arms (arms[0] and legs[0] are on the same side: -x = the character's right, nearest camera when yaw = PI/2)
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

/* apply a pose (radians). arm = [pitch, out, elbow, curl, spread, thumbOut]; arm pitch + = forward/up. legs = [hipA, kneeA, hipB, kneeB]; hip + = leg BACK, knee + = bends (clamped >= 0).
   yaw 0 = facing +z (toward a camera on +z); yaw PI/2 = facing +x. SET C.p.x/z/yaw EVERY FRAME, applyPose overwrites the root. */
export function applyPose(C, p) {
  C.root.position.set(p.x, p.y, p.z); C.root.rotation.y = p.yaw;
  C.hips.position.y = .58 + p.bob; C.torso.rotation.set(p.lean, p.twist, p.sway || 0);
  C.head.rotation.set(p.headPitch, p.headYaw, p.headRoll);
  [p.armL, p.armR].forEach((a, i) => { const A = C.arms[i]; A.sh.rotation.set(-a[0], 0, A.s * (.06 + a[1])); A.el.rotation.set(-a[2], 0, 0); curl(A.hand, a[3], a[4] || 0, a[5] || 0); });
  C.legs.forEach((L, i) => { L.hip.rotation.x = p.legs[i * 2]; L.kn.rotation.x = Math.max(0, p.legs[i * 2 + 1]); });
}
/* always-on life: breathing, sway, blinks, eye darts. t in seconds. Call AFTER setting the pose/face for the frame, BEFORE applyPose. */
export function idle(C, t, seed = 0) {
  const R = x => Math.sin(x + seed * 7.3);
  C.p.bob = .004 * R(t * 2.2); C.p.sway = .012 * R(t * .9 + 1); C.p.headRoll = (C.p.headRoll || 0) + .012 * R(t * .7); C.p.headPitch += .015 * R(t * 1.1);
  const per = 3.1 + (seed % 5) * .37, ph = (t + seed * 1.3) % per, bl = ph < .13 ? Math.sin(Math.PI * ph / .13) : 0;
  C.face.open = [1 - bl * .96, 1 - bl * .96]; C.face.lookX += .12 * R(t * .6 + 2) * .3; C.face.lookY += .08 * R(t * .5);
}
/* walk cycle, phase in cycles (use ~1 cycle per second). Call idle() after it (idle adds to bob). */
export function walk(C, ph, amp = 1) {
  const s = Math.sin(ph * 2 * Math.PI), c = Math.cos(ph * 2 * Math.PI);
  C.p.legs = [.55 * s * amp, Math.max(0, -c) * .7 * amp, -.55 * s * amp, Math.max(0, c) * .7 * amp];
  /* arms OPPOSE the same-side leg (leg back when s>0 -> same-side arm forward); forward-swinging arm bends more */
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
/** place the camera: pos [x,y,z], look [x,y,z], fov degrees, roll radians */
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
```

### props.js (set pieces + crowd; copy the pattern for any location)

```js
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
```

### captions.js (word-by-word colour captions)

```js
// captions.js — word-by-word colour captions (white base, key words coloured, thick black stroke, lowercase, pop-in)
import { easeBack, rng } from './blockkit.js';
export const CAP_COLORS = ['#f5c32c', '#48c9f0', '#ff5b4d', '#ff7ac0', '#2ecc8f', '#ffa21f'];
const STOP = new Set('the a an and or but to of in on at is it its was were be been he she they we i you my me his her their our this that with for as by from so if then than too very just not no'.split(' '));
export function groupWords(words, { max = 3, gap = .38, seed = 7 } = {}) {
  const R = rng(seed); let ci = 0, groups = [], cur = [];
  const flush = () => { if (cur.length) groups.push(cur), cur = []; };
  words.forEach((w, i) => {
    const raw = w.w.toLowerCase(), key = raw.replace(/[^a-z0-9']/g, '');
    const col = (!STOP.has(key) && key.length > 2 && R() < .62) ? CAP_COLORS[ci++ % CAP_COLORS.length] : null;
    cur.push({ ...w, text: raw, col });
    const end = /[.,?!;:"”]$/.test(raw), nxt = words[i + 1], big = nxt && nxt.s - w.e > gap;
    if (cur.length >= max || end || big) flush();
  }); flush(); return groups;
}
export function captionAt(groups, t) {                       // -> {html, pop} or null
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i], s = g[0].s, e = Math.max(g[g.length - 1].e + .12, s + .3), nx = groups[i + 1] ? groups[i + 1][0].s : 1e9;
    if (t >= s && t < Math.min(e, nx)) return { html: g.map(w => `<span${w.col ? ` style="color:${w.col}"` : ''}>${w.text.replace(/</g, '&lt;')}</span>`).join(' '), pop: easeBack((t - s) / .14) };
  } return null;
}
```

### render.cjs (headless driver: stills or video)

```js
// usage: node render.cjs page.html out_dir t1,t2,...   |   node render.cjs page.html out.mp4 --from 0 --to 10 [--fps 30] [--w 720 --h 1280]
// page must define window.frame(t) and set window.__ready = true. Needs NODE_PATH=$(npm root -g) if playwright is global.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const a = process.argv.slice(2), flag = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.json': 'application/json', '.css': 'text/css' };
const root = process.cwd();
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); });
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
  const W = +flag('w', 720), H = +flag('h', 1280);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ' ' + m.text()); });
  await pg.goto(`http://127.0.0.1:${port}/${a[0]}?w=${W}&h=${H}`); await pg.waitForFunction('window.__ready===true', null, { timeout: 60000 });
  await pg.evaluate(() => document.fonts.ready);
  const shot = async (t, png) => { await pg.evaluate(t => window.frame(t), t); return pg.screenshot(png ? { type: 'png' } : { type: 'jpeg', quality: 93 }); };
  if (flag('from') == null) { fs.mkdirSync(a[1], { recursive: true }); for (const t of a[2].split(',').map(Number)) { const t0 = Date.now(); fs.writeFileSync(path.join(a[1], 't_' + t.toFixed(2).padStart(5, '0') + '.png'), await shot(t, true)); console.log('t=' + t, Date.now() - t0, 'ms'); } }
  else {
    const fps = +flag('fps', 30), from = +flag('from'), to = +flag('to'), n = Math.round((to - from) * fps), i0 = Math.round(from * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', a[1]], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res())); const t00 = Date.now();
    for (let f = 0; f < n; f++) { const buf = await shot((i0 + f) / fps, false); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (f % 30 === 0) process.stdout.write(`\r${f}/${n} ${((Date.now() - t00) / (f + 1) / 1000).toFixed(2)}s/f`); }
    ff.stdin.end(); await done; console.log();
  }
  if (errs.length) console.log([...new Set(errs)].slice(0, 8).join('\n')); await b.close(); srv.close();
})();
```

Note: a harmless `404` message appears when `words.json` / `env.json` are absent (the template falls back to placeholder words and a synthetic mouth).

### lipsync.py (voiceover loudness -> mouth-open envelope at 30 fps)

```python
#!/usr/bin/env python3
"""voice.(wav|mp3) -> env.json : mouth-open envelope 0..1 sampled at FPS (default 30). usage: lipsync.py voice.wav env.json [fps]"""
import sys, json, subprocess, numpy as np
src, out = sys.argv[1], sys.argv[2]; fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
raw = subprocess.run(['ffmpeg','-v','error','-i',src,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
hop = 16000 // fps; n = len(x) // hop
rms = np.sqrt((x[:n*hop].reshape(n, hop) ** 2).mean(1))                 # one value per video frame
rms = np.convolve(np.pad(rms, 1, mode='edge'), [.25, .5, .25], 'valid')    # light smoothing
lo, hi = np.percentile(rms, 20), np.percentile(rms, 95)
env = np.clip((rms - lo) / (hi - lo + 1e-9), 0, 1) ** .8                  # gate quiet gaps, keep speech peaks
json.dump({'fps': fps, 'v': [round(float(v), 3) for v in env]}, open(out, 'w'))
print(len(env), 'frames', round(len(env)/fps,1), 's  mean', round(float(env.mean()),2))
```

### scene.html (template: set, cast, SHOTS, camera, captions). Edit the cast, set and SHOTS; keep the `frame(t)` structure.

```html
<!doctype html><meta charset=utf-8>
<style>
@font-face{font-family:Poppins;font-weight:800;src:url(/node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2)}
html,body{margin:0;background:#000;overflow:hidden}#wrap{position:relative;width:100vw;height:100vh}canvas{display:block}
#cap{position:absolute;left:4%;right:4%;top:64%;text-align:center;font:800 7.6vw/1.08 Poppins,sans-serif;color:#fff;text-transform:lowercase;-webkit-text-stroke:1.5vw #000;paint-order:stroke fill;text-shadow:0 .7vw 0 rgba(0,0,0,.28);transform-origin:50% 60%}
#cap span{white-space:nowrap}
</style>
<div id=wrap><div id=cap></div></div>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as K from '/blockkit.js'; import { room, chair, bench, crowd } from '/props.js'; import { groupWords, captionAt } from '/captions.js';
const { kf, ease, easeIO, easeOut } = K;
const q = new URLSearchParams(location.search), W = +q.get('w') || 720, H = +q.get('h') || 1280;
await document.fonts.load('800 64px Poppins');
const S = K.makeStage(W, H, { sky: '#e9d6b4' }); document.getElementById('wrap').prepend(S.renderer.domElement);
const { scene, camera, renderer, sun, hemi } = S; hemi.intensity = 2.9; sun.intensity = 1.5; sun.position.set(-7, 11, 4); sun.target.position.set(0, 0, -6);

/* ---- data: words.json [{w,s,e}] from forced alignment; env.json from lipsync.py (both optional) ---- */
const words = await fetch('/words.json').then(r => r.json()).catch(() => 'hello there this is a test of the caption system and it should pop in word by word'.split(' ').map((w, i) => ({ w, s: .2 + i * .4, e: .2 + i * .4 + .32 })));
const env = await fetch('/env.json').then(r => r.json()).catch(() => null);
const groups = groupWords(words), capEl = document.getElementById('cap');
const talkAmt = (t, sd = 0) => env ? env.v[Math.min(env.v.length - 1, Math.max(0, Math.floor(t * env.fps)))] : Math.max(0, Math.sin(t * 17 + sd) * .5 + Math.sin(t * 9.3 + sd * 2) * .35 + .1);

/* ---- set + cast ---- */
room(scene, { w: 12, d: 40, h: 9 }); chair(scene, [-4.6, .22, -2.2], [0, 1.2, 0]); [[-2.2, -7], [2.4, -7]].forEach(([x, z]) => bench(scene, [x, 0, z]));
const people = crowd(scene, 14, { x: [-4.6, 4.6], z: [-20, -5], seed: 9 }); for (const c of people) { K.applyPose(c, c.p); c.drawFace(); }
const hero = K.makeChar({ outfit: 'suit', glasses: true, hairStyle: 'quiff', seed: 2 }); scene.add(hero.root);
const other = K.makeChar({ outfit: 'apron', skin: K.SKIN.dark, hairStyle: 'short', hair: '#14110f', hat: 'flat', mustache: true, seed: 8 }); scene.add(other.root);
const CAST = [hero, other];
// reset() parks everyone off-stage (z=-40) with a neutral pose/face; each shot's act() then places only who it needs.
function reset(C) { Object.assign(C.p, { x: 0, y: 0, z: -40, yaw: 0, lean: 0, twist: 0, sway: 0, headYaw: 0, headPitch: 0, headRoll: 0, bob: 0, armL: [0, 0, 0, .25], armR: [0, 0, 0, .25], legs: [0, 0, 0, 0] }); const f = K.FACE0(); f.glasses = C.face.glasses; f.iris = C === other ? '#2a1a10' : '#4a6a3a'; C.face = f; }

/* ---- shots: hard cut between shots, eased camera move INSIDE each shot (never static). act() poses the cast. ---- */
const SHOTS = [
  { t0: 0, t1: 3, fov: [[0, 52], [3, 46]], pos: [[0, [-.6, .8, 2.4]], [3, [-1.4, 1.0, 1.5]]], look: [[0, [-3, 1.15, -2]], [3, [-3, 1.25, -2]]], ease: easeOut, roll: [[0, .06], [3, -.02]],
    act(t) { Object.assign(other.p, { x: -3.2, z: -1.6, yaw: .35 }); other.face.mouth = talkAmt(t, 1) * .8; other.face.brow = [.2, .8, .3]; other.p.armR = [.9 + .35 * Math.sin(t * 2.4), .3, 1.2, .1, .3, .6]; } },
  { t0: 3, t1: 6, fov: [[3, 46], [6, 40]], pos: [[3, [1.8, 1.5, 3.4]], [6, [1.2, 1.45, 2.4]]], look: [[3, [0, 1.3, 0]], [6, [0, 1.35, 0]]], ease: easeOut, roll: [[3, -.04], [6, .03]],
    act(t) { Object.assign(hero.p, { x: 0, z: 0, yaw: .4 }); hero.p.armR = [1.25, .12, 1.95, .9]; hero.face.mouth = talkAmt(t, 3) * .6; hero.face.brow = [.1, .85, .3]; hero.face.smile = -.1; } },
  { t0: 6, t1: 9, fov: [[6, 60], [9, 54]], pos: [[6, [-2, 7, 6]], [9, [3.5, 3.2, 3.9]]], look: [[6, [0, .6, -6]], [9, [0, 1.3, -2.6]]], ease: easeIO, roll: [[6, -.06], [9, .05]],
    act(t) { K.walk(hero, (t - 6) * 1.0, 1); Object.assign(hero.p, { x: kf([[6, -1.8], [9, 1.9]], t, x => x), z: -2.6, yaw: Math.PI / 2 }); } },
];
window.frame = t => {
  CAST.forEach(reset); const sh = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1]; sh.act(t);
  CAST.forEach((C, i) => { K.idle(C, t, i + 1); K.applyPose(C, C.p); C.drawFace(); });
  const d = [Math.sin(t * .5) * .03, Math.sin(t * .37) * .02], P = kf(sh.pos, t, sh.ease), L = kf(sh.look, t, sh.ease);   // d = always-on handheld drift
  K.aim(camera, [P[0] + d[0], P[1] + d[1], P[2]], L, kf(sh.fov, t, sh.ease), kf(sh.roll, t, sh.ease) + d[1]);
  renderer.render(scene, camera);
  const c = captionAt(groups, t); capEl.innerHTML = c ? c.html : ''; capEl.style.transform = c ? `scale(${.8 + .2 * c.pop})` : 'none';
};
window.__ready = true;
</script>
```

## 7. Shot grammar (pick a different move for each consecutive shot)

| Move | Camera recipe (kf over the shot) | Use for |
|---|---|---|
| Low-angle push-in | pos y 0.8 -> 1.0, z 2.2 -> 1.5, fov 52 -> 46, `easeOut` | power / threat, someone shouting |
| Face close-up push | fov 46 -> 40, tiny roll swing | reactions, whispers, phone call |
| High-angle crane over crowd | pos y 7 -> 3, drifting in x, fov 60 -> 54, `easeIO` | scale, tension, "everyone is watching" |
| Whip-tilt up | look y +6 over 2.4 s with `easeIO(u*1.45)`, pos fixed | transition to a window/ceiling/sign |
| Over-shoulder two-shot | pos behind one character, look at the other, slow x drift | dialogue |
| Insert on prop | fov 35, pos 0.5 m from badge/phone/shoes, slow dolly | detail beats |
| Tracking side shot | camera at x offset, follows a walker with `kf` on x | movement |

## 8. Pitfalls (all hit in practice)

- ES modules + importmap do NOT work from `file://`. Always render through `render.cjs` (HTTP server), and run it from the project folder.
- Outline shader uniform must be `{ value: ... }` (not `{ v: ... }`) and `#include <colorspace_fragment>` must be on its own line in the GLSL string, otherwise the outline is missing or the shader fails to compile.
- `applyPose` overwrites the root transform. Set `C.p.x/z/yaw` every frame (the template's `reset()` + `act()` pattern does this); otherwise all characters stack at the origin.
- Knees bend only backward: keep `Math.max(0, knee)`.
- Walk: arms must oppose the same-side leg. A pacing walk (same-side arm and leg together) looks robotic.
- Floating glasses rings and visible gaps at the knees, elbows, shoulders and hips are the two design flaws the user noticed first. Keep the glasses bridge/temples and the joint cloth (`ball()`, pelvis, collar, wrist piece), and re-check them in a zoomed crop of the turnaround and of a bent-pose test before sending any sheet or video.
- Character-sheet facing: yaw 0 faces +z; yaw PI/2 faces +x; in a walk the nearest-to-camera side at yaw PI/2 is arms[0]/legs[0] (-x).
- Keep scene light at hemi about 2.9 + sun about 1.5 or the warm set renders muddy orange.
- SwiftShader (CPU WebGL) is slow: check stills first, render chunks in parallel in the background, keep 720x1280 unless the user asks for 1080x1920 (about 2x slower).
- Fonts: load with `document.fonts.load('800 64px Poppins')` before `__ready`, and use the local `@fontsource/poppins` woff2 (no CDN).
- Never reuse another project's script or visuals: write a new script and shot list for each story, change set/colours/cast to fit it, and keep the style rules above.
- Do not fake smoothness with frame blending. If motion looks steppy, fix easing/keyframes, not the encoder.