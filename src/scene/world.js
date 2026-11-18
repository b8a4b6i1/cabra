import * as THREE from 'three';
import { M, box, cyl, sph, cone, canvasTex } from './common.js';
import { P } from '../palette.js';
import { SLAB, X0, X1, TAU, hash } from '../config.js';

export const FC = { x: 0.6, z: 0.4 };          // the fire
export const RING = 2.5;                       // radius of the dance
export const PEN = { x0: -6.9, x1: -3.5, z0: 1.3, z1: 4.1 };

/** An Umbrian hilltop at night: a clearing with a ritual circle of stones, a fire, a stele with the Edictum, a ruined chapel, olive trees and a pen. */
export function buildWorld(scene) {
  const world = new THREE.Group(); scene.add(world); const parts = { rects: [], flames: [] };
  const R = (x0, x1, z0, z1) => parts.rects.push({ x0, x1, z0, z1 }); parts.animalRects = []; const RA = (x0, x1, z0, z1) => { R(x0, x1, z0, z1); parts.animalRects.push(parts.rects[parts.rects.length - 1]); };
  const HZ = SLAB.d / 2;
  // ---- the slab: earth sides, a dark grass top and a trodden clearing
  box(world, SLAB.w, 0.4, SLAB.d, M('earth'), 0, -0.6, 0).castShadow = false; box(world, SLAB.w, 0.25, SLAB.d, M('wood3'), 0, -0.275, 0).castShadow = false; box(world, SLAB.w, 0.1, SLAB.d, M('green2'), 0, -0.05, 0).castShadow = false;
  { const c = cyl(world, 5.3, 5.5, 0.04, M('sand'), FC.x, 0.0, FC.z, null, 36); c.castShadow = false; const c2 = cyl(world, 3.0, 3.1, 0.05, M('earth'), FC.x, 0.01, FC.z, null, 36); c2.castShadow = false; }
  { const g = new THREE.CylinderGeometry(1, 1, 1, 6), tufts = []; for (let i = 0; i < 70; i++) { const a = hash(i * 3.3) * TAU, r = 5.6 + hash(i * 7.1) * 6.0, x = Math.cos(a) * r * 1.2, z = Math.sin(a) * r * 0.8; if (Math.abs(x) > X1 - 0.5 || Math.abs(z) > HZ - 0.4) continue; tufts.push([x, z, 0.14 + hash(i) * 0.2]); }
    const m = new THREE.InstancedMesh(new THREE.ConeGeometry(0.08, 1, 4), new THREE.MeshStandardMaterial({ color: P.leaf, roughness: 1 }), tufts.length), d = new THREE.Object3D(); tufts.forEach(([x, z, h], i) => { d.position.set(x, h / 2, z); d.scale.set(1, h, 1); d.rotation.set(0, i, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }); world.add(m); }
  for (const [x, z, s] of [[2, -5.2, 2.4], [-3, -5.6, 2.0], [6, -3, 1.6]]) { const h = sph(world, s, M('leaf'), x, -0.3, z, [1.3, 0.4, 1], 12, 8); h.castShadow = false; }
  // ---- the ritual circle: standing stones
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3, x = FC.x + Math.cos(a) * 3.5, z = FC.z + Math.sin(a) * 3.5; if (x < -6.2 && z > 0.8) continue; const h = 0.7 + 0.35 * hash(i * 3), s = box(world, 0.34, h, 0.24, M(i % 2 ? 'stone1' : 'stone2'), x, h / 2, z, [0.05 * (i % 3 - 1), -a, 0.06 * ((i + 1) % 3 - 1)]); R(x - 0.2, x + 0.2, z - 0.2, z + 0.2); }
  // ---- the fire pit
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; sph(world, 0.17, M(i % 2 ? 'stone1' : 'stone2'), FC.x + Math.cos(a) * 0.58, 0.1, FC.z + Math.sin(a) * 0.58, [1.1, 0.8, 1], 6, 5); }
  cyl(world, 0.5, 0.5, 0.04, M('ink'), FC.x, 0.02, FC.z, null, 12);
  for (let i = 0; i < 4; i++) box(world, 0.7, 0.09, 0.09, M('wood4'), FC.x, 0.12 + 0.08 * (i % 2), FC.z, [0, i * 0.8, 0.1]);
  RA(FC.x - 0.55, FC.x + 0.55, FC.z - 0.55, FC.z + 0.55);
  const flames = [[0, 0, 0.9, 'fire'], [0.18, 0.1, 0.65, 'lamp2'], [-0.15, 0.12, 0.7, 'orange'], [0.05, -0.18, 0.6, 'red'], [-0.1, -0.1, 0.5, 'lamp'], [0.2, -0.1, 0.5, 'yellow'], [0, 0.05, 1.1, 'lamp2']];
  parts.flames = flames.map(([x, z, h, c], i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1, 5), new THREE.MeshBasicMaterial({ color: P[c], transparent: true, opacity: 0.92 })); m.position.set(FC.x + x, 0.2, FC.z + z); world.add(m); return { m, h, x, z, ph: i * 1.3 }; });
  parts.firePos = new THREE.Vector3(FC.x, 0.8, FC.z);
  // ---- the stele with the Edictum
  { const sx = -1.9, sz = -2.0, yaw = Math.atan2(FC.x - sx, FC.z - sz); const g = new THREE.Group(); g.position.set(sx, 0, sz); g.rotation.y = yaw; world.add(g);
    box(g, 1.1, 0.25, 0.5, M('stone2'), 0, 0.12, 0); box(g, 0.95, 1.7, 0.22, M('stone1'), 0, 1.1, 0); box(g, 0.8, 0.1, 0.2, M('stone0'), 0, 2.0, 0, [0, 0, 0.05]);
    const tex = canvasTex(96, 130, (c, w, h) => { c.fillStyle = P.stone0; c.fillRect(0, 0, w, h); c.strokeStyle = P.stone2; c.lineWidth = 2; c.strokeRect(2, 2, w - 4, h - 4); c.fillStyle = P.wood5; c.font = 'bold 9px "Courier New", monospace'; c.textAlign = 'center'; c.fillText('EDICTUM', w / 2, 16); c.fillText('CETERA ANIMALITAS', w / 2, 27);
      ['I', 'II', 'III', 'IV', 'V'].forEach((n, i) => { const y = 42 + i * 17; c.textAlign = 'left'; c.fillText(n, 8, y + 6); c.fillRect(30, y, 58, 2); c.fillRect(30, y + 6, 40 + (i * 7) % 18, 2); c.fillRect(30, y + 11, 22 + (i * 11) % 30, 2); }); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.6), new THREE.MeshBasicMaterial({ map: tex, color: 0xd8d0c0 })); pl.position.set(0, 1.1, 0.115); g.add(pl); parts.stele = { x: sx, z: sz, yaw, glow: pl }; R(sx - 0.6, sx + 0.6, sz - 0.4, sz + 0.4); }
  // ---- the ruined chapel at the back
  { const hx = -5.4, hz = -4.3, g = new THREE.Group(); g.position.set(hx, 0, hz); world.add(g); const wall = (w, h, d, x, y, z, c = 'stone1') => box(g, w, h, d, M(c), x, y, z);
    wall(3.2, 2.2, 0.35, 0, 1.1, -1.2); wall(0.35, 2.0, 2.4, -1.6, 1.0, 0); wall(0.35, 1.2, 2.4, 1.6, 0.6, 0); wall(1.0, 1.7, 0.35, -1.1, 0.85, 1.2); wall(1.0, 0.9, 0.35, 1.1, 0.45, 1.2);
    for (let i = 0; i < 12; i++) box(g, 0.28, 0.16, 0.38, M(i % 3 ? 'stone2' : 'stone0'), -1.6 + (i % 6) * 0.64, 2.25 + (i % 2) * 0.08, -1.2, [0, 0, 0.1 * (i % 3 - 1)]);
    box(g, 0.2, 1.7, 0.4, M('stone0'), -0.35, 0.85, 1.2); box(g, 0.2, 1.7, 0.4, M('stone0'), 0.35, 0.85, 1.2); box(g, 0.95, 0.22, 0.4, M('stone0'), 0, 1.8, 1.2);
    box(g, 1.7, 0.1, 1.4, M('tile1'), -0.8, 2.45, -0.5, [0.35, 0, 0]); box(g, 1.2, 0.08, 1.0, M('tile0'), 0.1, 2.0, -0.6, [0.4, 0, 0.1]);
    cyl(g, 0.12, 0.12, 0.3, M('wood4'), 0, 0.15, -0.5, null, 6);
    R(hx - 1.9, hx + 1.9, hz - 1.5, hz - 0.9); R(hx - 1.9, hx - 1.3, hz - 1.5, hz + 1.5); R(hx + 1.3, hx + 1.9, hz - 1.5, hz + 1.5); R(hx - 1.7, hx - 0.4, hz + 0.95, hz + 1.5); R(hx + 0.4, hx + 1.7, hz + 0.95, hz + 1.5); }
  // ---- trees: olives (silvery, twisted) and cypresses
  const olive = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); world.add(g); cyl(g, 0.16, 0.24, 1.1, M('wood4'), 0, 0.55, 0, [0.08, 0, 0.1], 7); cyl(g, 0.11, 0.15, 0.9, M('wood3'), 0.25, 1.35, 0.05, [0, 0, -0.5], 6); cyl(g, 0.1, 0.14, 0.8, M('wood3'), -0.22, 1.3, -0.05, [0, 0, 0.55], 6);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; sph(g, 0.55 + 0.1 * (i % 2), M(i % 2 ? 'hairG' : 'leaf'), Math.cos(a) * 0.65, 1.95 + 0.12 * (i % 3), Math.sin(a) * 0.55, [1.2, 0.6, 1.1], 8, 6); } sph(g, 0.7, M('hairG'), 0, 2.15, 0, [1.3, 0.6, 1.2], 8, 6); R(x - 0.3, x + 0.3, z - 0.3, z + 0.3); };
  olive(-7.0, -1.2, 1.1); olive(5.8, -4.4, 1.2); olive(6.9, 3.0, 1.0); olive(-1.4, -5.5, 1.0); olive(3.4, -5.6, 0.9); olive(-7.2, 5.4, 0.9);
  const cypress = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); world.add(g); cyl(g, 0.1, 0.14, 0.5, M('wood4'), 0, 0.25, 0, null, 6); cone(g, 0.55, 3.2, M('green2'), 0, 2.0, 0, null, 8); cone(g, 0.38, 2.2, M('green'), 0.08, 2.5, 0.04, null, 7); R(x - 0.25, x + 0.25, z - 0.25, z + 0.25); };
  cypress(-7.4, -4.8, 1.2); cypress(7.2, -1.0, 1.1); cypress(4.6, 5.3, 1.0); cypress(7.4, -5.2, 1.3);
  // ---- low dry-stone wall at the back right, rocks, hay
  for (let i = 0; i < 12; i++) { const x = 1.2 + i * 0.5, h = 0.35 + 0.1 * hash(i * 2); box(world, 0.52, h, 0.3, M(i % 2 ? 'stone1' : 'stone2'), x, h / 2, -5.6 + 0.03 * Math.sin(i), [0, 0.05 * Math.sin(i * 2), 0]); } R(1.0, 7.2, -5.85, -5.35);
  for (const [x, z, s] of [[3.4, 3.8, 0.4], [-1.2, 4.6, 0.3], [5.2, 1.2, 0.35], [-3.2, -1.6, 0.3], [2.6, -3.1, 0.25], [4.0, -1.8, 0.3]]) sph(world, s, M('stone2'), x, s * 0.4, z, [1.2, 0.7, 1], 6, 5);
  for (const [x, z, r] of [[-6.35, 3.55, 0.1], [-5.55, 3.65, -0.3]]) { box(world, 0.7, 0.4, 0.45, M('mustard'), x, 0.2, z, [0, r, 0]); R(x - 0.4, x + 0.4, z - 0.35, z + 0.35); }
  // ---- the pen: fence, a trough and a gate that swings
  { const { x0, x1, z0, z1 } = PEN, post = (x, z) => box(world, 0.1, 0.95, 0.1, M('wood4'), x, 0.47, z); const rail = (ax, az, bx, bz) => { for (const y of [0.35, 0.7]) { const len = Math.hypot(bx - ax, bz - az); box(world, 0.06, 0.08, len, M('wood2'), (ax + bx) / 2, y, (az + bz) / 2, [0, Math.atan2(bx - ax, bz - az) + 0, 0]); } };
    const gz0 = 1.9, gz1 = 3.3;                   // the gate gap in the east side
    for (let x = x0; x <= x1 + 0.01; x += 0.85) { post(x, z0); post(x, z1); } for (let z = z0; z <= z1 + 0.01; z += 0.85) post(x0, z);
    for (const z of [z0, gz0, gz1, z1]) post(x1, z);
    rail(x0, z0, x1, z0); rail(x0, z1, x1, z1); rail(x0, z0, x0, z1); rail(x1, z0, x1, gz0); rail(x1, gz1, x1, z1);
    RA(x0 - 0.1, x1 + 0.1, z0 - 0.08, z0 + 0.08); RA(x0 - 0.1, x1 + 0.1, z1 - 0.08, z1 + 0.08); RA(x0 - 0.08, x0 + 0.08, z0, z1); RA(x1 - 0.08, x1 + 0.08, z0, gz0); RA(x1 - 0.08, x1 + 0.08, gz1, z1);
    const gate = new THREE.Group(); gate.position.set(x1, 0, gz1); world.add(gate); for (const y of [0.3, 0.55, 0.8]) box(gate, 0.06, 0.08, gz1 - gz0, M('wood1'), 0, y, -(gz1 - gz0) / 2); box(gate, 0.06, 0.6, 0.06, M('wood1'), 0, 0.55, -(gz1 - gz0)); parts.gate = { g: gate, z0: gz0, z1: gz1, x: x1 };
    box(world, 1.0, 0.2, 0.3, M('wood3'), x0 + 0.8, 0.14, z1 - 0.4); const floor = cyl(world, 1.7, 1.7, 0.02, M('earth'), (x0 + x1) / 2, 0.02, (z0 + z1) / 2, null, 20); floor.scale.set(1, 1, 0.85); floor.castShadow = false; }
  return parts;
}
