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
  let material;

  const clock = new THREE.Clock();

  scene.once("loaded", async () => {
    var canvas = createCanvas(320, 160);
    var ctx = canvas.getContext("2d");

    var image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    };
    image.src = mapData;

    const texture = new THREE.CanvasTexture(
      canvas,
      undefined,
      undefined,
      undefined,
      THREE.NearestFilter,
      THREE.NearestFilter
    );

    material = new THREE.MeshStandardMaterial({
      map: texture,
      colorWrite: true,
      onBeforeCompile: (shader) => {
        // Store shader reference
        material.userData.shader = shader;

        // Add uniforms for circle
        shader.uniforms.circlePosition = { value: new THREE.Vector2(x, y) };
        shader.uniforms.circleRadius = { value: 0.2 };
        shader.uniforms.ringWidth = { value: 0.05 };
        shader.uniforms.circleScale = { value: 1.0 };

        // Add uniform declarations to shader
        shader.fragmentShader = shader.fragmentShader.replace(
          "void main() {",
          `
          uniform vec2 circlePosition;
          uniform float circleRadius;
          uniform float ringWidth;
          uniform float circleScale;
          void main() {
          `
        );

        // Replace map fragment with our custom logic
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `
          #include <map_fragment>
          
          vec2 worldPos = vec2(
            vMapUv.x * 3.0 - 1.5,
            vMapUv.y * 1.5 - 0.75
          );
          
          float dist = distance(worldPos, circlePosition);
          
          // Create inner and outer edge of ring
          float outerEdge = smoothstep(circleRadius * circleScale, (circleRadius * circleScale) + 0.01, dist);
          float innerEdge = smoothstep((circleRadius - ringWidth) * circleScale, ((circleRadius - ringWidth) * circleScale) + 0.01, dist);
          
          // Combine edges to create ring
          float ring = innerEdge * (1.0 - outerEdge);
          
          // Invert colors only in the ring area
          diffuseColor.rgb = mix(1.0 - diffuseColor.rgb, diffuseColor.rgb, 1.0 - ring);
          `
        );
      },
    });

    const planeGeometry = new THREE.PlaneGeometry(3, 1.5, 1, 1);
    map = new THREE.Mesh(planeGeometry, material);
    scene.add(map);

    // Store circle position
    const lat = 52.3906;
    const long = 13.0645;
    const x = (long / 180) * 1.5;
    const y = (lat / 90) * 0.75;
  });

  scene.useLoop(() => {
    const time = clock.getElapsedTime();
    const scale = (Math.sin(time * 3) + 1) * 0.5;
    // Update the circle scale in the shader instead
    if (material.userData.shader) {
      material.userData.shader.uniforms.circleScale.value = 1 + scale;
      material.userData.shader.uniforms.ringWidth.value = 0.05 / (scale + 0.5);
    }
  }, 15);

  return scene;
};

export { world as scene, schema };
