import * as THREE from 'three';
import { P } from './palette.js';
import { T, LOOP, TAU, clamp, lerp, smooth, win, hash } from './config.js';
import { makePerson, poseStand, poseWalk, talk } from './scene/people.js';
import { makeGoat, makeSheep, makeHen, addMask, makeCreature, makeDragon, makeUfo } from './scene/beasts.js';
import { loopPath } from './scene/paths.js';
import { createCollider } from './scene/collide.js';
import { M, box, cyl, sph, cone } from './scene/common.js';
import { FC, RING, PEN } from './scene/world.js';

const W = (hz) => TAU * Math.round(hz * LOOP) / LOOP;
const PI = Math.PI, V = (x, y, z) => new THREE.Vector3(x, y, z);
const rainbow = (h, s = 0.85, l = 0.65) => new THREE.Color().setHSL(((h % 1) + 1) % 1, s, l);
const sm = (t, a, d) => smooth((t - a) / d);
const ringPos = (a0, t, L) => { const a = a0 + TAU * L(t); return [FC.x + Math.cos(a) * RING, FC.z + Math.sin(a) * RING, a]; };
const LAPS = 5, L = (t) => LAPS * smooth((t - T.dance0) / (T.dance1 - T.dance0));

export function createStage(scene, parts, lights) {
  const root = new THREE.Group(); scene.add(root); const cast = [];
  // ======================================================= the cult: Francisco and Marco, Idea, Axa and León
  const person = (top, bottom, o, mask, extra) => { const p = makePerson(top, bottom, o); addMaskTo(p, mask); if (extra) extra(p); root.add(p.root); return p; };
  const addMaskTo = (p, kind) => { p.mask = addMask(p, kind); };
  const tunic = (p, c, len = 0.95, r = 0.36) => { cone(p.pel, r, len, M(c), 0, -len / 2 + 0.06, 0, null, 14); p.legs.forEach((l) => { l.hip.visible = false; }); };
  const hair = (p, c, back = 0.3) => { sph(p.head, 0.1, M(c), 0, 0.02, -0.1, [1, back / 0.1 * 0.6, 0.8], 6, 5); };
  const francisco = person('cloth', 'wood3', { skin: 'skin1', hair: 'ink', shoes: 'wood5' }, 'goat', (p) => { p.hair.visible = false; box(p.head, 0.045, 0.1, 0.22, M('ink'), 0, 0.26, 0); for (const s of [-1, 1]) box(p.head, 0.012, 0.14, 0.2, M('skin2'), s * 0.1, 0.12, -0.01); cone(p.torso, 0.34, 0.55, M('wood5'), 0, 0.4, 0, null, 10); box(p.torso, 0.06, 0.62, 0.3, M('wood4'), 0.12, 0.28, 0.02, [0, 0, 0.1]); });
  const marco = person('wood3', 'cloth', { skin: 'skin2', hair: 'wood5', shoes: 'ink' }, 'wolf', (p) => { box(p.torso, 0.42, 0.08, 0.34, M('wood5'), 0, 0.05, 0); cone(p.torso, 0.3, 0.3, M('cloth'), 0, 0.55, 0, null, 8); });
  const idea = person('wood2', 'wood2', { skin: 'skin1', hair: 'wood5', shoes: 'wood5' }, 'owl', (p) => { tunic(p, 'wood2'); hair(p, 'wood5', 0.55); box(p.torso, 0.4, 0.06, 0.3, M('mustard'), 0, 0.06, 0); cone(p.torso, 0.3, 0.3, M('cloth'), 0, 0.55, 0, null, 8); });
  const axa = person('cloth', 'cloth', { skin: 'skin3', hair: 'ink', shoes: 'ink' }, 'fox', (p) => { tunic(p, 'wood4'); hair(p, 'ink', 0.6); box(p.torso, 0.4, 0.06, 0.3, M('orange'), 0, 0.06, 0); });
  const leon = person('wood5', 'wood4', { skin: 'skin2', hair: 'ink', shoes: 'wood5' }, 'stag', (p) => { box(p.torso, 0.46, 0.08, 0.36, M('cloth'), 0, 0.04, 0); sph(p.head, 0.12, M('ink'), 0, 0.1, -0.03, [1, 0.8, 1], 6, 5); });
  const cult = [francisco, marco, idea, axa, leon], BASE = [0.9, 2.5, 3.9, 5.2, 0.0];            // base angles on the ring: the five stand at these before the dance
  cult[4] = leon; const A0 = [0.2, 1.45, 2.65, 3.95, 5.1];
  const S0 = V(-1.25, 0, -1.2), G = V(PEN.x1 + 0.45, 0, 2.6), GF = V(-2.7, 0, 1.45), GO = V(-2.55, 0, 2.6);                                  // Francisco's two stations: at the stele and at the gate
  // ======================================================= the animals
  const pen = (i) => V(PEN.x0 + 0.6 + (i % 4) * 0.75, 0, PEN.z0 + 0.5 + Math.floor(i / 4) * 0.8 + 0.2 * hash(i));
  const animals = [];
  const addA = (a, kind, i) => { root.add(a.root); animals.push({ a, kind, i, ph: hash(i * 5.1) }); };
  const goats = [0, 1, 2].map((i) => { const g = makeGoat({ coat: i === 1 ? 'grey0' : 'cream', dark: i === 1 ? 'grey1' : 'wood1', patch: i === 2 }); addA(g, 'goat', i); return g; });
  const sheep = [3, 4, 5].map((i) => { const s = makeSheep({ wool: i === 4 ? 'cream' : 'white' }); addA(s, 'sheep', i); return s; });
  const hens = [6, 7, 8, 9].map((i) => { const h = makeHen({ coat: ['white', 'wood1', 'cream', 'orange'][i - 6], tail: i % 2 ? 'wood3' : 'orange' }); addA(h, 'hen', i); return h; });
  const CEN = [[-2.2, 4.8], [0.6, 5.1], [3.0, 5.0], [5.6, 1.9], [5.0, 4.4], [6.0, -0.4], [-1.2, 3.8], [1.8, 3.9], [3.9, 3.0], [5.2, 3.2]];
  animals.forEach((o) => { const k = o.i, c = CEN[k], r = o.kind === 'goat' ? 1.2 : o.kind === 'sheep' ? 1.0 : 0.55, pts = []; for (let j = 0; j < 16; j++) { const a = j / 16 * TAU, rr = r * (0.8 + 0.25 * Math.sin(j * 1.3 + k)); pts.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); } o.lp = loopPath(pts, 90 / (1 + (k % 2)), hash(k * 3.7)); o.pen = pen(k); o.d0 = 0.7 * k; o.d1 = 77.5 + 0.4 * k; o.rise = k * 0.25; });
  // ======================================================= spheres of water with creatures, discs and orbs of light
  const caps = ['fish', 'beetle', 'frog', 'mouse', 'eel'].map((kind, i) => {
    const g = new THREE.Group(); root.add(g); const c = makeCreature(kind); g.add(c.root);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), new THREE.MeshBasicMaterial({ color: P.cyan2, transparent: true, opacity: 0.32, depthWrite: false })); shell.renderOrder = 4; g.add(shell);
    const rim = new THREE.Mesh(new THREE.SphereGeometry(0.64, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })); rim.renderOrder = 4; g.add(rim);
    const bub = Array.from({ length: 4 }, (_, k) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); g.add(b); return b; });
    return { g, c, shell, rim, bub, b: i / 5 * TAU + 0.5, i };
  });
  const discs = [makeUfo('J3'), makeUfo('A1'), makeUfo('L6')]; discs.forEach((d) => root.add(d.root)); const DP = [V(-2.2, 6.4, -1.4), V(3.8, 7.0, -3.0), V(-5.0, 7.2, 1.0)];
  const orbs = Array.from({ length: 9 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); const h = new THREE.Mesh(new THREE.SphereGeometry(0.46, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); m.add(h); root.add(m); return { m, h, i }; });
  const orbAt = (i, tt) => { const sk = sm(tt, T.sky0, 8) * (1 - sm(tt, T.rise1, 6)), ld = sm(tt, T.land - 4, 8) * (1 - sm(tt, T.rise0 + 1, 8)), a = i / 9 * TAU + tt * W(0.1) * (1 + 0.6 * ld) + 2.5 * (1 - sk), hov = 1.4 + 0.5 * Math.sin(i * 2.1), hy = lerp(11, 2.0 + 1.0 * hov, sk) + sm(tt, T.rise0, 8) * 7, r = lerp(1.0, 3.0 + 0.5 * (i % 3), ld) + 3.0 * (1 - sk); return { p: V(FC.x + Math.cos(a) * r, hy + 0.2 * Math.sin(tt * W(0.7) + i), FC.z + Math.sin(a) * r) }; };
  const NTR = 20, trails = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }), orbs.length * NTR), od = new THREE.Object3D(); trails.frustumCulled = false; root.add(trails);
  const beams = Array.from({ length: 8 }, () => new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.55, 1, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))); beams.forEach((b) => { b.renderOrder = 3; root.add(b); });
  const dragon = makeDragon(); root.add(dragon.root);
  const NS = 36, sparks = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), NS), sd = new THREE.Object3D(); sparks.frustumCulled = false; root.add(sparks);
  // ======================================================= solid bodies
  const bodies = [...cult.map((p, i) => ({ root: p.root, r: 0.28, mass: 1.2, name: 'c' + i })), ...animals.map((o) => ({ root: o.a.root, r: o.kind === 'hen' ? 0.14 : 0.28, mass: o.kind === 'hen' ? 0.3 : 0.7, name: o.kind + o.i }))];
  animals.forEach((o, k) => { bodies[cult.length + k].rects = parts.animalRects; });
  const collider = createCollider(bodies, parts.rects);
  const polar = (px, pz, qx, qz, e) => { const ap = Math.atan2(pz - FC.z, px - FC.x), aq = Math.atan2(qz - FC.z, qx - FC.x), rp = Math.hypot(px - FC.x, pz - FC.z), rq = Math.hypot(qx - FC.x, qz - FC.z); let da = aq - ap; while (da > PI) da -= TAU; while (da < -PI) da += TAU; const a = ap + da * e, r = lerp(rp, rq, e); return [FC.x + Math.cos(a) * r, FC.z + Math.sin(a) * r]; };
  const yawOf = (ax, az, bx, bz) => Math.atan2(bx - ax, bz - az);

  function update(t) {
    t = clamp(t, 0, LOOP);
    collider.restore();
    // ---- the cult
    const mk = sm(t, T.mask0, 3), mkOn = t >= T.mask1 - 0.2 && t < 83.5;
    const gateOpen = sm(t, T.gate - 0.3, 1.2) * (1 - sm(t, 82, 2.5));
    cult.forEach((p, i) => {
      let x, z, yaw, walking = false, ph = 0;
      const rp = (tt) => ringPos(A0[i], tt, L), r0 = rp(t), dancing = t >= T.dance0 - 0.5 && t <= T.dance1 + 0.5;
      if (i === 0) {                                                                      // Francisco: stele, ring, gate, ring, gate, stele
        let pos = [S0.x, S0.z]; const w1 = sm(t, 17, 2.5), w2 = sm(t, 24, 3.2) * (1 - sm(t, 34, 3.2)), w3 = sm(t, 78, 3.2) * (1 - sm(t, 86, 3.8));
        const base = [lerp(S0.x, r0[0], w1), lerp(S0.z, r0[1], w1)]; const ringW = w1 * (1 - w2) * (1 - sm(t, 78, 3.2) * 0) ;
        // final: after the dance he walks to the gate and then back to the stele
        const ringHold = t < 78 ? [lerp(S0.x, r0[0], w1), lerp(S0.z, r0[1], w1)] : [r0[0], r0[1]];
        let q = ringHold; if (t >= 24 && t < 38) { q = [lerp(ringHold[0], GF.x, w2), lerp(ringHold[1], GF.z, w2)]; } else if (t >= 38 && t < 78) q = [r0[0], r0[1]];
        if (t >= 78) { const e = sm(t, 78, 3.2), f = sm(t, 86, 3.8); const gx = lerp(r0[0], GF.x, e), gz = lerp(r0[1], GF.z, e); q = [lerp(gx, S0.x, f), lerp(gz, S0.z, f)]; }
        x = q[0]; z = q[1]; const prev = (() => { const tt = t - 0.1; return [0, 0]; })(); void prev; void pos; void base; void ringW;
        const t2 = t + 0.08; let n; { // heading from the position a moment later
          const f = (tt) => { const a1 = sm(tt, 17, 2.5), a2 = sm(tt, 24, 3.2) * (1 - sm(tt, 34, 3.2)); const rr = ringPos(A0[0], tt, L); let o; if (tt < 24) o = [lerp(S0.x, rr[0], a1), lerp(S0.z, rr[1], a1)]; else if (tt < 38) { const h0 = [lerp(S0.x, rr[0], 1), lerp(S0.z, rr[1], 1)]; o = [lerp(h0[0], GF.x, a2), lerp(h0[1], GF.z, a2)]; } else if (tt < 78) o = [rr[0], rr[1]]; else { const e = sm(tt, 78, 3.2), ff = sm(tt, 86, 3.8); o = [lerp(lerp(rr[0], GF.x, e), S0.x, ff), lerp(lerp(rr[1], GF.z, e), S0.z, ff)]; } return o; };
          n = f(t2); const c = f(t); x = c[0]; z = c[1]; }
        const dx = n[0] - x, dz = n[1] - z, sp = Math.hypot(dx, dz) / 0.08;
        walking = sp > 0.12; yaw = walking ? Math.atan2(dx, dz) : (t < 17 ? yawOf(x, z, FC.x, FC.z) : (t > 31 && t < 36 ? yawOf(x, z, PEN.x1, 2.6) : yawOf(x, z, FC.x, FC.z)));
        ph = walking ? t * sp * 3.2 : 0;
      } else {
        x = r0[0]; z = r0[1]; const r1 = rp(t + 0.08), dx = r1[0] - x, dz = r1[1] - z, sp = Math.hypot(dx, dz) / 0.08; walking = sp > 0.1; yaw = walking ? Math.atan2(dx, dz) : yawOf(x, z, FC.x, FC.z); ph = walking ? L(t) * TAU * RING / 0.75 * 0.55 : 0;
      }
      p.root.position.set(x, 0, z); p.root.rotation.y = yaw; p.shadow.visible = true; p.sitting = false;
      const dn = dancing && walking ? 1 : 0, sw = Math.sin(t * W(1.5) + i);
      if (walking) { poseWalk(p, ph, i === 0 && !dancing ? 1 : 1.05, 0); if (dancing) { p.arms[0].sh.rotation.set(-0.5 - 0.5 * Math.sin(ph), 0, -0.6 - 0.4 * Math.max(0, sw)); p.arms[1].sh.rotation.set(-0.5 + 0.5 * Math.sin(ph), 0, 0.6 + 0.4 * Math.max(0, -sw)); p.arms[0].el.rotation.x = -0.6; p.arms[1].el.rotation.x = -0.6; p.torso.rotation.x = 0.1; } }
      else { poseStand(p, t, 0.25 * Math.sin(t * W(0.15) + i), i * 1.1); if (t < T.mask0 + 8 && i === 0 && t > 6) { talk(p, t, 0.3, 1.1); p.arms[0].sh.rotation.set(-0.8 - 0.3 * Math.sin(t * W(0.4)), 0, -0.4); p.arms[0].el.rotation.x = -0.7; } else if (i > 0 && t < T.mask1) talk(p, t, i * 1.3, 0.4); if (t >= T.dance1 - 1 && t < T.dance1 + 3 || (t >= T.free0 && t < T.free1 && i === 0)) { p.arms[1].sh.rotation.set(-0.9, 0, 0.2); p.arms[1].el.rotation.x = -0.4; } }
      // putting the mask on, then raising the arms at the peak
      if (t >= T.mask0 && t < T.mask1) { const e = smooth((t - T.mask0 - i * 0.2) / 2.2), u = Math.sin(PI * clamp(e, 0, 1)); p.arms[1].sh.rotation.x = -2.4 * u; p.arms[1].el.rotation.x = -1.4 * u; p.arms[0].sh.rotation.x = -2.4 * u; p.arms[0].el.rotation.x = -1.4 * u; }
      const peak = sm(t, T.land, 3) * (1 - sm(t, T.rise1, 3)); if (peak > 0.05) { p.head.rotation.x = -0.35 * peak; p.arms[0].sh.rotation.z = -1.0 * peak - 0.2; p.arms[1].sh.rotation.z = 1.0 * peak + 0.2; }
      p.mask.visible = mkOn; p.mask.scale.setScalar(mkOn ? Math.min(1, 0.4 + 0.6 * mk) : 0.01); p.mask.rotation.x = 0.0;
    });
    // ---- the gate
    parts.gate.g.rotation.y = -1.45 * gateOpen;
    // ---- the animals: in the pen, out through the gate to wander round the fire, and home again; in the Arrebatamiento they rise
    const rise = (o) => sm(t, T.rise0 + o.rise, 5) * (1 - sm(t, T.down0 + o.rise * 0.8, 5));
    animals.forEach((o) => {
      const a = o.a, p0 = o.pen, lp = o.lp(t), outE = sm(t, T.free0 + o.d0, 8) * (1 - sm(t, o.d1, 8.5)); const G1 = G;
      let x, z; const f = (tt) => { const l = o.lp(tt), e = sm(tt, T.free0 + o.d0, 8) * (1 - sm(tt, o.d1, 8.5)); const ph1 = clamp(e * 2, 0, 1), ph2 = clamp(e * 2 - 1, 0, 1); const gx = lerp(p0.x, GO.x, smooth(ph1)), gz = lerp(p0.z, GO.z, smooth(ph1)); return [lerp(gx, l.x, smooth(ph2)), lerp(gz, l.z, smooth(ph2))]; };
      const c = f(t), n = f(t + 0.08); x = c[0]; z = c[1]; const dx = n[0] - x, dz = n[1] - z, sp = Math.hypot(dx, dz) / 0.08, mv = sp > 0.1 && outE > 0.001;
      const yaw0 = Math.atan2(dx, dz); a.root.position.set(x, 0, z); if (!o.yaw) o.yaw = hash(o.i * 9.1) * TAU; if (mv) o.yaw = yaw0; else o.yaw = o.yaw; const yaw = mv ? yaw0 : (t < T.free0 ? hash(o.i * 9.1) * TAU : (o.stillYaw ?? 0));
      a.root.rotation.y = outE < 0.001 || !mv ? hash(o.i * 9.1) * TAU + 0.4 * Math.sin(t * W(0.1) + o.i) : yaw;
      const gp = t * sp * 4.0 + o.i, risen = rise(o), swing = Math.sin(gp);
      if (a.legs) a.legs.forEach((l, k) => { l.rotation.x = mv && risen < 0.1 ? (k % 3 ? 1 : -1) * swing * 0.5 : risen * (k % 2 ? 0.5 : -0.5) * 0.6; });
      if (a.legs && o.kind === 'hen') { a.body.position.y = 0.2 + (mv ? 0.01 * Math.abs(swing) : 0); const peck = Math.max(0, Math.sin(t * W(0.8) + o.i * 1.7)) * (mv ? 0 : 1); a.head.rotation.x = 0.7 * peck; }
      else { a.body.position.y = a.h + (mv ? 0.02 * Math.abs(swing) : 0); if (a.neck) { const graze = Math.max(0, Math.sin(t * W(0.15) + o.i * 2.1)) * (mv ? 0 : 1); a.neck.rotation.x = (o.kind === 'goat' ? -0.6 : 0) + 0.7 * graze; } }
      a.root.position.y = risen * (5.4 + 0.4 * (o.i % 3)); a.root.rotation.y += risen * TAU * 0.4 * Math.sin(risen * PI * 0.5); a.shadow.visible = risen < 0.5; a.shadow.material.opacity = 0.85 * (1 - risen);
    });
    // ---- the sky: discs, orbs, beams and spheres of water
    const sky = sm(t, T.sky0, 8) * (1 - sm(t, T.rise1, 6)), land = sm(t, T.land - 4, 8) * (1 - sm(t, T.rise0 + 1, 8));
    discs.forEach((d, k) => { const hy = DP[k].y + (1 - sky) * 9; d.root.position.set(DP[k].x + Math.sin(t * W(0.1) + k) * 0.4, hy + 0.15 * Math.sin(t * W(0.25) + k), DP[k].z); d.root.visible = sky > 0.01;
      if (d.kind === 'L6') { d.root.rotation.set(0, t * W(0.4), 0.1 * Math.sin(t * W(0.2))); } else d.root.rotation.set(0.08 * Math.sin(t * W(0.15) + k), t * W(0.5) * (k ? -1 : 1), 0.08 * Math.cos(t * W(0.2)));
      d.lights.forEach((l, j) => { l.material.color.copy(rainbow(j / 12 + t * 6 / 90, 0.9, 0.6 + 0.2 * Math.sin(t * W(3) + j))); }); });
    orbs.forEach((o) => { const q = orbAt(o.i, t); o.m.position.copy(q.p); o.m.visible = sky > 0.01; const c = rainbow(o.i * 0.12 + t * 6 / 90, 0.5, 0.85); o.m.material.color.copy(c); o.h.material.color.copy(c); o.m.scale.setScalar(0.9 + 0.2 * Math.sin(t * W(1.3) + o.i));
      for (let k = 0; k < NTR; k++) { const age = (k + 1) * 0.05, tt = Math.max(0, t - age), qq = orbAt(o.i, tt), sk2 = sm(tt, T.sky0, 8) * (1 - sm(tt, T.rise1, 6)); od.position.copy(qq.p); od.scale.setScalar(sk2 > 0.01 ? 0.17 * (1 - k / NTR) : 0.0001); od.updateMatrix(); trails.setMatrixAt(o.i * NTR + k, od.matrix); trails.setColorAt(o.i * NTR + k, rainbow(o.i * 0.12 + tt * 6 / 90, 0.6, 0.55 * (1 - k / NTR * 0.5))); } });
    trails.instanceMatrix.needsUpdate = true; if (trails.instanceColor) trails.instanceColor.needsUpdate = true;
    beams.forEach((b, k) => { const tgt = k < 5 ? caps[k] : null, d = discs[k % 3]; const bx = k < 5 ? tgt.g.position.x : FC.x + Math.cos(k * 2) * 2.2, bz = k < 5 ? tgt.g.position.z : FC.z + Math.sin(k * 2) * 2.2; const top = d.root.position, h = top.y - 0.2; b.position.set((top.x + bx) / 2, h / 2 + 0.1, (top.z + bz) / 2); const dir = V(bx - top.x, -h, bz - top.z), len = dir.length(); b.scale.set(1, len, 1); b.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize().multiplyScalar(-1)); b.position.set((top.x + bx) / 2, (top.y + 0.2) / 2 + 0.1, (top.z + bz) / 2); b.material.opacity = 0.09 * land * (0.7 + 0.3 * Math.sin(t * W(1.1) + k)); b.material.color.copy(rainbow(k * 0.13 + t * 4 / 90, 0.5, 0.8)); b.visible = land > 0.01; });
    caps.forEach((c) => { const i = c.i, a = c.b + t * W(0.05) * 0, rr = 3.9 + 0.3 * (i % 2), hy = lerp(14, 1.5 + 0.25 * Math.sin(t * W(0.4) + i), smooth(clamp((t - (T.sky0 + i * 1.3)) / 9, 0, 1))) + sm(t, T.rise0 + 0.5 * i, 8) * 9;
      c.g.position.set(FC.x + Math.cos(a) * rr, hy, FC.z + Math.sin(a) * rr * 0.9); c.g.visible = t > T.sky0 + i * 1.3 && t < T.rise1 + 6 && hy < 13.5; c.c.root.rotation.y = t * W(0.8) * (i % 2 ? 1 : -1); c.c.root.position.y = 0.08 * Math.sin(t * W(0.6) + i); c.c.root.scale.setScalar(0.85); c.shell.material.opacity = 0.28 + 0.1 * Math.sin(t * W(1) + i);
      c.bub.forEach((b, k) => { const u = (((t / 3 + k / 4) % 1) + 1) % 1; b.position.set(0.18 * Math.cos(k * 2 + t), -0.4 + u * 0.8, 0.18 * Math.sin(k * 2)); b.scale.setScalar(0.6 + 0.6 * (1 - u)); b.material.opacity = 0.8 * Math.sin(u * PI); }); });
    // ---- the dragon of the vision
    { const v = sm(t, T.vision0, 2) * (1 - sm(t, T.vision1 - 2, 2)); dragon.root.visible = v > 0.01; if (v > 0.01) {
        const pathAt = (u) => V(FC.x + Math.cos(u) * (1.9 + 0.4 * Math.sin(u * 3)), 2.8 + 0.7 * Math.sin(u * 2 + 1), FC.z + Math.sin(u) * (1.9 + 0.4 * Math.sin(u * 3))); const base = t * W(0.1), N = dragon.N, flap = Math.sin(t * W(2.5));
        for (let i = 0; i < N; i++) { const p = pathAt(base - i * 0.13); dragon.segs[i].position.copy(p); dragon.segs[i].scale.setScalar(v); dragon.spikes[i].position.copy(p).add(V(0, 0.16 * dragon.S * (1 - i * 0.03) * v, 0)); dragon.spikes[i].scale.setScalar(v); }
        dragon.tail.position.copy(pathAt(base - N * 0.13 - 0.1)); dragon.tail.scale.setScalar(v); dragon.tail.quaternion.setFromUnitVectors(V(0, 1, 0), V(0, 0, -1)); 
        const h = pathAt(base + 0.16), hd = pathAt(base + 0.3).sub(h).normalize(); dragon.head.position.copy(h); dragon.head.scale.setScalar(v); dragon.head.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(V(0, 0, 0), hd, V(0, 1, 0))); dragon.jaw.rotation.x = 0.3 + 0.2 * Math.sin(t * W(1.2));
        const bp = pathAt(base - 3 * 0.13), tg = pathAt(base - 3 * 0.13 + 0.05).sub(pathAt(base - 3 * 0.13 - 0.05)).normalize(), xz = V(0, 1, 0).cross(tg).normalize(), yy = tg.clone().cross(xz).normalize(), mq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xz, yy, tg));
        dragon.wings.forEach((w) => { w.g.position.copy(bp).add(V(0, 0.15 * dragon.S * v, 0)); w.g.quaternion.copy(mq); w.g.scale.setScalar(v); w.w.rotation.z = -w.s * (0.35 + 0.6 * flap); });
        dragon.legs.forEach((l) => { l.g.position.copy(pathAt(base - 1 * 0.13)).add(xz.clone().multiplyScalar(l.s * 0.18 * dragon.S * v)).add(V(0, -0.1 * dragon.S * v, 0)); l.g.scale.setScalar(v); l.g.rotation.z = l.s * 0.2; }); } }
    // ---- the fire and its sparks
    parts.flames.forEach((f) => { const w = Math.sin(t * W(3) + f.ph) * 0.5 + 0.5, w2 = Math.sin(t * W(5) + f.ph * 2); f.m.scale.set(0.8 + 0.2 * w, f.h * (0.8 + 0.3 * w + 0.12 * w2), 0.8 + 0.2 * w); f.m.position.y = 0.2 + f.h * 0.5 * (0.8 + 0.3 * w); f.m.rotation.z = 0.08 * w2; });
    lights.fire.intensity = 9 + 1.5 * Math.sin(t * W(4)) + 0.8 * Math.sin(t * W(7.3)); lights.glow.intensity = 11 * land + 4 * (sm(t, T.vision0, 2) * (1 - sm(t, T.vision1 - 2, 2))); lights.glow.color.copy(rainbow(t * 3 / 90, 0.4, 0.8));
    for (let i = 0; i < NS; i++) { const u = (((t / 4.5 + i / NS * 1.0 + hash(i * 3.1)) % 1) + 1) % 1, a = hash(i * 7.7) * TAU; sd.position.set(FC.x + Math.cos(a) * 0.25 * (1 - u) + 0.3 * Math.sin(u * 5 + i), 0.5 + u * 3.2, FC.z + Math.sin(a) * 0.25 * (1 - u)); sd.scale.setScalar(0.035 * (1 - u * 0.8)); sd.updateMatrix(); sparks.setMatrixAt(i, sd.matrix); sparks.setColorAt(i, new THREE.Color(P[u < 0.5 ? 'lamp' : 'orange'])); }
    sparks.instanceMatrix.needsUpdate = true; if (sparks.instanceColor) sparks.instanceColor.needsUpdate = true;
    bodies.forEach((b, k) => { b.fixed = k < cult.length; });
    collider.resolve();
  }
  return { update, cult, animals, collider };
}
