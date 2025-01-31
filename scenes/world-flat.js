import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";
import { mapData } from "../resources/textures/map.js";
import { Text } from "../src/Text.js";

const schema = {
  title: "Flat World",
  sceneId: "world-flat",
  description: "A flat world widget.",
  props: {
    lat: {
      type: "number",
      description: "The latitude of the circle animation.",
      optional: true,
    },
    long: {
      type: "number",
      description: "The longitude of the circle animation.",
      optional: true,
    },
    text: {
      type: "string",
      description: "The text to display.",
      optional: true,
    },
    textAfter: {
      type: "string",
      description: "The text to display after the circle animation.",
      optional: true,
    },
    iterations: {
      type: "number",
      description: "The number of iterations.",
      default: 3,
      optional: true,
    },
  },
};

const world = function (props = {}) {
  let { lat, long, text, textAfter, iterations = 3 } = props;

  const scene = new Scene();
  let map;
  let material;
  let x;
  let y;
  let textMesh;

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
        shader.uniforms.circleRadius = {
          value: lat !== undefined && long !== undefined ? 0.2 : 0,
        };
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

    if (lat !== undefined && long !== undefined) {
      x = (long / 180) * 1.5;
      y = (lat / 90) * 0.75;
    }

    if (text) {
      const backgroundWidth = (2.666666666 / 56) * (text.length * 4 + 3);

      const textBackground = new THREE.Mesh(
        new THREE.PlaneGeometry(backgroundWidth, 0.9),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );
      textBackground.position.y = -1;
      scene.add(textBackground);

      textMesh = new Text(text);
      textMesh.position.y = -0.97;
      scene.add(textMesh);
    }
  });

  scene.useLoop(() => {
    if (lat === undefined || long === undefined) {
      return;
    }

    const time = clock.getElapsedTime();

    const scale =
      time < iterations * Math.PI
        ? (Math.sin(time * 2 - Math.PI / 2) + 1) * 4
        : 0;

    if (time > iterations * Math.PI && textMesh?.visible) {
      textMesh.visible = false;
      if (textAfter) {
        textMesh = new Text(textAfter);
        textMesh.position.y = -0.97;
        scene.add(textMesh);
      }
    }

    if (material.userData.shader) {
      material.userData.shader.uniforms.circleScale.value = 0.1 + scale * 2;
    }
  }, 60);

  return scene;
};

export { world as scene, schema };
