import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Bouncy Logo",
  sceneId: "bouncy-logo",
  description: "A bouncy logo widget.",
  properties: {
    size: {
      type: "number",
      title: "Shape Size",
      description: "Size of the shapes (radius)",
      default: 0.5,
      minimum: 0.1,
      maximum: 1.0
    },
    speed: {
      type: "number",
      title: "Movement Speed",
      description: "Speed of the shapes",
      default: 0.02,
      minimum: 0.005,
      maximum: 0.05
    }
  }
};

const logo = function (config = {}) {
  const scene = new Scene();

  let circle;
  let hexagon;
  let intersectionMaterial;
  const SHAPE_RADIUS = config.size || schema.properties.size.default;
  const MAX_SPEED = config.speed || schema.properties.speed.default;
  
  // Helper function to generate velocity with minimum angle
  const generateVelocity = () => {
    const MIN_COMPONENT = MAX_SPEED * 0.4; // Minimum velocity in each direction (40% of max)
    
    // Generate random components but ensure minimum values
    let x = (Math.random() - 0.5) * MAX_SPEED;
    let y = (Math.random() - 0.5) * MAX_SPEED;
    
    // Ensure minimum x component
    if (Math.abs(x) < MIN_COMPONENT) {
      x = MIN_COMPONENT * Math.sign(x || 1);
    }
    
    // Ensure minimum y component
    if (Math.abs(y) < MIN_COMPONENT) {
      y = MIN_COMPONENT * Math.sign(y || 1);
    }
    
    return new THREE.Vector2(x, y);
  };
  
  // Add velocity vectors and bounds
  const circleVelocity = generateVelocity();
  const hexagonVelocity = generateVelocity();
  
  // Display is 56x42 pixels
  // Height is 2 (-1 to 1), so width should be 2.666666 (56/42 * 2)
  const bounds = {
    minX: -1.333333 + SHAPE_RADIUS,
    maxX: 1.333333 - SHAPE_RADIUS,
    minY: -1 + SHAPE_RADIUS,
    maxY: 1 - SHAPE_RADIUS
  };

  scene.once("loaded", () => {
    // Create circle
    const circleGeometry = new THREE.CircleGeometry(SHAPE_RADIUS, 64);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    circle = new THREE.Mesh(circleGeometry, circleMaterial);
    // Ensure initial position is within bounds
    circle.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
    circle.position.y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
    scene.add(circle);

    // Create hexagon
    const hexagonGeometry = new THREE.CircleGeometry(SHAPE_RADIUS, 6);
    const hexagonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    hexagon = new THREE.Mesh(hexagonGeometry, hexagonMaterial);
    // Ensure initial position is within bounds
    hexagon.position.x = Math.random() * (bounds.maxX - bounds.minX) + bounds.minX;
    hexagon.position.y = Math.random() * (bounds.maxY - bounds.minY) + bounds.minY;
    hexagon.rotation.z = Math.PI / 2;
    scene.add(hexagon);

    // Create intersection mesh (white overlay)
    // Make the plane wider to match the display ratio
    const intersectionGeometry = new THREE.PlaneGeometry(2.666666, 2);
    intersectionMaterial = new THREE.ShaderMaterial({
      uniforms: {
        circle1Pos: { value: new THREE.Vector2(circle.position.x, circle.position.y) },
        circle2Pos: { value: new THREE.Vector2(hexagon.position.x, hexagon.position.y) },
        radius: { value: SHAPE_RADIUS },
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

      float hexagonShape(vec2 p, float r) {
        p = abs(p);
        float hex = max(abs(p.y), p.x * 0.866025404 + p.y * 0.5);
        return step(hex, r);
      }

      void main() {
        vec2 screenPos = vec2((vUv.x - 0.5) * 2.666666, (vUv.y - 0.5) * 2.0);
        
        float circle1 = step(length(screenPos - circle1Pos), radius);
        
        vec2 hexPos = screenPos - circle2Pos;
        hexPos = vec2(-hexPos.y, hexPos.x);
        float circle2 = hexagonShape(hexPos, radius * 0.86);
        
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
    // Update positions with velocity
    circle.position.x += circleVelocity.x;
    circle.position.y += circleVelocity.y;
    hexagon.position.x += hexagonVelocity.x;
    hexagon.position.y += hexagonVelocity.y;

    // Bounce off boundaries for circle
    if (circle.position.x <= bounds.minX) {
      circle.position.x = bounds.minX;
      circleVelocity.x *= -1;
    } else if (circle.position.x >= bounds.maxX) {
      circle.position.x = bounds.maxX;
      circleVelocity.x *= -1;
    }
    if (circle.position.y <= bounds.minY) {
      circle.position.y = bounds.minY;
      circleVelocity.y *= -1;
    } else if (circle.position.y >= bounds.maxY) {
      circle.position.y = bounds.maxY;
      circleVelocity.y *= -1;
    }

    // Bounce off boundaries for hexagon
    if (hexagon.position.x <= bounds.minX) {
      hexagon.position.x = bounds.minX;
      hexagonVelocity.x *= -1;
    } else if (hexagon.position.x >= bounds.maxX) {
      hexagon.position.x = bounds.maxX;
      hexagonVelocity.x *= -1;
    }
    if (hexagon.position.y <= bounds.minY) {
      hexagon.position.y = bounds.minY;
      hexagonVelocity.y *= -1;
    } else if (hexagon.position.y >= bounds.maxY) {
      hexagon.position.y = bounds.maxY;
      hexagonVelocity.y *= -1;
    }

    // Update intersection shader uniforms
    intersectionMaterial.uniforms.circle1Pos.value.set(circle.position.x, circle.position.y);
    intersectionMaterial.uniforms.circle2Pos.value.set(hexagon.position.x, hexagon.position.y);
  }, 60);

  return scene;
};

export { logo as scene, schema };
