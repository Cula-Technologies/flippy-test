import * as THREE from "three";

export class Fish extends THREE.Group {
  constructor(size = 0.2, sharkAttackInSeconds = undefined) {
    super();

    this.now = new Date().getTime();
    this.sharkAttackInSeconds = sharkAttackInSeconds * 1000;

    this.size = size;
    this.movementVector = new THREE.Vector2(
      (Math.random() - 0.5) / 50,
      (Math.random() - 0.5) / 50
    );

    const body = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.add(body);

    const tail = new THREE.Mesh(
      new THREE.CircleGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    tail.position.x = -1;
    this.add(tail);

    const eye = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    eye.position.z = 0.1;
    eye.position.y = 0.4;
    eye.position.x = 0.2;

    this.add(eye);
    this.scale.set(this.size, this.size, this.size);
  }

  tick(sharkAttack) {
    if (sharkAttack) {
      return this.hideFromTheShark();
    }

    if (
      Math.abs(this.position.x) > 1 &&
      Math.sign(this.position.x) === Math.sign(this.movementVector.x)
    ) {
      this.movementVector.x *= -1;
    }

    const halfHeight = 1.5 * this.size;
    if (
      Math.abs(this.position.y) + halfHeight > 1 &&
      Math.sign(this.position.y) === Math.sign(this.movementVector.y)
    ) {
      this.movementVector.y *= -1;
    }

    this.position.x += this.movementVector.x;
    this.position.y += this.movementVector.y;

    this.movementVector.x += (Math.random() - 0.5) * 0.02;
    this.movementVector.y += (Math.random() - 0.5) * 0.02;

    this.movementVector.x = Math.max(
      -0.1,
      Math.min(0.1, this.movementVector.x)
    );
    this.movementVector.y = Math.max(
      -0.05,
      Math.min(0.05, this.movementVector.y)
    );

    this.scale.set(
      Math.sign(this.movementVector.x) * this.size,
      this.size,
      this.size
    );
  }

  hideFromTheShark() {
    if (this.movementVector.x > 0) {
      if (this.position.x > 2.7) return;
      this.position.x += 0.1;
    } else {
      if (this.position.x < -2.7) return;
      this.position.x -= 0.1;
    }
  }
}
