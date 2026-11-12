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
