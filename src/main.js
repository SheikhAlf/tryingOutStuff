import * as THREE from 'three';
import { SceneNode } from 'three/webgpu';

import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1,  1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const canvas = renderer.domElement;
document.body.appendChild(canvas);

const controls = new PointerLockControls(camera, canvas);
canvas.addEventListener('click', () => {
  controls.lock();
});

controls.movementSpeed = 5;
controls.lookSpeed = 0.1;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

