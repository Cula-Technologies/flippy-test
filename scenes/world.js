import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";
import { mapData } from "../resources/textures/map.js";

const schema = {
  title: "World",
  sceneId: "world",
  description: "A simple world widget.",
};

const world = function () {
  const scene = new Scene();
  let globe;

  const clock = new THREE.Clock();

  scene.once("loaded", async () => {
    const ambientLight = new THREE.AmbientLight("#ffffff", 3);
    scene.add(ambientLight);

    var canvas = createCanvas(512, 256);
    var ctx = canvas.getContext("2d");

    var image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    };
    image.src = mapData;

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
    });

    const sphereGeometry = new THREE.SphereGeometry(1, 128, 128);
    globe = new THREE.Mesh(sphereGeometry, material);
    globe.position.z = -1;
    scene.add(globe);
  });

  scene.useLoop(() => {
    const delta = clock.getDelta();
    globe.rotation.y += delta * 0.4;
  }, 60);

  return scene;
};

export { world as scene, schema };
