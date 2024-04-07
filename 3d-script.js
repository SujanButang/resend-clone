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

function createExtrudeGeometry() {
  const width = 1;
  const height = 1;

  let shape = new THREE.Shape();
  let epsilon = 0.000025;
  let radius = 0.01 - epsilon;
  shape.absarc(epsilon, epsilon, epsilon, -Math.PI / 2, -Math.PI, true);
  shape.absarc(
    epsilon,
    height - radius * 2,
    epsilon,
    Math.PI,
    Math.PI / 2,
    true
  );
  shape.absarc(
    width - radius * 2,
    height - radius * 2,
    epsilon,
    Math.PI / 2,
    0,
    true
  );
  shape.absarc(width - radius * 2, epsilon, epsilon, 0, -Math.PI / 2, true);

  const extrudeSettings = {
    stepsilon: 24,
    depth: 0.8,
    bevelThickness: 0.2,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 64,
    curveSegments: 32
  };

  const extrudeGeomentry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  extrudeGeomentry.center();

  return extrudeGeomentry;
}

function makeCubes() {
  const material = new THREE.MeshStandardMaterial({
    // color: 'black',
    // metalness: 1,
    // side: THREE.DoubleSide,
    // roughness: 0.21,  

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
        const geom = createExtrudeGeometry();
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

  // Create the ambient light
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  // Create point lights
  const pointLight1 = new THREE.PointLight(0xffffff, 1);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 1);
  pointLight2.position.set(-5, -5, 5);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffffff, 1);
  pointLight3.position.set(5, -5, -5);
  scene.add(pointLight3);

  const pointLight4 = new THREE.PointLight(0xffffff, 1);
  pointLight4.position.set(-5, 5, -5);
  scene.add(pointLight4);

  let light, light2;

const lights = {
  orbiting: null,
  xAxis: null,
  yAxis: null,
  front: null,
  back: null
};

  const orbitingSpotLight = new THREE.SpotLight("white");
  orbitingSpotLight.intensity = 4400;
  orbitingSpotLight.angle = Math.PI / 4;
  orbitingSpotLight.position.set(2, -2, 12);
  orbitingSpotLight.penumbra = 0.7;
  orbitingSpotLight.decay = 1.1;
  scene.add(orbitingSpotLight);
  lights.orbiting = orbitingSpotLight;

  const spotLightYAxis = new THREE.SpotLight("white");
  spotLightYAxis.intensity = 6500;
  spotLightYAxis.angle = Math.PI / 3;
  spotLightYAxis.position.set(10, 0, -3);
  scene.add(spotLightYAxis);
  lights.yAxis = spotLightYAxis;

  const spotLightXAxis = new THREE.SpotLight("white");
  spotLightXAxis.intensity = 3300;
  spotLightXAxis.angle = Math.PI / 2;
  spotLightXAxis.position.set(0, 10, 0);
  scene.add(spotLightXAxis);
  lights.xAxis = spotLightXAxis;


  const frontIllumination = new THREE.SpotLight("white");
  frontIllumination.intensity = 6300;
  frontIllumination.angle = Math.PI / 4;
  frontIllumination.position.set(2, -1, 12);
  scene.add(frontIllumination);
  lights.front = frontIllumination;

  const backIllumination = new THREE.SpotLight("white");
  backIllumination.intensity = 6300;
  backIllumination.angle = Math.PI / 4;
  backIllumination.position.set(4, 5, -22);
  scene.add(backIllumination);
  lights.back = backIllumination;


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
    antialias: true,
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
  } else if (window.innerWidth <= 768) {
    // For tablet devices
    composer.setSize(300, 300);
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
