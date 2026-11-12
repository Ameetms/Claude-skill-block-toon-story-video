# block-toon-story-video

A Claude skill plus a small code kit for making **9:16 first-person story shorts** in a chunky **3D block-toon style**: rounded-box characters with painted faces, ink outlines, an always-moving camera and word-by-word colour captions. Everything is rendered in code (three.js in headless Chromium, one deterministic `frame(t)` function, screenshots piped to ffmpeg), so any frame can be re-rendered on its own.

The style was studied from a reference short. No assets, characters or footage from that video are included; the cast and sets in this repo are original.

## What's in the repo

```
block-toon-story-video/
├── SKILL.md          the skill: style bible, animation rules, pipeline, full kit code, shot grammar, pitfalls
├── README.md         this file
├── kit/              ready-to-run copies of the code embedded in SKILL.md, plus the sheet pages
│   ├── blockkit.js       characters, painted faces, hands, outline shader, easing, stage
│   ├── props.js          room, chair, bench, crowd
│   ├── station.js        train-station hall + props (door, bench, chair, lamp, clock, coffee cart)
│   ├── cast.js           five original characters (Mira, Pip, Officer Dana, Gus, Prof. Pim) + model-sheet poses
│   ├── captions.js       word-by-word colour captions
│   ├── scene.html        story-video template (cast, SHOTS, camera, captions)
│   ├── designsheet.html  character lineup / turnaround / expressions sheets
│   ├── envsheet.html     environment sheets: hall views / props / floor plan
│   ├── jointtest.html    bent-pose stress test used to check the joint cloth
│   ├── render.cjs        headless driver: stills or video
│   ├── lipsync.py        voiceover loudness -> mouth-open envelope (30 fps)
│   └── package.json
└── examples/         the six reference sheets rendered by the kit
```

## Look and key design rules

- Every body part is a rounded box; about 4 heads tall; chunky mitten hands with fingers and a thumb.
- Faces are painted on a canvas texture and redrawn every frame (eyes, brows, mouth, blush are parameters).
- **Glasses are one connected frame**: two rings joined by a bridge arc, with temple lines to the face edges.
- **Joints are hidden under cloth**: a same-colour sphere at hip, knee, shoulder and elbow (`ball()`), a pelvis block, a collar block and a wrist piece, so bent limbs never show gaps.
- Ink outline via an inverted-hull shader; width is a fraction of camera distance (see SKILL.md for the formula and per-camera values).
- Warm cream/tan palette: wall `#dcbf96`, floor `#c7aa7d`, stone `#d9c39b`, wainscot `#b99a6f`, with navy, gold, teal and red accents.

## Examples

| Cast lineup | Mira turnaround | Mira expressions |
|---|---|---|
| ![lineup](examples/cast_lineup.png) | ![turnaround](examples/mira_turnaround.png) | ![expressions](examples/mira_expressions.png) |

| Hall views | Props | Floor plan |
|---|---|---|
| ![hall](examples/env_hall_views.png) | ![props](examples/env_props.png) | ![plan](examples/env_floorplan.png) |

## Quick start

Requirements: Node 18+, Python 3 (only for `lipsync.py`), `ffmpeg` on the PATH for video.

```bash
cd kit
npm install
npx playwright install chromium

# reference sheets (stills; the numbers are modes 0,1,2)
node render.cjs designsheet.html out_sheet 0,1,2 --w 1600 --h 900
node render.cjs envsheet.html    out_env   0,1,2 --w 1600 --h 900

# a still from the story template, then a video chunk
node render.cjs scene.html out_stills 1,4,7
node render.cjs scene.html chunk.mp4 --from 0 --to 10 --fps 30 --w 720 --h 1280
```

Always run `render.cjs` from `kit/`: it serves the current folder over HTTP, which the ES-module importmap needs (it does not work from `file://`). Rendering uses CPU WebGL (SwiftShader), so video takes roughly 1-2 s per frame at 720x1280; render chunks in parallel.

For a real story: put the voiceover at `voice.wav`, word timings at `words.json` (`[{"w":"my","s":0.2,"e":0.41}, ...]`), run `python3 lipsync.py voice.wav env.json`, then edit the cast, set and `SHOTS` in `scene.html`. SKILL.md has the full pipeline.

## Using it as a Claude skill

Copy the `block-toon-story-video` folder (the one containing `SKILL.md`) into your Claude skills location, or zip that folder and upload it as a custom skill in Claude settings. Then ask for a story short in this style, or for a character design or environment reference sheet.

## Customising

- New character: add a builder to `BUILD` and a row to `DEF` in `kit/cast.js` (change `scale`/`headScale`, hairstyle, hat, glasses, outfit colours, plus a few extra `box()` accessories).
- New location: copy the pattern in `kit/props.js` / `kit/station.js`; build props with `box()` in the same palette.
- Expressions: set `face.smile`, `face.mouth`, `face.brow = [height, tilt, arch]` (tilt > 0 angry, tilt < 0 worried), `squint`, `lookX/lookY`.

## Notes

- Fonts: Poppins is loaded from the local `@fontsource/poppins` package, not a CDN.
- three.js is pinned to 0.160.0 (the importmap in the HTML files points at `node_modules`).
- `Object3D.position` / `.rotation` are read-only in three.js: set components instead of assigning the objects.
