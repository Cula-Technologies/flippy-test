import Scene from "../src/Scene.js";
import { Text } from "../src/Text.js";

const schema = {
  title: "Standup",
  sceneId: "standup",
  description: "A scene showing where to go for standup with animated arrows.",
  props: {
    speed: {
      type: "number",
      description: "Speed of the arrow animation",
      default: 0.5
    }
  },
};

const world = function (props = {}) {
  const scene = new Scene();
  const speed = props.speed || schema.props.speed.default;
  let offset = 0;
  let arrowSets = [];

  scene.once("loaded", async () => {
    // Create arrow patterns that are wider than the screen to allow for scrolling
    const arrowPattern = ">>>>>>>>>>>>>>>>>";
    
    // Add top and bottom arrow patterns with large font
    const topArrows = new Text(arrowPattern, { useLargeFont: true });
    const bottomArrows = new Text(arrowPattern, { useLargeFont: true });
    
    // Position arrows at top and bottom
    topArrows.position.y = 0.4;
    bottomArrows.position.y = -1;
    
    scene.add(topArrows);
    scene.add(bottomArrows);
    arrowSets.push(topArrows, bottomArrows);

    // Add the main "STANDUP" text in the center with large font
    const text = new Text("STANDUP", { useLargeFont: true });
    text.position.y = -0.3; // Shift up more to center the composition
    scene.add(text);

    // Create duplicates of arrows for seamless scrolling
    const topArrows2 = new Text(arrowPattern, { useLargeFont: true });
    const bottomArrows2 = new Text(arrowPattern, { useLargeFont: true });
    topArrows2.position.y = 0.4;
    bottomArrows2.position.y = -1;
    scene.add(topArrows2);
    scene.add(bottomArrows2);
    arrowSets.push(topArrows2, bottomArrows2);
  });

  // Animation loop
  scene.useLoop(() => {
    if (arrowSets.length === 0) return;
    
    // Update offset for scrolling effect
    offset = (offset + speed * 0.05) % 2;
    
    // Update positions for seamless scrolling
    arrowSets[0].position.x = offset;
    arrowSets[1].position.x = offset;
    arrowSets[2].position.x = offset - 2;
    arrowSets[3].position.x = offset - 2;
  }, 60);

  return scene;
};

export { world as scene, schema };
