import * as THREE from "three";

import type { PackArt } from "./packTexture";
import { createPackMesh, disposeObject } from "./packMesh";

export interface SceneHandle {
  dispose: () => void;
}

interface HeroOptions {
  packs: PackArt[];
  reducedMotion: boolean;
}

/**
 * The hero scene: three Femi packs drifting over soft blush spheres, lit like
 * a product shoot. It renders on demand — one frame when motion is reduced,
 * and it pauses entirely when the hero scrolls out of view.
 */
export function createHeroScene(container: HTMLElement, options: HeroOptions): SceneHandle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    100,
  );
  camera.position.set(0, 0.1, 5.4);

  /* ---- lighting ---- */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9e5, 1.35));

  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(3.2, 4.2, 4.5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffc2d6, 1.5);
  rim.position.set(-4, 1.5, -2.5);
  scene.add(rim);

  const fill = new THREE.PointLight(0xff7fa8, 22, 18, 2);
  fill.position.set(-1.6, -1.8, 2.4);
  scene.add(fill);

  /* ---- decorative blobs ---- */
  const blobs = new THREE.Group();
  const blobColors = [0xffd7e4, 0xffeef4, 0xf7c7d8, 0xfde8d4];
  for (let i = 0; i < 7; i += 1) {
    const radius = 0.16 + (i % 3) * 0.12;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: blobColors[i % blobColors.length],
      roughness: 0.28,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    const blob = new THREE.Mesh(geometry, material);
    const angle = (i / 7) * Math.PI * 2;
    blob.position.set(Math.cos(angle) * 2.5, Math.sin(angle * 1.7) * 1.6, -2.6 - (i % 3) * 0.8);
    blob.userData.seed = i * 1.7;
    blobs.add(blob);
  }
  scene.add(blobs);

  /* ---- packs ---- */
  const packGroup = new THREE.Group();
  const layout = [
    { position: new THREE.Vector3(0, -0.05, 0.35), rotation: -0.32, scale: 1.06 },
    { position: new THREE.Vector3(-1.72, 0.52, -0.9), rotation: -0.62, scale: 0.8 },
    { position: new THREE.Vector3(1.72, -0.55, -0.75), rotation: 0.5, scale: 0.78 },
  ];

  options.packs.slice(0, 3).forEach((art, index) => {
    const spot = layout[index] ?? layout[0];
    const pack = createPackMesh(art);
    pack.position.copy(spot.position);
    pack.rotation.set(0.16, spot.rotation, index === 0 ? -0.03 : (index === 1 ? 0.1 : -0.12));
    pack.scale.setScalar(spot.scale);
    pack.userData.baseX = spot.position.x;
    pack.userData.baseY = spot.position.y;
    pack.userData.baseScale = spot.scale;
    pack.userData.seed = index * 2.1;
    packGroup.add(pack);
  });
  scene.add(packGroup);

  /* ---- interaction + animation ---- */
  const pointer = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);

  const onPointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    target.set(
      ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    );
  };
  const onPointerLeave = () => target.set(0, 0);

  if (!options.reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerleave", onPointerLeave);
  }

  /**
   * Reframes the scene for the container's shape. On a phone the stage is
   * narrow, so the packs are pulled closer together and the camera steps back
   * — otherwise the outer two packs sit half off the canvas.
   */
  const reframe = (aspect: number) => {
    const portrait = aspect < 1;
    const spread = portrait ? 0.62 : Math.min(1, aspect / 1.1);
    const scale = portrait ? 0.86 : 1;

    packGroup.children.forEach((pack) => {
      pack.position.x = (pack.userData.baseX as number) * spread;
      pack.scale.setScalar((pack.userData.baseScale as number) * scale);
    });

    camera.position.z = portrait ? 6.1 : aspect < 1.25 ? 5.7 : 5.4;
  };

  const resize = () => {
    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    reframe(camera.aspect);
    camera.updateProjectionMatrix();
    render();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let visible = true;
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !options.reducedMotion) start();
    },
    { threshold: 0.01 },
  );
  intersectionObserver.observe(container);

  const clock = new THREE.Clock();
  let frame = 0;

  function render() {
    renderer.render(scene, camera);
  }

  function tick() {
    frame = requestAnimationFrame(tick);
    if (!visible) return;

    const time = clock.getElapsedTime();
    pointer.lerp(target, 0.045);

    packGroup.children.forEach((pack) => {
      const seed = pack.userData.seed as number;
      pack.position.y = (pack.userData.baseY as number) + Math.sin(time * 0.7 + seed) * 0.085;
      pack.rotation.y += Math.sin(time * 0.35 + seed) * 0.0009;
      pack.rotation.x = 0.16 + Math.sin(time * 0.5 + seed) * 0.03;
    });

    blobs.children.forEach((blob) => {
      const seed = blob.userData.seed as number;
      blob.position.y += Math.sin(time * 0.8 + seed) * 0.0016;
      blob.rotation.y = time * 0.15;
    });

    packGroup.rotation.y = pointer.x * 0.22;
    packGroup.rotation.x = pointer.y * 0.1;
    blobs.rotation.y = pointer.x * -0.1;
    camera.position.x = pointer.x * 0.32;
    camera.position.y = 0.1 - pointer.y * 0.2;
    camera.lookAt(0, 0, 0);

    render();
  }

  function start() {
    if (frame) return;
    clock.start();
    frame = requestAnimationFrame(tick);
  }

  reframe(camera.aspect);

  if (options.reducedMotion) {
    render();
  } else {
    start();
  }

  return {
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      disposeObject(scene);
      renderer.dispose();
      canvas.remove();
    },
  };
}
