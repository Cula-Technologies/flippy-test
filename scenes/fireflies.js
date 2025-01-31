import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Fireflies",
  sceneId: "fireflies",
  description: "A simulation of fireflies attracted to a moving point.",
  properties: {
    numFireflies: {
      type: "number",
      title: "Number of fireflies",
      description: "How many fireflies to simulate",
      default: 8,
      minimum: 1,
      maximum: 100
    },
    attractionStrength: {
      type: "number",
      title: "Attraction force",
      description: "How strongly fireflies are pulled towards the center",
      default: 0.03,
      minimum: 0.01,
      maximum: 0.2
    },
    inertia: {
      type: "number",
      title: "Inertia",
      description: "How much fireflies resist changes in movement (higher = more overshooting)",
      default: 0.96,
      minimum: 0.7,
      maximum: 0.98
    },
    attractionPointSpeed: {
      type: "number",
      title: "Attraction point movement speed",
      description: "How fast the attraction point moves",
      default: 0.5,
      minimum: 0.1,
      maximum: 2.0
    }
  }
};

const fireflies = function (config = {}) {
  const scene = new Scene();
  const clock = new THREE.Clock();
  
  // Configuration
  const numFireflies = config.numFireflies || schema.properties.numFireflies.default;
  const attractionStrength = config.attractionStrength || schema.properties.attractionStrength.default;
  const inertia = config.inertia || schema.properties.inertia.default;
  const attractionPointSpeed = config.attractionPointSpeed || schema.properties.attractionPointSpeed.default;
  
  // Grid parameters matching flipdot resolution
  const GRID_WIDTH = 56;
  const GRID_HEIGHT = 42;
  
  // Create canvas for the grid
  const canvas = createCanvas(GRID_WIDTH, GRID_HEIGHT);
  const ctx = canvas.getContext("2d");
  
  // Initialize grid
  const grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
  
  // Firefly class to track position and velocity
  class Firefly {
    constructor() {
      // Start fireflies at random positions
      this.x = Math.random() * GRID_WIDTH;
      this.y = Math.random() * GRID_HEIGHT;
      // Initial velocities determine starting direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.3;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      // Individual variation
      this.swerveAngle = Math.random() * Math.PI * 2;
      this.swerveSpeed = 0.2 + Math.random() * 0.3;
    }

    update(attractionX, attractionY) {
      // Update swerve for natural movement variation
      this.swerveAngle += this.swerveSpeed * 0.1;
      
      // Calculate vector to attraction point
      const dx = attractionX - this.x;
      const dy = attractionY - this.y;
      const distanceToAttraction = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate attraction force
      let force = Math.min(distanceToAttraction * 0.1, 0.5) * attractionStrength;
      // Minimum force to prevent sticking to center
      force = Math.max(force, 0.02);
      
      // Apply force towards attraction point with swerve
      const swerveX = Math.cos(this.swerveAngle) * 0.015;
      const swerveY = Math.sin(this.swerveAngle) * 0.015;
      
      // Normalize direction and apply force
      if (distanceToAttraction > 0) {
        this.vx += (dx / distanceToAttraction) * force + swerveX;
        this.vy += (dy / distanceToAttraction) * force + swerveY;
      }
      
      // Apply inertia (higher = more overshooting)
      this.vx *= inertia;
      this.vy *= inertia;
      
      // Add tiny random movement
      this.vx += (Math.random() - 0.5) * 0.01;
      this.vy += (Math.random() - 0.5) * 0.01;
      
      // Limit maximum speed to prevent extreme velocities
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const maxSpeed = 2.0;
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }
      
      // Update position
      this.x += this.vx;
      this.y += this.vy;
      
      // Wrap around edges
      if (this.x < 0) this.x = GRID_WIDTH - 1;
      if (this.x >= GRID_WIDTH) this.x = 0;
      if (this.y < 0) this.y = GRID_HEIGHT - 1;
      if (this.y >= GRID_HEIGHT) this.y = 0;
    }
  }
  
  // Initialize fireflies
  const firefliesArray = Array(numFireflies).fill().map(() => new Firefly());
  
  // Initialize attraction point
  let attractionPoint = {
    x: GRID_WIDTH / 2,
    y: GRID_HEIGHT / 2,
    angle: 0,
    currentSpeed: 1,
    targetSpeed: 1,
    speedChangeTimer: 0,
    speedChangeDuration: 2
  };
  
  // Create texture and material
  const texture = new THREE.CanvasTexture(
    canvas,
    undefined,
    THREE.ClampToEdgeWrapping,
    THREE.ClampToEdgeWrapping,
    THREE.NearestFilter,
    THREE.NearestFilter
  );
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });
  
  // Update the canvas based on fireflies positions
  function updateCanvas() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
    
    // Clear grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        grid[y][x] = 0;
      }
    }
    
    // Update grid with firefly positions
    firefliesArray.forEach(firefly => {
      const gridX = Math.floor(firefly.x);
      const gridY = Math.floor(firefly.y);
      if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        grid[gridY][gridX] = 1;
      }
    });
    
    // Draw fireflies
    ctx.fillStyle = '#FFD700';
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] === 1) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    texture.needsUpdate = true;
  }

  scene.once("loaded", async () => {
    // Calculate aspect ratio to maintain pixel perfect display
    const aspectRatio = GRID_WIDTH / GRID_HEIGHT;
    const planeGeometry = new THREE.PlaneGeometry(2 * aspectRatio, 2);
    const plane = new THREE.Mesh(planeGeometry, material);
    scene.add(plane);
  });

  scene.useLoop(() => {
    const delta = clock.getDelta();
    
    // Update attraction point speed
    attractionPoint.speedChangeTimer += delta;
    if (attractionPoint.speedChangeTimer >= attractionPoint.speedChangeDuration) {
      // Set new target speed
      attractionPoint.targetSpeed = Math.random() * 3; // Random speed between 0 and 3
      // Occasionally make it very fast
      if (Math.random() < 0.1) {
        attractionPoint.targetSpeed *= 3;
      }
      // Set new duration for this speed (between 0.5 and 4 seconds)
      attractionPoint.speedChangeDuration = 0.5 + Math.random() * 3.5;
      attractionPoint.speedChangeTimer = 0;
    }
    
    // Smoothly interpolate to target speed
    attractionPoint.currentSpeed += (attractionPoint.targetSpeed - attractionPoint.currentSpeed) * delta * 2;
    
    // Update attraction point position with current speed
    attractionPoint.angle += attractionPoint.currentSpeed * delta * attractionPointSpeed;
    const radius = Math.min(GRID_WIDTH, GRID_HEIGHT) * 0.2;
    attractionPoint.x = GRID_WIDTH / 2 + Math.cos(attractionPoint.angle) * radius;
    attractionPoint.y = GRID_HEIGHT / 2 + Math.sin(attractionPoint.angle * 0.7) * radius;
    
    // Update fireflies
    firefliesArray.forEach(firefly => {
      firefly.update(attractionPoint.x, attractionPoint.y);
    });
    
    // Update display
    updateCanvas();
  }, 60);

  return scene;
};

export { fireflies as scene, schema };
