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
