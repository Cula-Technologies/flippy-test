import { bitmapFont } from "../resources/fonts/bitmapFont.js";
import { bitmapFont6x10 } from "../resources/fonts/bitmapFont6x10.js";
import * as THREE from "three";

export class Text extends THREE.Group {
  constructor(text, options = {}) {
    super();

    const font = options.useLargeFont ? bitmapFont6x10 : bitmapFont;

    const lines = text.split("\n");

    for (const [index, line] of lines.entries()) {
      const lineGroup = new THREE.Group();
      lineGroup.position.y = -index * (options.useLargeFont ? 12 : 6) + lines.length * (options.useLargeFont ? 6 : 3);
      this.add(lineGroup);

      for (const [index, char] of line.toUpperCase().split("").entries()) {
        const charData = font[char];
        if (!charData) continue;

        for (const [row, rowData] of charData.entries()) {
          for (const [col, cell] of rowData.entries()) {
            if (!cell) continue;

            const x = index * (options.useLargeFont ? 7 : 4) + col + 1 - line.length * (options.useLargeFont ? 3.5 : 2);
            const y = (options.useLargeFont ? 5 : 3) - row;

            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, 0);

            lineGroup.add(mesh);
          }
        }
      }
    }

    const scale = 2.666666666 / 56;
    this.scale.x = scale;
    this.scale.y = scale;
  }
}
