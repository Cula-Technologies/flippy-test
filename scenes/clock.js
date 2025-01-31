import Scene from "../src/Scene.js";
import * as THREE from "three";

const schema = {
  title: "Analog Clock",
  sceneId: "clock",
  description: "An analog clock widget.",
  properties: {
    showSeconds: {
      type: "boolean",
      description: "Whether to show the seconds hand",
      default: true,
    },
  },
};

const clock = function (props = {}) {
  const scene = new Scene();
  const showSeconds = props.showSeconds !== false;

  let hourHand, minuteHand, secondHand;

  scene.once("loaded", async () => {
    const displayWidth = 56;
    const radius = Math.round((displayWidth / 2) * 0.9) / 28;

    const outerCircle = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    scene.add(outerCircle);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(radius - 0.045, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    clockFace.position.z = 0.01;
    scene.add(clockFace);

    hourHand = new THREE.Group();
    const hourHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.5, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    hourHandMesh.position.x = radius * 0.25;
    hourHand.add(hourHandMesh);
    hourHand.rotation.z = Math.PI / 2;
    scene.add(hourHand);

    minuteHand = new THREE.Group();
    const minuteHandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.7, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    minuteHandMesh.position.x = radius * 0.35;
    minuteHand.add(minuteHandMesh);
    minuteHand.rotation.z = Math.PI / 2;
    scene.add(minuteHand);

    if (showSeconds) {
      secondHand = new THREE.Group();
      const secondHandMesh = new THREE.Mesh(
        new THREE.BoxGeometry(radius * 0.8, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      secondHandMesh.position.x = radius * 0.4;
      secondHand.add(secondHandMesh);
      secondHand.rotation.z = Math.PI / 2;
      scene.add(secondHand);
    }

    const centerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.08, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    centerDot.position.z = 0.1;
    scene.add(centerDot);
  });

  scene.useLoop(() => {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    const hourAngle = ((hours + minutes / 60) * (Math.PI * 2)) / 12;
    const minuteAngle = ((minutes + seconds / 60) * (Math.PI * 2)) / 60;
    const secondAngle = ((seconds + millis / 1000) * (Math.PI * 2)) / 60;

    hourHand.rotation.z = -hourAngle + Math.PI / 2;
    minuteHand.rotation.z = -minuteAngle + Math.PI / 2;
    if (showSeconds && secondHand) {
      secondHand.rotation.z = -secondAngle + Math.PI / 2;
    }
  }, 60);

  return scene;
};

export { clock as scene, schema };
