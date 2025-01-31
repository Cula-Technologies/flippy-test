import Scene from "../src/Scene.js";
import * as THREE from "three";
import { Bubble } from "../src/Bubble.js";
import { Fish } from "../src/Fish.js";

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

  const bubbles = [];
  const scene = new Scene();
  const fish = new Fish();

  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }

  scene.once("loaded", async () => {
    for (let i = 0; i < bubbles.length; i++) {
      scene.add(bubbles[i]);
    }
    scene.add(fish);
  });

  scene.useLoop(function (delta) {
    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].tick();
    }

    fish.tick();
  }, 15);

  return scene;
};

export { aquarium as scene, schema };
