import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Sand",
  sceneId: "sand",
  description: "A grid-based sand simulation.",
  properties: {
    spawnRate: {
      type: "number",
      title: "Sand particles per second",
      description: "How many sand particles to spawn per second",
      default: 0.3,
      minimum: 0.1,
      maximum: 100
    }
  }
};

const sand = function (config = {}) {
  const scene = new Scene();
  const clock = new THREE.Clock();
  
  // Configuration
  const spawnRate = config.spawnRate || schema.properties.spawnRate.default;
  const spawnInterval = 1 / spawnRate;
  
  // Grid parameters matching flipdot resolution
  const GRID_WIDTH = 56;
  const GRID_HEIGHT = 42;
  
  // Get a random x position for dropping sand
  function getDropPosition() {
    return Math.floor(Math.random() * GRID_WIDTH);
  }
  
  // Create canvas for the grid
  const canvas = createCanvas(GRID_WIDTH, GRID_HEIGHT);
  const ctx = canvas.getContext("2d");
  
  // Initialize grid
  const grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
  
  // Calculate the current fill percentage
  function calculateFillPercentage() {
    let filledPixels = 0;
    const totalPixels = GRID_WIDTH * GRID_HEIGHT;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x] === 1) {
          filledPixels++;
        }
      }
    }
    
    return (filledPixels / totalPixels) * 100;
  }
  
  // Invert the sand pattern
  function invertSand() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        grid[y][x] = grid[y][x] === 1 ? 0 : 1;
      }
    }
  }
  
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
  
  // Update the canvas based on grid state
  function updateCanvas() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
    
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
  
  // Update sand simulation
  function updateSand() {
    // Create a copy of the grid to read from while updating
    const newGrid = grid.map(row => [...row]);
    
    // Update from bottom to top, right to left
    for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
      for (let x = GRID_WIDTH - 1; x >= 0; x--) {
        if (grid[y][x] === 1) {
          // Check below
          if (grid[y + 1][x] === 0) {
            newGrid[y][x] = 0;
            newGrid[y + 1][x] = 1;
          }
          // Check diagonal bottom-right
          else if (x < GRID_WIDTH - 1 && grid[y + 1][x + 1] === 0) {
            newGrid[y][x] = 0;
            newGrid[y + 1][x + 1] = 1;
          }
          // Check diagonal bottom-left
          else if (x > 0 && grid[y + 1][x - 1] === 0) {
            newGrid[y][x] = 0;
            newGrid[y + 1][x - 1] = 1;
          }
        }
      }
    }
    
    // Update the grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid[y] = [...newGrid[y]];
    }
  }

  scene.once("loaded", async () => {
    // Calculate aspect ratio to maintain pixel perfect display
    const aspectRatio = GRID_WIDTH / GRID_HEIGHT;
    const planeGeometry = new THREE.PlaneGeometry(2 * aspectRatio, 2);
    const plane = new THREE.Mesh(planeGeometry, material);
    scene.add(plane);
  });

  let timeSinceLastParticle = 0;
  let shouldInvert = true; // Flag to ensure we only invert once per threshold

  scene.useLoop(() => {
    const delta = clock.getDelta();
    timeSinceLastParticle += delta;
    
    // Check fill percentage and invert if needed
    const fillPercentage = calculateFillPercentage();
    if (fillPercentage >= 80 && shouldInvert) {
      invertSand();
      shouldInvert = false;
    } else if (fillPercentage < 50) {
      shouldInvert = true; // Reset flag when fill percentage drops below threshold
    }
    
    // Add new sand particle based on spawn rate
    if (timeSinceLastParticle >= spawnInterval) {
      const x = getDropPosition();
      if (grid[0][x] === 0) {
        grid[0][x] = 1;
      }
      timeSinceLastParticle = 0;
    }
    
    // Update simulation
    updateSand();
    
    // Update display
    updateCanvas();
  }, 60);

  return scene;
};

export { sand as scene, schema };
