import * as THREE from "three";

export class Shark extends THREE.Group {
  constructor(size = 0.3, sharkAttackInSeconds = undefined) {
    super();

    this.now = new Date().getTime();
    // Give the fishes 2 seconds to hide!
    this.sharkAttackInSeconds = sharkAttackInSeconds + 2 * 1000;

    this.size = size;
    this.movementVector = new THREE.Vector2(-2, 0);

    const body = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    body.scale.set(3.5, 1, 1);
    this.add(body);

    const tail = new THREE.Mesh(
      new THREE.CircleGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    const tailTriangle = new THREE.Mesh(
      new THREE.CircleGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    const mouthTriangle = new THREE.Mesh(
      new THREE.CircleGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    const fin = new THREE.Mesh(
      new THREE.CircleGeometry(1, 3),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    fin.translateY(2);
    fin.position.y = 1;
    fin.position.x = -0.2;

    tail.scale.set(1, 1.5, 1);
    tail.position.x = -3.2;

    tailTriangle.scale.set(1, 1.2, 1);
    tailTriangle.position.x = -3.5;

    mouthTriangle.rotateZ(45);
    mouthTriangle.position.x = 3;

    const eye = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    eye.position.z = 0.1;
    eye.position.y = 0.2;
    eye.position.x = 1.7;

    this.add(eye);
    this.add(tail);
    this.add(tailTriangle);
    this.add(mouthTriangle);
    this.add(fin);
    this.scale.set(this.size, this.size, this.size);
    this.position.x = -6;
    this.position.z = -1;
  }

  tick(innitiateSharkAttack) {
    if (innitiateSharkAttack) {
      this.initiateSharkAttack();
    }
  }

  initiateSharkAttack() {
    this.position.x += 0.06;
  }

  resetSharkPosition() {
    return (this.position.x = -6);
  }
}
