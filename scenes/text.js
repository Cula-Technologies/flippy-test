import * as THREE from 'three';
import Scene from '../src/Scene.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const schema = {
  title: 'Text',
  description: 'A scene displaying 3D text using a TTF font.',
};

const textScene = function () {
  const scene = new Scene();
  const clock = new THREE.Clock();

  scene.once('loaded', () => {
    const fontLoader = new FontLoader();
    fontLoader.load('resources/fonts/cg-pixel-4x5.ttf', function (font) {
      const textGeometry = new TextGeometry('Hello, Three.js!', {
        font: font,
        size: 1,
        height: 0.2,
      });

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      scene.add(textMesh);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    scene.add(camera);
  });

  scene.useLoop(() => {
    const delta = clock.getDelta();
    // Add any animations or updates here
  }, 60);

  return scene;
};

export { textScene as scene, schema };
