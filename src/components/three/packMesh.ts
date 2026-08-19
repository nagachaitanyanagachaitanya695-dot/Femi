import * as THREE from "three";

import {
  drawPackBack,
  drawPackFront,
  drawPackSide,
  makeTexture,
  shade,
  type PackArt,
} from "./packTexture";

/** Builds a textured pack: front artwork, back-of-pack copy and printed sides. */
export function createPackMesh(art: PackArt): THREE.Mesh {
  const front = makeTexture((canvas) => drawPackFront(canvas, art));
  const back = makeTexture((canvas) => drawPackBack(canvas, art));
  const side = makeTexture((canvas) => drawPackSide(canvas, art));

  const filmy = (map?: THREE.Texture, color?: string) =>
    new THREE.MeshPhysicalMaterial({
      map,
      color: map ? 0xffffff : new THREE.Color(color ?? art.theme.base),
      roughness: 0.42,
      metalness: 0.04,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xffffff),
    });

  const edge = shade(art.theme.base, -0.22);

  // BoxGeometry material order: +x, -x, +y, -y, +z, -z
  const materials = [
    filmy(side),
    filmy(side),
    filmy(undefined, edge),
    filmy(undefined, edge),
    filmy(front),
    filmy(back),
  ];

  const geometry = new THREE.BoxGeometry(1.52, 1.04, 0.3, 12, 12, 4);
  softenEdges(geometry, 0.055);

  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Pulls the outermost vertices in slightly so the pack reads as a soft film
 * pillow rather than a hard-edged box, without needing a bevel geometry.
 */
function softenEdges(geometry: THREE.BoxGeometry, amount: number): void {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const parameters = geometry.parameters;
  const half = new THREE.Vector3(
    parameters.width / 2,
    parameters.height / 2,
    parameters.depth / 2,
  );

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    // How close this vertex is to an edge in each axis (0 = centre, 1 = edge).
    const ex = Math.abs(x) / half.x;
    const ey = Math.abs(y) / half.y;
    const ez = Math.abs(z) / half.z;

    const pinch = 1 - amount * (ex ** 6 + ey ** 6 + ez ** 6);
    position.setXYZ(i, x * pinch, y * pinch, z * pinch);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();

    const material = mesh.material;
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    for (const item of list) {
      const withMap = item as THREE.MeshPhysicalMaterial;
      withMap.map?.dispose();
      item.dispose();
    }
  });
}
