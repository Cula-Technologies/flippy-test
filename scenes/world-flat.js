import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";
import { mapData } from "../resources/textures/map.js";

const schema = {
  title: "Flat World",
  description: "A flat world widget.",
};

const world = function () {
  const scene = new Scene();
  let map;

  scene.once("loaded", async () => {
    const ambientLight = new THREE.AmbientLight("#ffffff", 3);
    scene.add(ambientLight);

    var canvas = createCanvas(320, 160);
    var ctx = canvas.getContext("2d");

    var image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    };
    image.src = mapData;

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      colorWrite: true,
      onBeforeCompile: (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `
          #include <map_fragment>
          diffuseColor.rgb = 1.0 - diffuseColor.rgb;
          `
        );
      },
    });

    const planeGeometry = new THREE.PlaneGeometry(3, 1.5, 1, 1);
    map = new THREE.Mesh(planeGeometry, material);
    scene.add(map);
  });

  return scene;
};

export { world as scene, schema };
