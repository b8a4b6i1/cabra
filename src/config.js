export const LOOP = 90;
export const X0 = -8, X1 = 8, CX = 0;
export const SLAB = { w: X1 - X0, d: 13, h: 0.8 };
export const HX = SLAB.w / 2, HZ = SLAB.d / 2, WALL_H = 6;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
export const win = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
export const bell = (t, a, b, c, d) => smooth((t - a) / (b - a)) * (1 - smooth((t - c) / (d - c)));
export const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const TAU = Math.PI * 2;
/** One 90 s loop: the Culto de la Cabra, Perugia, late 13th century. Francisco and his four friends read the Edictum, put on animal masks, open the pen and dance;
 *  lights and metal discs come down from the sky carrying creatures in spheres of water; the animals rise in the Arrebatamiento and come back at dawn. */
export const T = {
  mask0: 10, mask1: 13,           // the masks go on
  dance0: 19, dance1: 78,         // the circle around the fire
  gate: 27,                       // Francisco opens the pen
  free0: 28, free1: 36,           // the animals walk out
  sky0: 36, land: 48,             // lights and discs come down
  vision0: 54, vision1: 66,       // the small dragon
  rise0: 66, rise1: 76,           // the Arrebatamiento
  down0: 76, down1: 84,           // everything comes back
  pen0: 82, pen1: 88,             // the animals go home
};
