import { bitmapFont } from "../resources/fonts/bitmapFont.js";
import * as THREE from "three";

export class Text extends THREE.Group {
  constructor(text) {
    super();

    const font = bitmapFont;

    const lines = text.split("\n");

    for (const [index, line] of lines.entries()) {
      const lineGroup = new THREE.Group();
      lineGroup.position.y = -index * 6 + lines.length * 3;
      this.add(lineGroup);

      for (const [index, char] of line.toUpperCase().split("").entries()) {
        const charData = font[char];

        for (const [row, rowData] of charData.entries()) {
          for (const [col, cell] of rowData.entries()) {
            if (!cell) continue;

            const x = index * 4 + col + 1 - line.length * 2;
            const y = 3 - row;

            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, 0);

            const digit = new THREE.Group();
            digit.add(mesh);

            lineGroup.add(digit);
          }
        }
      }
    }

    const scale = 2.666666666 / 56;

    this.scale.x = scale;
    this.scale.y = scale;
  }
}
