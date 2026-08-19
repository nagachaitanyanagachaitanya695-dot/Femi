import * as THREE from "three";

import type { PackTheme } from "@/lib/types";

export interface PackArt {
  theme: PackTheme;
  /** "XL", "L", "XXL" … */
  size: string;
  /** "320mm" */
  length: string;
  padCount: number;
}

/**
 * Draws the Femi packaging onto a canvas so it can be used as a texture.
 *
 * Everything you see on the 3D pack is generated here — no image assets, which
 * keeps the bundle tiny and lets a new product get artwork automatically from
 * its colours and pack size.
 */

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** The winged pad illustration printed on the pack. */
function drawPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.16)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -150);
  ctx.bezierCurveTo(34, -150, 40, -96, 40, -46);
  ctx.bezierCurveTo(40, 0, 40, 40, 40, 96);
  ctx.bezierCurveTo(40, 142, 30, 156, 0, 156);
  ctx.bezierCurveTo(-30, 156, -40, 142, -40, 96);
  ctx.bezierCurveTo(-40, 40, -40, 0, -40, -46);
  ctx.bezierCurveTo(-40, -96, -34, -150, 0, -150);
  ctx.fill();

  // Wings
  ctx.beginPath();
  ctx.moveTo(-38, -30);
  ctx.bezierCurveTo(-84, -46, -104, -6, -74, 22);
  ctx.bezierCurveTo(-58, 34, -44, 26, -38, 16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(38, -30);
  ctx.bezierCurveTo(84, -46, 104, -6, 74, 22);
  ctx.bezierCurveTo(58, 34, 44, 26, 38, 16);
  ctx.fill();

  ctx.shadowColor = "transparent";

  // Anion strip in the core
  ctx.fillStyle = "#cfe8a8";
  roundedRect(ctx, -18, -34, 36, 78, 8);
  ctx.fill();

  ctx.fillStyle = "#8cc63f";
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      ctx.beginPath();
      ctx.arc(-8 + col * 16, -22 + row * 16, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: string,
  family: string,
  startSize: number,
) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 2;
  } while (ctx.measureText(text).width > maxWidth && size > 10);
}

const SANS = '"Segoe UI", system-ui, -apple-system, Helvetica, Arial, sans-serif';
const SCRIPT = 'Georgia, "Times New Roman", serif';

