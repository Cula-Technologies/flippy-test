import Scene from "../src/Scene.js";
import { Bubble } from "../src/Bubble.js";
import { Fish } from "../src/Fish.js";
import { Shark } from "../src/Shark.js";

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

const SHARK_ATTACK_INTERVAL = 300;
const aquarium = function (props = {}) {
  let { bubbleCount = 5 } = props;

  const scene = new Scene();

  const fishes = [];
  const bubbles = [];

  for (let i = 0; i < 3; i++) {
    const fish = new Fish(0.15 + i * 0.03);
    fishes.push(fish);
  }

  for (let i = 0; i < bubbleCount; i++) {
    bubbles.push(new Bubble());
  }

  scene.once("loaded", async () => {
    scene.add(shark);

    for (let i = 0; i < bubbles.length; i++) {
      scene.add(bubbles[i]);
    }
    fishes.forEach((fish) => scene.add(fish));
  });

  const shark = new Shark(0.3);

  let sharkAttack = false;
  scene.useLoop(function (delta) {
    const initiateAttack = delta > 10 && delta % SHARK_ATTACK_INTERVAL === 0;

    if (initiateAttack && sharkAttack === false) {
      sharkAttack = true;
    }

    if (shark.position.x > 4) {
      shark.resetSharkPosition();
      sharkAttack = false;
    }

    shark.tick(sharkAttack);
    fishes.forEach((fish) => fish.tick(sharkAttack));
    bubbles.forEach((bubble) => bubble.tick());
  }, 15);

  return scene;
};

export { aquarium as scene, schema };
