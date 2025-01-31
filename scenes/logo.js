import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Logo",
  id: "logo",
  description: "A simple logo widget.",
};

const logo = function () {
  const scene = new Scene();

  let circle;
  let hexagon;
  let intersectionMaterial;
  const clock = new THREE.Clock();

  scene.once("loaded", () => {
    // Create circle
    const circleGeometry = new THREE.CircleGeometry(0.5, 64);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Black
    circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.x = -0.5;
    scene.add(circle);

    // Create hexagon
    const hexagonGeometry = new THREE.CircleGeometry(0.5, 6);
    const hexagonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Black
    hexagon = new THREE.Mesh(hexagonGeometry, hexagonMaterial);
    hexagon.position.x = 0.5;
    hexagon.rotation.z = Math.PI / 2; // Rotate 90 degrees (π/2 radians)
    scene.add(hexagon);

    // Create intersection mesh (white overlay)
    const intersectionGeometry = new THREE.PlaneGeometry(2, 2);
    intersectionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        circle1Pos: { value: new THREE.Vector2(-0.5, 0) },
        circle2Pos: { value: new THREE.Vector2(0.5, 0) },
        radius: { value: 0.5 },
      },
      vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform vec2 circle1Pos;
      uniform vec2 circle2Pos;
      uniform float radius;
      varying vec2 vUv;

      // Helper function to check if point is inside hexagon
      float hexagonShape(vec2 p, float r) {
        p = abs(p);
        float hex = max(abs(p.y), p.x * 0.866025404 + p.y * 0.5);
        return step(hex, r);
      }

      void main() {
        vec2 screenPos = (vUv - 0.5) * 2.0;
        
        // Circle test
        float circle1 = step(length(screenPos - circle1Pos), radius);
        
        // Hexagon test
        vec2 hexPos = screenPos - circle2Pos;
        // Rotate hexagon position 90 degrees
        hexPos = vec2(-hexPos.y, hexPos.x);
        float circle2 = hexagonShape(hexPos, radius * 0.86);
        
        // Where both shapes overlap, make it white
        float intersection = circle1 * circle2;
        gl_FragColor = vec4(0.0, 0.0, 0.0, intersection);
      }
    `,
      transparent: true,
    });

    const intersectionMesh = new THREE.Mesh(
      intersectionGeometry,
      intersectionMaterial
    );
    intersectionMesh.position.z = 0.1;
    scene.add(intersectionMesh);
  });

  scene.useLoop(() => {
    const time = clock.getElapsedTime();
    const position = (Math.sin(time * 1) + 1) * 0.28;

    // Apply positions
    circle.position.x = -0.8 + position;
    hexagon.position.x = 0.8 - position;

    // Update intersection shader uniforms
    // console.log(scene.three.scene.children);
    // const intersectionMaterial = scene.three.scene.children[2].material;
    intersectionMaterial.uniforms.circle1Pos.value.x = circle.position.x;
    intersectionMaterial.uniforms.circle2Pos.value.x = hexagon.position.x;
  }, 15);

  return scene;
};

export { logo as scene, schema };
