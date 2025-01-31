import Scene from "../src/Scene.js";
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

  const scene = new Scene();

  const fishes = [];
  const bubbles = [];

  for (let i = 0; i < 4; i++) {
    const fish = new Fish(0.15 + i * 0.03);
    fishes.push(fish);
  }

  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }

  scene.once("loaded", async () => {
    for (let i = 0; i < bubbles.length; i++) {
      scene.add(bubbles[i]);
    }
    fishes.forEach((fish) => scene.add(fish));
  });

  scene.useLoop(function () {
    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].tick();
    }

    fishes.forEach((fish) => fish.tick());
  }, 15);

  return scene;
};

export { aquarium as scene, schema };
