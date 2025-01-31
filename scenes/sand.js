import { createCanvas, Image } from "node-canvas-webgl";
import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Sand",
  sceneId: "sand",
  description: "A grid-based sand simulation for flipdot display.",
};

const sand = function () {
  const scene = new Scene();
  const clock = new THREE.Clock();
  
  // Grid parameters matching flipdot resolution
  const GRID_WIDTH = 56;
  const GRID_HEIGHT = 42;
  
  // Normal distribution parameters
  const MEAN = GRID_WIDTH / 2;
  const STD_DEV = GRID_WIDTH / 6; // Adjusts how spread out the distribution is
  
  // Box-Muller transform for normal distribution
  function normalRandom() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to our desired mean and standard deviation
    return Math.round(z * STD_DEV + MEAN);
  }
  
  // Get a valid x position with normal distribution
  function getDropPosition() {
    let x;
    do {
      x = normalRandom();
    } while (x < 0 || x >= GRID_WIDTH);
    return x;
  }
  
  // Create canvas for the grid
  const canvas = createCanvas(GRID_WIDTH, GRID_HEIGHT);
  const ctx = canvas.getContext("2d");
  
  // Initialize grid
  const grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
  
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

  scene.useLoop(() => {
    const delta = clock.getDelta();
    timeSinceLastParticle += delta;
    
    // Add new sand particle every second
    if (timeSinceLastParticle >= 0.5) {
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
