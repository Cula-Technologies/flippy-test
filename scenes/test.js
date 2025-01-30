import Scene from '../src/Scene.js';
import { Graphics } from '@pixi/node';

const schema = {
  title: 'Test',
  description: 'A bouncing rectangle with 3:4 ratio from top left.',
}

const calendar = function() {
  function drawRectangle(currentWidth) {
    const graphics = new Graphics();
    graphics.beginFill(0xFFFFFF);
    
    // Maintain 3:4 ratio
    const height = currentWidth * (3/4);
    graphics.drawRect(0, 0, currentWidth, height);

    return graphics;
  }

  const scene = new Scene();
  let width = 0;
  let growing = true;

  scene.on('loaded', () => {
    const maxWidth = scene.width;
    const animationSpeed = maxWidth / 30;

    // Use scene's built-in loop functionality
    scene.useLoop(() => {
      scene.pixi.destroyAllChildren();
      
      // Update width based on direction
      if (growing) {
        width = Math.min(width + animationSpeed, maxWidth);
        if (width >= maxWidth) growing = false;
      } else {
        width = Math.max(width - animationSpeed, 0);
        if (width <= 0) growing = true;
      }

      // Draw new rectangle and render
      const rectangle = drawRectangle(width);
      scene.pixi.add(rectangle);
      scene.render();
    }, scene.fps); // Use scene's configured FPS
  });

  return scene;
}

export { calendar as scene, schema };