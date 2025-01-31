import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Eyes",
  sceneId: "eyes",
  description: "A pair of animated eyes that look around.",
  properties: {
    blinkInterval: {
      type: "number",
      description: "Average time between blinks in seconds",
      default: 3,
    },
  },
};

const eyes = function (props = {}) {
  const scene = new Scene();
  const blinkInterval = props.blinkInterval || 3;

  let leftEye, rightEye, leftPupil, rightPupil;
  let leftTopEyelid, leftBottomEyelid, rightTopEyelid, rightBottomEyelid;
  let nextBlinkTime = 0;
  let isBlinking = false;
  let blinkProgress = 0;

  // Smooth easing function for natural blink motion
  const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  scene.once("loaded", async () => {
    // Create eye whites
    const eyeGeometry = new THREE.CircleGeometry(0.8, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);

    leftEye.position.set(-0.6, 0, 0);
    rightEye.position.set(0.6, 0, 0);
    leftEye.scale.set(0.7, 1, 1);
    rightEye.scale.set(0.7, 1, 1);

    scene.add(leftEye);
    scene.add(rightEye);

    // Create pupils
    const pupilGeometry = new THREE.CircleGeometry(0.25, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);

    leftPupil.position.copy(leftEye.position);
    rightPupil.position.copy(rightEye.position);

    scene.add(leftPupil);
    scene.add(rightPupil);

    // Create eyelids
    const createEyelidGeometry = () => {
      // Make eyelids wider than the eyes and much taller
      const geometry = new THREE.PlaneGeometry(1.2, 4); // Increased height from 0.6 to 1.0
      return geometry;
    };

    const eyelidMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Create top and bottom eyelids for each eye
    leftTopEyelid = new THREE.Mesh(createEyelidGeometry(), eyelidMaterial);
    leftBottomEyelid = new THREE.Mesh(createEyelidGeometry(), eyelidMaterial);
    rightTopEyelid = new THREE.Mesh(createEyelidGeometry(), eyelidMaterial);
    rightBottomEyelid = new THREE.Mesh(createEyelidGeometry(), eyelidMaterial);

    // Position eyelids - move them much further out
    const leftCenter = leftEye.position.clone();
    const rightCenter = rightEye.position.clone();

    // Position top eyelids above eyes
    leftTopEyelid.position.set(leftCenter.x, leftCenter.y + 3.2, 0.1); // Increased from 0.8 to 3.2
    rightTopEyelid.position.set(rightCenter.x, rightCenter.y + 3.2, 0.1);

    // Position bottom eyelids below eyes
    leftBottomEyelid.position.set(leftCenter.x, leftCenter.y - 3.2, 0.1); // Increased from 0.8 to 3.2
    rightBottomEyelid.position.set(rightCenter.x, rightCenter.y - 3.2, 0.1);

    scene.add(leftTopEyelid);
    scene.add(leftBottomEyelid);
    scene.add(rightTopEyelid);
    scene.add(rightBottomEyelid);

    nextBlinkTime = Date.now() + Math.random() * 1000;
  });

  scene.useLoop(() => {
    // Eye movement
    const time = Date.now() / 1000;
    const lookX = Math.sin(time * 1.2) * 0.3;
    const lookY = Math.cos(time * 0.8) * 0.2;

    if (leftPupil && rightPupil) {
      leftPupil.position.x = leftEye.position.x + lookX;
      leftPupil.position.y = lookY;
      rightPupil.position.x = rightEye.position.x + lookX;
      rightPupil.position.y = lookY;
    }

    // Blinking
    if (Date.now() > nextBlinkTime && !isBlinking) {
      isBlinking = true;
      blinkProgress = 0;
    }

    if (isBlinking) {
      blinkProgress += 0.06;

      let blinkPhase = blinkProgress;
      if (blinkPhase > 1) blinkPhase = 2 - blinkPhase;
      blinkPhase = Math.max(0, Math.min(1, blinkPhase));

      // Move eyelids to exactly meet in the middle when blinkPhase is 1
      const moveAmount = easeInOutQuad(blinkPhase + 0.1) * 3.2;
      const centerY = leftEye.position.y; // The center point where eyelids should meet

      // Move eyelids towards center
      if (
        leftTopEyelid &&
        leftBottomEyelid &&
        rightTopEyelid &&
        rightBottomEyelid
      ) {
        // Top eyelids move down to center
        leftTopEyelid.position.y = centerY + (3.2 - moveAmount);
        rightTopEyelid.position.y = centerY + (3.2 - moveAmount);

        // Bottom eyelids move up to center
        leftBottomEyelid.position.y = centerY - (3.2 - moveAmount);
        rightBottomEyelid.position.y = centerY - (3.2 - moveAmount);
      }

      if (blinkProgress >= 2) {
        isBlinking = false;
        nextBlinkTime = Date.now() + (Math.random() * 1500 + 2000);
      }
    }
  }, 60);

  return scene;
};

export { eyes as scene, schema };
