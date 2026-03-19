import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const playerStart = {
  x: 0,
  y: 200,
  z: 0
};

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(playerStart.x, playerStart.y, playerStart.z);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gameCanvas")
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));

const loader = new GLTFLoader();
const terrainMeshes = [];

loader.load("/Phasmophobia/models/terrain.glb", (gltf) => {
  const model = gltf.scene;

  model.scale.set(75, 75, 75);
  model.position.set(0, 0, 0);

  scene.add(model);

  model.traverse((child) => {
    if (child.isMesh) {
      terrainMeshes.push(child);
    }
  });
});

const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener("click", () => controls.lock());

const move = { forward: 0, backward: 0, left: 0, right: 0 };
let isSprinting = false;

const walkSpeed = 0.5;
const sprintSpeed = 1;
let currentSpeed = 0;

let velocityY = 0;
const gravity = -0.05;
const maxFallSpeed = -10;
const playerHeight = 1.6;

const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);

function setPlayerPosition(x, y, z) {
  camera.position.set(x, y, z);
  velocityY = 0;
}
// =============================

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyW") move.forward = 1;
  if (e.code === "KeyS") move.backward = 1;
  if (e.code === "KeyA") move.left = 1;
  if (e.code === "KeyD") move.right = 1;

  if (e.code === "ShiftLeft") isSprinting = true;

  // BONUS: druk op R om te resetten
  if (e.code === "KeyR") {
    setPlayerPosition(playerStart.x, playerStart.y, playerStart.z);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyW") move.forward = 0;
  if (e.code === "KeyS") move.backward = 0;
  if (e.code === "KeyA") move.left = 0;
  if (e.code === "KeyD") move.right = 0;

  if (e.code === "ShiftLeft") isSprinting = false;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    const dir = new THREE.Vector3();
    controls.getDirection(dir);

    dir.y = 0;
    dir.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

    const targetSpeed = isSprinting ? sprintSpeed : walkSpeed;
    currentSpeed += (targetSpeed - currentSpeed) * 0.1;

    if (move.forward) camera.position.add(dir.clone().multiplyScalar(currentSpeed));
    if (move.backward) camera.position.add(dir.clone().multiplyScalar(-currentSpeed));
    if (move.left) camera.position.add(right.clone().multiplyScalar(currentSpeed));
    if (move.right) camera.position.add(right.clone().multiplyScalar(-currentSpeed));

    // Zwaartekracht
    velocityY += gravity;
    if (velocityY < maxFallSpeed) velocityY = maxFallSpeed;

    camera.position.y += velocityY;

    // Ground detectie
    raycaster.set(camera.position, down);
    const intersects = raycaster.intersectObjects(terrainMeshes, true);

    if (intersects.length > 0) {
      const groundY = intersects[0].point.y + playerHeight + 30;

      if (camera.position.y <= groundY) {
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          groundY,
          0.2
        );

        velocityY *= 0.3;

        if (Math.abs(velocityY) < 0.01) {
          velocityY = 0;
          camera.position.y = groundY;
        }
      }
    }
  }

  renderer.render(scene, camera);
}

animate();