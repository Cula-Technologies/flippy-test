import Scene from "../src/Scene.js";
import { Text } from "../src/Text.js";

const schema = {
  title: "Text",
  sceneId: "text",
  description: "A text widget.",
  props: {
    text: {
      type: "string",
      description: "The text to display. Can be multiline.",
    },
  },
};

const world = function (props = {}) {
  const scene = new Scene();

  scene.once("loaded", async () => {
    const text = props.text || "CULA <3\nFlippy";

    scene.add(new Text(text, { useLargeFont: false }));
  });

  return scene;
};

export { world as scene, schema };
