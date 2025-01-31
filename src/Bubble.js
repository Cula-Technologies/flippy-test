import * as THREE from "three";

export class Bubble extends THREE.Mesh {
  constructor() {
    super(
      new THREE.CircleGeometry(Math.random() * 0.05 + 0.025, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.position.y = -1.5 - Math.random() * 3;
    this.position.x = Math.random() * 2 - 1;
  }

  tick() {
    this.position.y += 0.02;
    this.position.x += Math.random() * 0.05 - 0.025;
    if (this.position.y > 1.5) {
      this.position.y = -1.5;
      this.position.x = Math.random() * 2 - 1;
    }
  }
}
