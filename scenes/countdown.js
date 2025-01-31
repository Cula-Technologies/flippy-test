import Scene from "../src/Scene.js";
import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import sourceCodeFont from '../resources/fonts/dm_mono.json' assert { type: "json" };

const schema = {
  title: "Countdown",
  sceneId: "countdown",
  description: "A countdown widget.",
  properties: {
    targetTime: {
      type: "string",
      description: "Target time in HH:mm format (24h). Use this OR remainingTime.",
      default: "09:15"
    },
    remainingTime: {
      type: "number",
      description: "Remaining time in seconds. Use this OR targetTime.",
      minimum: 0,
      maximum: 60 * 60 - 1
    },
    zeroMessage: {
      type: "string",
      description: "Message to show when countdown reaches zero",
      default: "Standup"
    }
  }
};

// Configuration constants
const CONFIG = {
  text: {
    size: 0.6,
    y: -0.25,
    zeroMessageBaseSize: 0.4
  },
  display: {
    width: 2.5,
    height: 0.8
  },
  flash: {
    interval: 400,
    zIndex: -0.02
  }
};

class CountdownRenderer {
  constructor(scene, font) {
    this.scene = scene;
    this.font = font;
    this.textMesh = null;
    this.zeroTextMesh = null;
    this.charWidth = this.calculateCharWidth();
  }

  calculateCharWidth() {
    const testGeometry = new TextGeometry('0', {
      font: this.font,
      size: CONFIG.text.size,
      height: 0,
      curveSegments: 1,
    });
    testGeometry.computeBoundingBox();
    const width = testGeometry.boundingBox.max.x - testGeometry.boundingBox.min.x;
    testGeometry.dispose();
    return width;
  }

  updateCountdownText(text) {
    if (!this.font) return;

    const geometry = new TextGeometry(text, {
      font: this.font,
      size: CONFIG.text.size,
      height: 0,
      curveSegments: 1,
    });

    if (this.textMesh) {
      const oldGeometry = this.textMesh.geometry;
      this.textMesh.geometry = geometry;
      oldGeometry.dispose();
    } else {
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.textMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.textMesh);
    }
    
    const totalWidth = this.charWidth * text.length;
    this.textMesh.position.set(
      Math.round(-totalWidth / 2 * 1000) / 1000 - 0.1,
      CONFIG.text.y,
      0
    );
  }

  showZeroMessage(message) {
    if (!this.font) return;

    this.cleanup();

    const geometry = new TextGeometry(message, {
      font: this.font,
      size: CONFIG.text.zeroMessageBaseSize,
      height: 0,
      curveSegments: 1,
    });

    geometry.computeBoundingBox();
    const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    const textHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    
    const scale = Math.min(
      CONFIG.display.width / textWidth,
      CONFIG.display.height / textHeight
    );

    const materials = {
      white: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      black: new THREE.MeshBasicMaterial({ color: 0x000000 })
    };

    this.zeroTextMesh = new THREE.Mesh(geometry, materials.white);
    this.zeroTextMesh.scale.set(scale, scale, 1);
    
    const planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      materials.black
    );
    planeMesh.position.set(0, 0, CONFIG.flash.zIndex);
    this.scene.add(planeMesh);

    this.zeroTextMesh.position.set(-(textWidth * scale) / 2 - 0.02, CONFIG.text.y, 0);
    this.scene.add(this.zeroTextMesh);

    // Store references for cleanup and flashing
    this.zeroTextMesh.userData = { planeMesh, ...materials };
    
    return this.zeroTextMesh;
  }

  cleanup() {
    const cleanupMesh = (mesh) => {
      if (!mesh) return;
      
      this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      
      if (mesh.userData.planeMesh) {
        this.scene.remove(mesh.userData.planeMesh);
        mesh.userData.planeMesh.geometry.dispose();
        Object.values(mesh.userData)
          .filter(item => item instanceof THREE.Material)
          .forEach(material => material.dispose());
      }
    };

    cleanupMesh(this.textMesh);
    cleanupMesh(this.zeroTextMesh);
    this.textMesh = null;
    this.zeroTextMesh = null;
  }
}

class CountdownManager {
  constructor(startTime, type = 'remaining') {
    this.startTime = startTime;
    this.type = type;
    this.initTime = Date.now();
  }

  getCurrentCountdown() {
    if (this.type === 'remaining') {
      const elapsedTime = Math.floor((Date.now() - this.initTime) / 1000);
      return Math.max(0, Number(this.startTime) - elapsedTime);
    }
    return this.getRemainingSeconds(this.startTime);
  }

  getRemainingSeconds(targetTimeStr) {
    const now = new Date();
    const [hours, minutes] = targetTimeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    return Math.max(0, Math.floor((target - now) / 1000));
  }

  formatTime(seconds) {
    seconds = Math.min(seconds, 3599);
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  }
}

const countdown = function (props = {}) {
  const scene = new Scene();
  let renderer = null;
  let countdownInterval = null;
  let flashInterval = null;
  let isDestroyed = false;

  const setupFlashingEffect = (mesh) => {
    if (flashInterval) clearInterval(flashInterval);
    
    let isInverted = false;
    flashInterval = setInterval(() => {
      if (isDestroyed || !mesh) {
        if (flashInterval) {
          clearInterval(flashInterval);
          flashInterval = null;
        }
        return;
      }
      isInverted = !isInverted;
      mesh.material = isInverted ? mesh.userData.black : mesh.userData.white;
      mesh.userData.planeMesh.material = isInverted ? mesh.userData.white : mesh.userData.black;
    }, CONFIG.flash.interval);
  };

  const cleanup = () => {
    isDestroyed = true;
    [countdownInterval, flashInterval].forEach(interval => {
      if (interval) clearInterval(interval);
    });
    if (renderer) renderer.cleanup();
  };

  scene.once("loaded", async () => {
    const font = new FontLoader().parse(sourceCodeFont);
    renderer = new CountdownRenderer(scene, font);
    
    const initialTime = props.remainingTime !== undefined ? props.remainingTime : (props.targetTime || "09:15");
    const timeType = props.remainingTime !== undefined ? 'remaining' : 'target';
    const manager = new CountdownManager(initialTime, timeType);
    const zeroMessage = props.zeroMessage || "Time's up!";

    let remainingSeconds = manager.getCurrentCountdown();
    renderer.updateCountdownText(manager.formatTime(remainingSeconds));

    countdownInterval = setInterval(() => {
      if (isDestroyed) {
        clearInterval(countdownInterval);
        return;
      }

      remainingSeconds = manager.getCurrentCountdown();
      if (remainingSeconds > 0) {
        renderer.updateCountdownText(manager.formatTime(remainingSeconds));
      } else {
        clearInterval(countdownInterval);
        renderer.cleanup();
        const zeroTextMesh = renderer.showZeroMessage(zeroMessage);
        setupFlashingEffect(zeroTextMesh);
      }
    }, 1000);
  });

  scene.once("destroy", cleanup);

  return scene;
};

export { countdown as scene, schema };
