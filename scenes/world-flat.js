import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";
import { mapData } from "../resources/textures/map.js";

const schema = {
  title: "Flat World",
  id: "world-flat",
  description: "A flat world widget.",
};

const world = function () {
  const scene = new Scene();
  let map;
  let material;
  let x;
  let y;

  const clock = new THREE.Clock();

  scene.once("loaded", async () => {
    var canvas = createCanvas(512, 256);
    var ctx = canvas.getContext("2d");

    var image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
    };
    image.src = mapData;

    const texture = new THREE.CanvasTexture(
      canvas,
      undefined,
      THREE.RepeatWrapping,
      THREE.ClampToEdgeWrapping,
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
        shader.uniforms.circleScale = { value: 1.0 };

        // Add uniform declarations to shader
        shader.fragmentShader = shader.fragmentShader.replace(
          "void main() {",
          `
          uniform vec2 circlePosition;
          uniform float circleRadius;
          uniform float circleScale;
          void main() {
          `
        );

        // Replace map fragment with our custom logic
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `
          vec2 uv = (vMapUv - 0.3333333) * 3.0;
          vec4 sampledDiffuseColor = texture2D( map, uv );
          diffuseColor *= sampledDiffuseColor;
          
          vec2 worldPos = vec2(
            uv.x * 3.0 - 1.5,
            uv.y * 1.5 - 0.75
          );
          
          float dist = distance(worldPos, circlePosition);
          
          // Create inner and outer edge of ring
          float outerEdge = smoothstep(circleRadius * circleScale, (circleRadius * circleScale) + 0.01, dist);
          
          
          // Invert colors only in the ring area
          diffuseColor.rgb = mix(1.0 - diffuseColor.rgb, diffuseColor.rgb, 1.0 - outerEdge);
          `
        );
      },
    });

    const planeGeometry = new THREE.PlaneGeometry(9, 4.5, 1, 1);
    map = new THREE.Mesh(planeGeometry, material);
    scene.add(map);

    // Potsdam
    const lat = 52.3906;
    const long = 13.0645;

    // New York
    // const lat = 40.7128;
    // const long = -74.006;

    // Sydney
    // const lat = -33.8651;
    // const long = 151.2153;

    // Tokyo
    // const lat = 35.6895;
    // const long = 139.6917;

    // Singapore
    // const lat = 1.2864;
    // const long = 103.8501;

    // Alaska
    // const lat = 61.2181;
    // const long = -149.9003;

    x = (long / 180) * 1.5;
    y = (lat / 90) * 0.75;
  });

  scene.useLoop(() => {
    const time = clock.getElapsedTime();
    const scale = (Math.sin(time * 2) + 1.05) * 4;
    // Update the circle scale in the shader instead
    if (material.userData.shader) {
      material.userData.shader.uniforms.circleScale.value = 0.1 + scale * 2;
    }
  }, 15);

  return scene;
};

export { world as scene, schema };
