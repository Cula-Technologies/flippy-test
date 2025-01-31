import Scene from "../src/Scene.js";
import * as THREE from "three";
import { Bubble } from "../src/Bubble.js";

const schema = {
  title: "Aquarium",
  sceneId: "aquarium",
  description: "An aquarium widget.",
  props: {
    bubbleCount: {
      type: "number",
      description: "The number of bubbles.",
      default: 5,
      optional: true,
    },
  },
};

const aquarium = function (props = {}) {
  let { bubbleCount = 5 } = props;

  const scene = new Scene();

  const fish = new THREE.Group();
  const bubbles = [];

  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }

  scene.once("loaded", async () => {
    const circle = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    for (let i = 0; i < bubbles.length; i++) {
      scene.add(bubbles[i]);
    }

    const eye = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    eye.position.z = 0.1;
    eye.position.y = 0.4;
    eye.position.x = 0.2;

    const triangle = new THREE.Mesh(
      new THREE.CircleGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    triangle.position.x = -1;
    fish.add(circle);
    fish.add(triangle);
    fish.add(eye);
    fish.scale.set(0.2, 0.2, 0.2);
    scene.add(fish);
  });

  scene.useLoop(function (delta) {
    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].tick();
    }

    fish.position.x = Math.sin(delta / 50);
    fish.position.y = Math.cos(delta / 350) / 2;
    if (Math.cos(delta / 50) > 0) {
      fish.scale.set(0.2, 0.2, 0.2);
    } else {
      fish.scale.set(-0.2, 0.2, 0.2);
    }
  }, 15);

  return scene;
};

export { aquarium as scene, schema };
