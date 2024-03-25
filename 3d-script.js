import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

import {
  BloomEffect,
  FXAAEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

const CUBES_PER_SIDE = 3;

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
  let shape = new THREE.Shape();
  let eps = 0.00001;
  let radius = radius0 - eps;
  shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
  shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
  shape.absarc(
    width - radius * 2,
    height - radius * 2,
    eps,
    Math.PI / 2,
    0,
    true
  );
  shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
  let geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness,
  });

  geometry.center();

  return geometry;
}

function makeCubes() {
  const material = new THREE.MeshStandardMaterial({
    color: 0x000000,
    metalness: 1,
    roughness: 0.01,
  });
  const numCubes = CUBES_PER_SIDE;
  // Create the group, we will add layers to the group
  const cubes = new THREE.Object3D();
  // iterate over all dimensions
  const offset = (numCubes - 1) / 2;
  for (let i = 0; i < numCubes; i++) {
    // create the layer
    const layer = new THREE.Object3D();
    for (let j = 0; j < numCubes; j++) {
      for (let k = 0; k < numCubes; k++) {
        const geom = createBoxWithRoundedEdges(1.2, 1.2, 1.3, 0.2, 20);
        const x = (i - offset) * 1.2;
        const y = (j - offset) * 1.2;
        const z = (k - offset) * 1.2;
        geom.translate(x, y, z);
        const cube = new THREE.Mesh(geom, material);
        layer.add(cube);
      }
    }
    cubes.add(layer);
  }
  const innerWrapper = new THREE.Object3D();
  innerWrapper.add(cubes);
  const outerWrapper = new THREE.Object3D();
  outerWrapper.add(innerWrapper);
  return outerWrapper;
}

function tRotate(cube, delay) {
  // rotate the wrapped cube 90 deg along y/z axis
  if (Math.random() > 0.5) {
    cube.rotateY(Math.PI / 2);
  } else {
    cube.rotateZ(Math.PI / 2);
  }
  // pick a random layer to rotate
  const sideIndex = Math.floor(Math.random() * CUBES_PER_SIDE);
  const side = cube.children[sideIndex];

  // pick a random direction to rotate
  const angles = {
    x: Math.random() > 0.5 ? -Math.PI : Math.PI,
    y: 0,
    z: 0,
  };

  // pick a random time to wait between rotations
  const pause = Math.random() * 1000;

  new TWEEN.Tween(side.rotation)
    .delay(pause)
    .to(
      {
        x: side.rotation._x + angles.x,
        y: side.rotation._y + angles.y,
        z: side.rotation._z + angles.z,
      },
      delay
    )
    .onComplete(function () {
      setTimeout(tRotate, pause, cube, delay);
    })
    .start();
}

function constructScene() {
  // Create the scene
  const scene = new THREE.Scene();

  // Create the light
  RectAreaLightUniformsLib.init();
  const rectLight1 = new THREE.RectAreaLight(0xffffff, 100, 20, 20);
  rectLight1.position.set(10, 15, 0);
  rectLight1.rotation.x = Math.PI * 1.5;
  rectLight1.rotation.y = Math.PI / 4;
  scene.add(rectLight1);

  const rectLight2 = new THREE.RectAreaLight(0xffffff, 5, 20, 20);
  rectLight2.position.set(0, -20, 0);
  rectLight2.rotation.x = Math.PI / 2;
  scene.add(rectLight2);

  scene.add(new RectAreaLightHelper(rectLight1));
  scene.add(new RectAreaLightHelper(rectLight2));

  // Create a cube
  const cube = makeCubes();
  scene.add(cube);
  return { scene, cube };
}

function addControls() {
  addEventListener("mousedown", () => {
    isDragging = true;
  });
  addEventListener("mousemove", (e) => {
    // get how much the mouse has moved
    let deltaMove = {
      x: e.offsetX - previousMousePosition.x,
      y: e.offsetY - previousMousePosition.y,
    };

    if (isDragging) {
      // prepare the rotation
      let deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          toRadians(deltaMove.y * 1),
          toRadians(deltaMove.x * 1),
          0,
          "XYZ"
        )
      );
      // actually rotate the cube (the outer wrapper)
      cube.quaternion.multiplyQuaternions(
        deltaRotationQuaternion,
        cube.quaternion
      );
    }
    // store the prev position
    previousMousePosition = {
      x: e.offsetX,
      y: e.offsetY,
    };
  });

  addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function addCamera() {
  // Create the camera
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  // Position the camera
  camera.position.z = 6;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;
}

function addRendering() {
  // Create the renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: false,
  });

  renderer.autoClear = false;

  const container = document.getElementById("canvasContainer");
  container.appendChild(renderer.domElement);

  const bloomOptions = {
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.7,
    intensity: 0.8,
    radius: 0.1,
  };
  const bloomPass = new BloomEffect(bloomOptions);
  const FXAAPass = new FXAAEffect();

  var composer = new EffectComposer(renderer);
  if (window.innerWidth <= 768) {
    // For mobile devices
    composer.setSize(200, 200);
  } else {
    // For desktop
    composer.setSize(600, 600);
  }
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, FXAAPass, bloomPass));
  return composer;
}

function update() {
  setTimeout(function () {
    let currTime = new Date().getTime() / 1000;
    let dt = currTime - (lastFrameTime || currTime);
    totalGameTime += dt;
    update(dt, totalGameTime);
    lastFrameTime = currTime;
  }, 0);
}

// Controls
let isDragging = false;
let previousMousePosition = {
  x: 0,
  y: 0,
};

let lastFrameTime = new Date().getTime() / 1000;
let totalGameTime = 0;

const { scene, cube } = constructScene();
const camera = addCamera();
const composer = addRendering();

// cube.children[0] = the outer wrapper;
// cube.children[0].children[0] = the inner wrapper;
// cube.children[0].children[0].children[0] one side of the actual cube
tRotate(cube.children[0].children[0], 2000);

requestAnimationFrame(function render() {
  requestAnimationFrame(render);
  cube.children[0].rotation.x += 0.005;
  cube.children[0].rotation.y += 0.005;
  cube.children[0].rotation.z += 0.005;
  TWEEN.update();
  composer.render();
});
addControls();
update();
