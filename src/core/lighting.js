import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** A bright laboratory: a soft key light, a white bounce, a cyan glow from the coils and a violet one for the moment the field opens. */
export function createLighting(renderer, scene) {
  const hemi = new THREE.HemisphereLight(0x9fb4e8, 0x2b2a48, 0.78); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xc8d6ff, 0.95); sun.position.set(-10, 20, 12); sun.target.position.set(0, 1, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 14; sc.bottom = -14; sc.near = 4; sc.far = 70; sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03; sc.updateProjectionMatrix();
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0x7f90e0, 0.3); fill.position.set(12, 10, 10); fill.target.position.set(0, 1, 0); scene.add(fill); scene.add(fill.target);
  const fire = new THREE.PointLight(0xffa550, 9, 10, 1.3); fire.position.set(0.6, 1.1, 0.4); scene.add(fire);
  const glow = new THREE.PointLight(0xbfe4ff, 0, 12, 1.2); glow.position.set(0.6, 4.0, 0.4); scene.add(glow);
  const pmrem = new THREE.PMREMGenerator(renderer), envScene = new RoomEnvironment(); scene.environment = pmrem.fromScene(envScene, 0.035).texture; scene.environmentIntensity = 0.2; pmrem.dispose(); envScene.dispose?.();
  return { hemi, sun, fill, fire, glow, lamps: [] };
}
