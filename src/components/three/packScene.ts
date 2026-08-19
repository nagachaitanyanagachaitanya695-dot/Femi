import * as THREE from "three";

import type { PackArt } from "./packTexture";
import { createPackMesh, disposeObject } from "./packMesh";
import type { SceneHandle } from "./heroScene";

interface PackSceneOptions {
  art: PackArt;
  reducedMotion: boolean;
}

/**
 * The product-page viewer: a single pack you can spin with a finger or the
 * mouse. It idles with a slow auto-rotate until the visitor takes over.
 */
export function createPackScene(container: HTMLElement, options: PackSceneOptions): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.touchAction = "pan-y";
  canvas.style.cursor = "grab";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    34,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    50,
  );
  camera.position.set(0, 0, 4.1);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd9e5, 1.4));

  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(2.6, 3.4, 4);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffc2d6, 1.6);
  rim.position.set(-3.4, 1, -2.4);
  scene.add(rim);

  const pack = createPackMesh(options.art);
  pack.rotation.set(0.14, -0.5, -0.02);
  pack.scale.setScalar(1.32);
  scene.add(pack);

  // Soft shadow disc under the pack.
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 48),
    new THREE.MeshBasicMaterial({ color: 0xc4849c, transparent: true, opacity: 0.16 }),
  );
  shadow.position.set(0, -1.02, -0.3);
  shadow.scale.set(1.35, 0.42, 1);
  shadow.rotation.x = -Math.PI / 2.9;
  scene.add(shadow);

  let autoRotate = !options.reducedMotion;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velocity = 0;

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    autoRotate = false;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    pack.rotation.y += dx * 0.008;
    pack.rotation.x = clamp(pack.rotation.x + dy * 0.005, -0.6, 0.6);
    velocity = dx * 0.008;
  };

  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    canvas.style.cursor = "grab";
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  const resize = () => {
    const width = container.clientWidth;
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let visible = true;
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(container);

  let frame = requestAnimationFrame(function tick() {
    frame = requestAnimationFrame(tick);
    if (!visible) return;

    if (autoRotate) {
      pack.rotation.y += 0.0042;
    } else if (!dragging && Math.abs(velocity) > 0.0002) {
      pack.rotation.y += velocity;
      velocity *= 0.94;
    }
    renderer.render(scene, camera);
  });

  if (options.reducedMotion) renderer.render(scene, camera);

  return {
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      disposeObject(scene);
      renderer.dispose();
      canvas.remove();
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
