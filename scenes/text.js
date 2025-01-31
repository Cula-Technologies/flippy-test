import Scene from "../src/Scene.js";
import { Text } from "../src/Text.js";

const schema = {
  title: "Text",
  description: "A text widget.",
};

const world = function () {
  const scene = new Scene();

  scene.once("loaded", async () => {
    const text = "Cula\nis cula\nthan cool.";

    scene.add(new Text(text));
  });

  return scene;
};

export { world as scene, schema };