export function drawPackFront(canvas: HTMLCanvasElement, art: PackArt): void {
  const W = (canvas.width = 1024);
  const H = (canvas.height = 700);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { theme } = art;

  // Base with a soft vertical sheen so the flat colour reads like film.
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, theme.base);
  base.addColorStop(0.55, theme.base);
  base.addColorStop(1, shade(theme.base, -0.1));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Green technology band
  ctx.fillStyle = theme.band;
  ctx.fillRect(W * 0.55, 0, W * 0.17, H);

  // Dark "open here" tab down the right edge
  ctx.fillStyle = theme.tab;
  ctx.beginPath();
  ctx.moveTo(W * 0.78, 0);
  ctx.bezierCurveTo(W * 0.74, H * 0.3, W * 0.74, H * 0.7, W * 0.78, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, 0);
  ctx.closePath();
  ctx.fill();

  // Wordmark
  ctx.fillStyle = theme.ink;
  ctx.font = `italic 700 104px ${SCRIPT}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Femi", 62, 168);

  const femiWidth = ctx.measureText("Femi").width;

  // The "9" mark inside a circle, as on the pack
  ctx.beginPath();
  ctx.arc(62 + femiWidth + 46, 136, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.base;
  ctx.font = `700 44px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("9", 62 + femiWidth + 46, 152);
  ctx.textAlign = "left";

  ctx.fillStyle = theme.ink;
  ctx.font = `500 27px ${SANS}`;
  ctx.fillText("Ultra-thin soft cotton finish pads", 64, 216);

  ctx.font = `700 42px ${SANS}`;
  ctx.fillText("Natural. Comfortable.", 62, 282);
  ctx.fillText("Breathable.", 62, 334);

  ctx.fillStyle = shade(theme.tab, 0.12);
  ctx.font = `700 36px ${SANS}`;
  ctx.fillText("Eco-friendly", 62, 404);
  ctx.fillText("Sanitary Napkins", 62, 448);

  // Feature list on the band
  ctx.fillStyle = theme.ink;
  ctx.font = `600 22px ${SANS}`;
  const features = ["Anion", "FAR-IR", "Magnetic", "Nano Silver", "Chitin"];
  features.forEach((feature, index) => {
    ctx.fillText(feature, W * 0.565, 74 + index * 32);
  });

  drawPad(ctx, W * 0.635, H * 0.6, 0.78);

  // Night + day badge
  ctx.fillStyle = theme.ink;
  ctx.beginPath();
  ctx.arc(W * 0.63, H * 0.885, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.base;
  ctx.font = `600 20px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("☾", W * 0.63, H * 0.895);
  ctx.textAlign = "left";

  ctx.fillStyle = theme.ink;
  ctx.font = `700 28px ${SANS}`;
  ctx.fillText("Night + Day", W * 0.665, H * 0.895);

  // Pack spec line
  const spec = `${art.padCount} Pads  |  ${art.size}  |  ${art.length}`;
  fitText(ctx, spec, W * 0.44, "700", SANS, 40);
  ctx.fillStyle = theme.ink;
  ctx.fillText(spec, 62, H * 0.9);

  // Bottom rule
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(62, H * 0.93);
  ctx.lineTo(W * 0.5, H * 0.93);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.font = `500 19px ${SANS}`;
  ctx.fillText("Resealable pack  ·  Individually wrapped", 62, H * 0.965);

  // Vertical "everyday" script on the tab
  ctx.save();
  ctx.translate(W * 0.9, H * 0.5);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = lighten(theme.base, 0.1);
  ctx.font = `italic 700 60px ${SCRIPT}`;
  ctx.textAlign = "center";
  ctx.fillText("everyday", 0, 16);
  ctx.restore();
}

export function drawPackBack(canvas: HTMLCanvasElement, art: PackArt): void {
  const W = (canvas.width = 1024);
  const H = (canvas.height = 700);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { theme } = art;
  ctx.fillStyle = shade(theme.base, -0.04);
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundedRect(ctx, 60, 70, W - 120, H - 140, 28);
  ctx.fill();

  ctx.fillStyle = theme.ink;
  ctx.font = `italic 700 56px ${SCRIPT}`;
  ctx.fillText("Femi", 100, 150);

  ctx.font = `600 24px ${SANS}`;
  ctx.fillText("What's inside", 100, 210);

  ctx.font = `400 22px ${SANS}`;
  ctx.fillStyle = "#4a3a41";
  const lines = [
    `${art.padCount} individually wrapped pads`,
    `${art.size} · ${art.length} length`,
    "Soft cotton-finish top sheet",
    "Breathable back sheet",
    "Leak guards and wings",
    "Store in a cool, dry place",
  ];
  lines.forEach((line, index) => {
    ctx.fillStyle = theme.band;
    ctx.beginPath();
    ctx.arc(112, 254 + index * 42, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a3a41";
    ctx.fillText(line, 134, 262 + index * 42);
  });

  // Barcode
  ctx.fillStyle = "#1a1a1a";
  let x = W - 320;
  for (let i = 0; i < 46; i += 1) {
    const width = 2 + ((i * 7) % 5);
    ctx.fillRect(x, H - 220, width, 96);
    x += width + 3 + ((i * 3) % 4);
  }
  ctx.font = `500 18px ${SANS}`;
  ctx.fillText("8 901234 567890", W - 318, H - 100);
}

export function drawPackSide(canvas: HTMLCanvasElement, art: PackArt): void {
  const W = (canvas.width = 256);
  const H = (canvas.height = 700);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { theme } = art;
  const gradient = ctx.createLinearGradient(0, 0, W, 0);
  gradient.addColorStop(0, shade(theme.base, -0.18));
  gradient.addColorStop(0.5, theme.base);
  gradient.addColorStop(1, shade(theme.base, -0.18));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = theme.ink;
  ctx.font = `italic 700 64px ${SCRIPT}`;
  ctx.textAlign = "center";
  ctx.fillText(`Femi · ${art.size}`, 0, 22);
  ctx.restore();
}

export function makeTexture(draw: (canvas: HTMLCanvasElement) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  draw(canvas);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* ---------- tiny colour helpers ---------- */

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: number[]): string {
  return `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

export function shade(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  return toHex(rgb.map((v) => v * (1 + amount)));
}

export function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  return toHex(rgb.map((v) => v + (255 - v) * amount));
}
