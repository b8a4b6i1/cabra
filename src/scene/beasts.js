import * as THREE from 'three';
import { M, box, cyl, sph, cone, contactShadow } from './common.js';
import { P } from '../palette.js';

const J = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const leg = (body, x, z, len, c, hoof) => { const hip = J(body, x, 0, z); cyl(hip, 0.045, 0.035, len, M(c), 0, -len / 2, 0, null, 6); const f = box(hip, 0.07, 0.05, 0.08, M(hoof), 0, -len - 0.02, 0.01); return hip; };

/** Goat: lean body, beard, back-swept horns. Faces +z. */
export function makeGoat(o = {}) {
  const root = new THREE.Group(), c = o.coat || 'cream', d = o.dark || 'grey1', body = J(root, 0, 0.62, 0);
  sph(body, 0.24, M(c), 0, 0, 0, [0.8, 0.85, 1.55], 10, 8); sph(body, 0.2, M(c), 0, 0.03, 0.34, [0.9, 1, 0.9], 8, 6);
  const legs = [leg(body, -0.12, 0.32, 0.42, c, 'ink'), leg(body, 0.12, 0.32, 0.42, c, 'ink'), leg(body, -0.12, -0.3, 0.42, c, 'ink'), leg(body, 0.12, -0.3, 0.42, c, 'ink')];
  const neck = J(body, 0, 0.1, 0.46); neck.rotation.x = -0.6; cyl(neck, 0.07, 0.1, 0.34, M(c), 0, 0.15, 0, null, 8);
  const head = J(neck, 0, 0.34, 0.02); head.rotation.x = 0.6; sph(head, 0.09, M(c), 0, 0, 0.02, [0.9, 1, 1.15], 8, 6); cyl(head, 0.04, 0.06, 0.16, M(d), 0, -0.05, 0.14, [Math.PI / 2 - 0.3, 0, 0], 6);
  for (const s of [-1, 1]) { sph(head, 0.014, M('ink'), s * 0.07, 0.03, 0.08, [1, 1, 0.6], 4, 3); cone(head, 0.03, 0.14, M(c), s * 0.12, 0.0, -0.04, [0, 0, -s * 1.2], 4); const h = cone(head, 0.03, 0.26, M('stone1'), s * 0.05, 0.12, -0.04, [-0.5, 0, -s * 0.25], 5); }
  box(head, 0.03, 0.1, 0.03, M(c), 0, -0.14, 0.12, [0.2, 0, 0]);
  const tail = J(body, 0, 0.12, -0.5); box(tail, 0.04, 0.12, 0.04, M(c), 0, 0.05, 0, [0.5, 0, 0]);
  if (o.patch) sph(body, 0.12, M(d), 0.08, 0.1, -0.1, [0.9, 0.6, 1.2], 6, 5);
  const shadow = contactShadow(0.5, 0.02, 0.8, 1.3); root.add(shadow);
  return { root, body, neck, head, legs, tail, shadow, h: 0.62 };
}
/** Sheep: a round woolly body on thin legs, dark face. Faces +z. */
export function makeSheep(o = {}) {
  const root = new THREE.Group(), w = o.wool || 'white', body = J(root, 0, 0.55, 0);
  sph(body, 0.3, M(w), 0, 0.02, 0, [0.9, 0.85, 1.25], 10, 8); for (let i = 0; i < 6; i++) sph(body, 0.12, M(w), Math.cos(i * 2.1) * 0.18, 0.2 + (i % 2) * 0.04, Math.sin(i * 2.1) * 0.25, [1, 0.8, 1], 6, 5);
  const legs = [leg(body, -0.11, 0.25, 0.32, 'grey1', 'ink'), leg(body, 0.11, 0.25, 0.32, 'grey1', 'ink'), leg(body, -0.11, -0.25, 0.32, 'grey1', 'ink'), leg(body, 0.11, -0.25, 0.32, 'grey1', 'ink')];
  const neck = J(body, 0, 0.1, 0.38); const head = J(neck, 0, 0.1, 0.1); sph(head, 0.1, M('grey1'), 0, 0, 0.04, [0.9, 1, 1.2], 8, 6); sph(head, 0.11, M(w), 0, 0.09, -0.02, [1, 0.6, 1], 6, 5);
  for (const s of [-1, 1]) { sph(head, 0.012, M('ink'), s * 0.06, 0.03, 0.12, [1, 1, 0.6], 4, 3); box(head, 0.09, 0.03, 0.05, M('grey1'), s * 0.12, 0.0, -0.01, [0, 0, -s * 0.3]); }
  const shadow = contactShadow(0.45, 0.02, 0.9, 1.3); root.add(shadow);
  return { root, body, neck, head, legs, shadow, h: 0.55 };
}
/** Hen. Faces +z. */
export function makeHen(o = {}) {
  const root = new THREE.Group(), c = o.coat || 'white', body = J(root, 0, 0.2, 0);
  sph(body, 0.12, M(c), 0, 0, 0, [0.9, 0.95, 1.25], 8, 6); sph(body, 0.06, M(c), 0, 0.02, -0.15, [0.6, 1.2, 1], 6, 5); box(body, 0.03, 0.1, 0.1, M(o.tail || 'orange'), 0, 0.1, -0.16, [0.4, 0, 0]);
  const head = J(body, 0, 0.14, 0.1); sph(head, 0.045, M(c), 0, 0, 0, [1, 1, 1], 6, 5); cone(head, 0.015, 0.05, M('yellow'), 0, -0.005, 0.06, [Math.PI / 2, 0, 0], 4); box(head, 0.015, 0.035, 0.04, M('red'), 0, 0.045, 0.0); sph(head, 0.008, M('ink'), 0.03, 0.01, 0.03, [1, 1, 1], 4, 3); sph(head, 0.008, M('ink'), -0.03, 0.01, 0.03, [1, 1, 1], 4, 3);
  const legs = [-1, 1].map((s) => { const l = J(body, s * 0.04, -0.08, 0); cyl(l, 0.008, 0.008, 0.12, M('yellow'), 0, -0.06, 0, null, 4); return l; });
  const shadow = contactShadow(0.18, 0.02); root.add(shadow);
  return { root, body, head, legs, shadow, h: 0.2 };
}
/** Animal masks for the cult; they sit on a person's head group. kind: goat, wolf, owl, stag, fox. */
export function addMask(p, kind) {
  const g = J(p.head, 0, 0.1, 0.06); g.visible = false;
  const cols = { goat: ['cream', 'stone1'], wolf: ['grey1', 'steel3'], owl: ['wood1', 'mustard'], stag: ['wood2', 'wood4'], fox: ['orange', 'cream'] }[kind];
  sph(g, 0.14, M(cols[0]), 0, 0.01, 0.04, [0.95, 1.1, 0.9], 8, 6);
  if (kind === 'goat') { for (const s of [-1, 1]) cone(g, 0.04, 0.3, M(cols[1]), s * 0.08, 0.22, -0.02, [-0.4, 0, -s * 0.3], 5); cone(g, 0.04, 0.2, M(cols[0]), 0, -0.1, 0.16, [Math.PI / 2 + 0.2, 0, 0], 5); box(g, 0.03, 0.12, 0.03, M(cols[1]), 0, -0.2, 0.08); }
  if (kind === 'wolf' || kind === 'fox') { cone(g, 0.07, 0.24, M(cols[0]), 0, -0.04, 0.2, [Math.PI / 2, 0, 0], 5); sph(g, 0.03, M('ink'), 0, -0.04, 0.33, [1, 0.8, 1], 4, 3); for (const s of [-1, 1]) cone(g, 0.045, 0.16, M(cols[0]), s * 0.09, 0.17, -0.02, [-0.1, 0, -s * 0.2], 4); }
  if (kind === 'owl') { for (const s of [-1, 1]) { sph(g, 0.06, M('white'), s * 0.06, 0.04, 0.12, [1, 1, 0.5], 6, 5); sph(g, 0.03, M('ink'), s * 0.06, 0.04, 0.16, [1, 1, 0.5], 4, 3); cone(g, 0.03, 0.1, M(cols[1]), s * 0.1, 0.17, -0.02, [-0.2, 0, -s * 0.3], 4); } cone(g, 0.03, 0.08, M('mustard'), 0, -0.04, 0.17, [Math.PI / 2 + 0.3, 0, 0], 4); }
  if (kind === 'stag') { for (const s of [-1, 1]) { cyl(g, 0.012, 0.015, 0.3, M(cols[1]), s * 0.08, 0.24, -0.02, [0, 0, -s * 0.3], 4); for (let k = 0; k < 3; k++) cyl(g, 0.01, 0.012, 0.12, M(cols[1]), s * (0.12 + 0.04 * k), 0.26 + 0.07 * k, -0.02, [0, 0, -s * 0.9], 4); } cone(g, 0.05, 0.18, M(cols[0]), 0, -0.05, 0.18, [Math.PI / 2, 0, 0], 5); for (const s of [-1, 1]) cone(g, 0.04, 0.12, M(cols[0]), s * 0.14, 0.04, -0.02, [0, 0, -s * 1.2], 4); }
  for (const s of [-1, 1]) sph(g, 0.018, M('black'), s * 0.065, 0.04, 0.12, [1, 1, 0.5], 4, 3);
  return g;
}
/** Creatures that arrive inside the spheres of water. kind: fish, beetle, frog, mouse, eel. */
export function makeCreature(kind) {
  const root = new THREE.Group(), b = J(root, 0, 0, 0);
  if (kind === 'fish') { sph(b, 0.12, M('orange'), 0, 0, 0, [0.7, 0.8, 1.8], 8, 6); cone(b, 0.1, 0.16, M('red'), 0, 0, -0.3, [Math.PI / 2, 0, 0], 4); box(b, 0.02, 0.1, 0.16, M('yellow'), 0, 0.12, 0); sph(b, 0.02, M('ink'), 0.06, 0.03, 0.18, [1, 1, 1], 4, 3); sph(b, 0.02, M('ink'), -0.06, 0.03, 0.18, [1, 1, 1], 4, 3); }
  if (kind === 'beetle') { sph(b, 0.12, M('teal'), 0, 0, 0, [1, 0.7, 1.4], 8, 6); sph(b, 0.07, M('lime'), 0, 0.04, -0.02, [1, 0.5, 1.2], 6, 5); sph(b, 0.06, M('ink'), 0, 0, 0.18, [1, 0.8, 1], 5, 4); for (const s of [-1, 1]) for (const z of [-0.06, 0.02, 0.1]) box(b, 0.14, 0.015, 0.015, M('ink'), s * 0.1, -0.08, z, [0, 0, s * 0.5]); }
  if (kind === 'frog') { sph(b, 0.12, M('green'), 0, 0, 0, [1, 0.8, 1.2], 8, 6); sph(b, 0.07, M('leaf'), 0, 0.02, 0.12, [1.2, 0.8, 1], 6, 5); for (const s of [-1, 1]) { sph(b, 0.035, M('yellow'), s * 0.05, 0.1, 0.14, [1, 1, 1], 5, 4); sph(b, 0.015, M('ink'), s * 0.05, 0.11, 0.16, [1, 1, 0.5], 4, 3); box(b, 0.04, 0.03, 0.18, M('green2'), s * 0.12, -0.06, -0.1, [0.3, s * 0.3, 0]); } }
  if (kind === 'mouse') { sph(b, 0.1, M('grey0'), 0, 0, 0, [0.8, 0.8, 1.4], 8, 6); cone(b, 0.06, 0.14, M('rose'), 0, 0, 0.18, [Math.PI / 2, 0, 0], 5); for (const s of [-1, 1]) { sph(b, 0.04, M('rose'), s * 0.05, 0.08, 0.1, [1, 1, 0.4], 5, 4); sph(b, 0.012, M('ink'), s * 0.03, 0.03, 0.15, [1, 1, 1], 4, 3); } box(b, 0.012, 0.012, 0.22, M('rose'), 0, -0.04, -0.28, [0.2, 0, 0]); }
  if (kind === 'eel') { for (let i = 0; i < 6; i++) sph(b, 0.07 - i * 0.008, M(i % 2 ? 'steel1' : 'steel2'), 0, 0, -i * 0.1 + 0.2, [1, 1, 1.2], 6, 5); sph(b, 0.015, M('white'), 0.04, 0.03, 0.26, [1, 1, 1], 4, 3); }
  root.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  return { root, body: b, kind };
}
/** The small dragon of the dream: a winged serpent with a horned head, jaws, dorsal spikes, front claws, bat wings and a spade tail. Parts are placed in world space by update(). */
export function makeDragon(S = 1.25) {
  const root = new THREE.Group(), N = 18, segs = [], spikes = [];
  const body = [M('red', { emit: 0.25 }), M('wine', { emit: 0.25 })], belly = M('lamp2', { emit: 0.4 }), bone = M('cream', { emit: 0.3 });
  for (let i = 0; i < N; i++) { const r = (i < 3 ? 0.14 + 0.02 * i : 0.2 - 0.012 * (i - 3)) * S; const s = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.05 * S, r), 8, 6), body[i % 2]); root.add(s); segs.push(s);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.05 * S, (0.2 - i * 0.008) * S, 4), M('gold', { emit: 0.5 })); root.add(sp); spikes.push(sp); }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1 * S, 0.3 * S, 4), M('gold', { emit: 0.5 })); root.add(tail);
  // head: skull, snout, open lower jaw, teeth, horns, eyes
  const head = new THREE.Group(); root.add(head);
  const sk = (w, h, d, x, y, z, m, rot) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w * S, h * S, d * S), m); q.position.set(x * S, y * S, z * S); if (rot) q.rotation.set(...rot); head.add(q); return q; };
  { const sh = new THREE.Mesh(new THREE.SphereGeometry(0.17 * S, 10, 8), body[0]); sh.scale.set(1.0, 0.85, 1.2); head.add(sh); const sn = new THREE.Mesh(new THREE.ConeGeometry(0.11 * S, 0.36 * S, 6), body[0]); sn.rotation.x = Math.PI / 2; sn.position.set(0, -0.02 * S, 0.3 * S); sn.scale.set(1.1, 1, 0.75); head.add(sn); const nr = new THREE.Mesh(new THREE.SphereGeometry(0.035 * S, 5, 4), M('gold', { emit: 0.6 })); nr.position.set(0, 0.03 * S, 0.45 * S); head.add(nr); } const jaw = sk(0.14, 0.05, 0.32, 0, -0.13, 0.22, body[1], [0.3, 0, 0]);
  for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.014 * S, 0.06 * S, 4), M('white')); t.position.set(s * 0.06 * S, -0.1 * S, (0.2 + k * 0.07) * S); t.rotation.x = Math.PI; head.add(t); }
    const hn = new THREE.Mesh(new THREE.ConeGeometry(0.04 * S, 0.3 * S, 5), bone); hn.position.set(s * 0.1 * S, 0.14 * S, -0.1 * S); hn.rotation.x = -1.1; hn.rotation.z = -s * 0.3; head.add(hn);
    const ey = new THREE.Mesh(new THREE.SphereGeometry(0.035 * S, 6, 5), new THREE.MeshBasicMaterial({ color: P.yellow })); ey.position.set(s * 0.12 * S, 0.05 * S, 0.1 * S); head.add(ey); }
  // legs: two short front legs with claws
  const legs = [-1, 1].map((s) => { const g = new THREE.Group(); root.add(g); const u = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * S, 0.03 * S, 0.22 * S, 5), body[1]); u.position.y = -0.11 * S; g.add(u); for (let k = -1; k <= 1; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.012 * S, 0.08 * S, 4), bone); c.position.set(k * 0.03 * S, -0.26 * S, 0.02 * S); c.rotation.x = 0.4; g.add(c); } return { g, s }; });
  // wings: three finger bones and a membrane, built flat along +x for the right wing
  const wingMat = new THREE.MeshStandardMaterial({ color: P.wine, emissive: P.wine, emissiveIntensity: 0.35, side: THREE.DoubleSide, roughness: 1 });
  const wings = [-1, 1].map((s) => { const g = new THREE.Group(), w = new THREE.Group(); root.add(g); g.add(w);
    const tips = [[1.2, 0.2, -0.1], [1.0, 0.1, -0.55], [0.55, 0.05, -0.8]].map(([x, y, z]) => new THREE.Vector3(x * s * S, y * S, z * S));
    tips.forEach((tp) => { const len = tp.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(0.014 * S, 0.02 * S, len, 4), bone); m.position.copy(tp).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), tp.clone().normalize()); w.add(m); });
    const pos = [0, 0, 0, ...tips[0].toArray(), ...tips[1].toArray(), 0, 0, 0, ...tips[1].toArray(), ...tips[2].toArray(), 0, 0, 0, ...tips[2].toArray(), 0, 0, -0.5 * S];
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals(); w.add(new THREE.Mesh(geo, wingMat));
    return { g, w, s }; });
  return { root, segs, spikes, tail, head, jaw, legs, wings, N, S };
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
/** The UFOs: J3 (wide saucer with a ring of windows and landing pods), A1 (flat lens with a small dome) and L6 (a white sphere with a bite taken out). */
export function makeUfo(kind) {
  const root = new THREE.Group(), lights = [];
  if (kind === 'A1') {
    sph(root, 1.7, M('steel0'), 0, 0, 0, [1, 0.12, 1], 24, 10); sph(root, 0.5, M('ice', { emit: 0.35 }), 0, 0.12, 0, [1, 0.6, 1], 14, 8); cyl(root, 1.7, 1.7, 0.03, M('steel1'), 0, 0.0, 0, null, 28);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, l = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffffff })); l.position.set(Math.cos(a) * 1.2, -0.1, Math.sin(a) * 1.2); root.add(l); lights.push(l); }
  } else if (kind === 'J3') {
    cyl(root, 1.55, 1.0, 0.28, M('steel1'), 0, -0.05, 0, null, 28); cyl(root, 1.0, 1.55, 0.22, M('steel0'), 0, 0.2, 0, null, 28); cyl(root, 0.82, 1.0, 0.18, M('steel2'), 0, 0.42, 0, null, 24); sph(root, 0.62, M('steel0'), 0, 0.5, 0, [1, 0.7, 1], 14, 8); sph(root, 0.12, M('steel1'), 0, 1.0, 0, [1, 1, 1], 6, 5);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, l = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff })); l.position.set(Math.cos(a) * 0.9, 0.46, Math.sin(a) * 0.9); l.rotation.y = -a + Math.PI / 2; root.add(l); lights.push(l); }
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; sph(root, 0.14, M('steel2'), Math.cos(a) * 0.75, -0.32, Math.sin(a) * 0.75, [1, 1, 1], 8, 6); cyl(root, 0.03, 0.03, 0.16, M('steel1'), Math.cos(a) * 0.75, -0.2, Math.sin(a) * 0.75, null, 5); }
  } else {                                                                                        // L6
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 16), M('white', { emit: 0.25 })); body.castShadow = false; root.add(body);
    const bite = new THREE.Mesh(new THREE.CylinderGeometry(0.97, 0.97, 2.1, 20, 1, false, -0.55, 1.1), M('night0', { side: THREE.DoubleSide })); bite.rotation.set(0.0, 0, Math.PI / 2); bite.rotation.y = 0; root.add(bite); bite.scale.set(0.9, 1, 0.9);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); core.position.set(0.55, 0, 0); root.add(core); lights.push(core);
  }
  root.traverse((o) => { if (o.isMesh) o.castShadow = false; });
  return { root, lights, kind };
}
