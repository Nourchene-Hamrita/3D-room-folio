// =============================================================
// Textures.js — procedural canvas textures
// Generates wood, concrete, fabric, metal, screen, and other
// textures at runtime so we don't need any asset files.
// =============================================================

import * as THREE from "three";

const cache = new Map();
function getOrMake(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

// ---------- Helpers ----------
function pseudoRandom(seed) {
  // tiny deterministic PRNG
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function hexToRgb(hex) {
  const c = parseInt(hex.replace("#", ""), 16);
  return { r: (c >> 16) & 255, g: (c >> 8) & 255, b: c & 255 };
}

function mixColor(a, b, t) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function setFill(ctx, color) {
  ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
}

// =============================================================
// Wood plank floor
// =============================================================
export function woodPlankTexture() {
  return getOrMake("woodPlank", 1024, 1024, (ctx, w, h) => {
    const base = hexToRgb("#2a1f1a");
    const dark = hexToRgb("#150a08");
    const light = hexToRgb("#4a3328");
    const rnd = pseudoRandom(42);

    // Background
    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Planks (horizontal)
    const plankH = 128;
    for (let y = 0; y < h; y += plankH) {
      // Per-plank color variation
      const plankTint = mixColor(base, light, rnd() * 0.3);
      setFill(ctx, plankTint);
      ctx.fillRect(0, y, w, plankH);

      // Wood grain
      for (let g = 0; g < 12; g++) {
        const grainY = y + rnd() * plankH;
        const grainAlpha = 0.05 + rnd() * 0.15;
        ctx.strokeStyle = `rgba(20,10,5,${grainAlpha})`;
        ctx.lineWidth = 0.5 + rnd() * 1.5;
        ctx.beginPath();
        let x = 0;
        ctx.moveTo(x, grainY);
        for (x = 0; x < w; x += 8) {
          ctx.lineTo(x, grainY + (rnd() - 0.5) * 3);
        }
        ctx.stroke();
      }

      // Knots
      if (rnd() < 0.3) {
        const kx = rnd() * w;
        const ky = y + plankH * 0.3 + rnd() * plankH * 0.4;
        const kr = 4 + rnd() * 8;
        const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
        g.addColorStop(0, "rgba(0,0,0,0.7)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(kx, ky, kr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Plank separator (dark line)
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, y + plankH - 2, w, 2);
    }

    // Vertical seams (every other plank offset)
    for (let i = 0; i < 10; i++) {
      const seamX = Math.floor(rnd() * (w / 128)) * 128 + rnd() * 30;
      const seamY = (i % 2) * plankH;
      const seamH = plankH + rnd() * 50 - 25;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(seamX, seamY, 1.5, seamH);
    }

    // Subtle overall noise
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rnd() - 0.5) * 16;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);
  });
}

// =============================================================
// Dark concrete / plaster wall
// =============================================================
export function concreteTexture() {
  return getOrMake("concrete", 1024, 1024, (ctx, w, h) => {
    const base = hexToRgb("#1c1828");
    const rnd = pseudoRandom(7);

    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Stippled noise (lots of small dots)
    for (let i = 0; i < 8000; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const a = (rnd() - 0.5) * 30;
      const c = base.r + a;
      ctx.fillStyle = `rgb(${c},${c},${c + 4})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Larger blotches
    for (let i = 0; i < 200; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 5 + rnd() * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tint = mixColor(base, hexToRgb("#3a2f55"), rnd() * 0.3);
      g.addColorStop(0, `rgba(${tint.r},${tint.g},${tint.b},0.4)`);
      g.addColorStop(1, `rgba(${tint.r},${tint.g},${tint.b},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cracks
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 0.5 + rnd() * 1;
      ctx.beginPath();
      let x = rnd() * w;
      let y = rnd() * h;
      ctx.moveTo(x, y);
      for (let s = 0; s < 30; s++) {
        x += (rnd() - 0.5) * 60;
        y += (rnd() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });
}

// =============================================================
// Wall panel pattern (subtle vertical slats)
// =============================================================
export function wallPanelTexture() {
  return getOrMake("wallPanel", 1024, 1024, (ctx, w, h) => {
    const base = hexToRgb("#1f1830");
    const accent = hexToRgb("#2a2240");
    const rnd = pseudoRandom(99);

    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Vertical wood slats
    const slatW = 80;
    for (let x = 0; x < w; x += slatW) {
      // Slight color variation per slat
      const tint = mixColor(base, accent, rnd() * 0.5);
      const g = ctx.createLinearGradient(x, 0, x + slatW, 0);
      g.addColorStop(0, `rgb(${tint.r},${tint.g},${tint.b})`);
      g.addColorStop(0.5, `rgb(${tint.r + 8},${tint.g + 6},${tint.b + 10})`);
      g.addColorStop(1, `rgb(${tint.r},${tint.g},${tint.b})`);
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, slatW, h);

      // Shadow at edges
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(x, 0, 2, h);
      ctx.fillRect(x + slatW - 2, 0, 2, h);
    }

    // Noise overlay
    for (let i = 0; i < 4000; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const v = (rnd() - 0.5) * 20;
      ctx.fillStyle = `rgba(${128 + v},${128 + v},${140 + v},0.4)`;
      ctx.fillRect(x, y, 1, 1);
    }
  });
}

// =============================================================
// Fabric / rug pattern
// =============================================================
export function fabricTexture() {
  return getOrMake("fabric", 512, 512, (ctx, w, h) => {
    const base = hexToRgb("#2a1a40");
    const accent = hexToRgb("#915eff");
    const rnd = pseudoRandom(33);

    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Woven texture (tiny crosses)
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const v = (rnd() - 0.5) * 25;
        ctx.fillStyle = `rgb(${base.r + v},${base.g + v},${base.b + v * 1.5})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Pattern — concentric ovals or stripes
    ctx.strokeStyle = `rgb(${accent.r},${accent.g},${accent.b})`;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    for (let r = 30; r < w; r += 24) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

// =============================================================
// Brushed metal (computer case, monitor stand)
// =============================================================
export function brushedMetalTexture() {
  return getOrMake("brushedMetal", 512, 512, (ctx, w, h) => {
    const base = hexToRgb("#1a1820");
    const rnd = pseudoRandom(11);

    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Horizontal brush lines
    for (let y = 0; y < h; y++) {
      const v = (rnd() - 0.5) * 20;
      ctx.fillStyle = `rgb(${base.r + v},${base.g + v},${base.b + v * 1.2})`;
      ctx.fillRect(0, y, w, 1);
    }
  });
}

// =============================================================
// Wood desk top (richer than floor)
// =============================================================
export function woodDeskTexture() {
  return getOrMake("woodDesk", 1024, 1024, (ctx, w, h) => {
    const base = hexToRgb("#3d2a4a");
    const dark = hexToRgb("#1a0e22");
    const light = hexToRgb("#5a3a6e");
    const rnd = pseudoRandom(123);

    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Long grain lines
    for (let i = 0; i < 80; i++) {
      const y = rnd() * h;
      const a = 0.1 + rnd() * 0.25;
      ctx.strokeStyle = `rgba(20,8,30,${a})`;
      ctx.lineWidth = 0.5 + rnd() * 1.5;
      ctx.beginPath();
      let x = 0;
      ctx.moveTo(x, y);
      for (x = 0; x < w; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.02) * 3 + (rnd() - 0.5) * 2);
      }
      ctx.stroke();
    }

    // Lighter highlight grain
    for (let i = 0; i < 30; i++) {
      const y = rnd() * h;
      ctx.strokeStyle = `rgba(180,150,200,${0.05 + rnd() * 0.1})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      let x = 0;
      ctx.moveTo(x, y);
      for (x = 0; x < w; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.02) * 3);
      }
      ctx.stroke();
    }

    // Subtle noise
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rnd() - 0.5) * 12;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);
  });
}

// =============================================================
// Dark glass / screen
// =============================================================
export function darkGlassTexture() {
  return getOrMake("darkGlass", 512, 512, (ctx, w, h) => {
    // Dark base
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0a0810");
    g.addColorStop(1, "#15101e");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Top reflection
    const r = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    r.addColorStop(0, "rgba(120,100,160,0.15)");
    r.addColorStop(1, "rgba(120,100,160,0)");
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, w, h * 0.4);
  });
}

// =============================================================
// Bump/normal map for desk (faux depth)
// =============================================================
export function deskBumpTexture() {
  return getOrMake("deskBump", 512, 512, (ctx, w, h) => {
    const rnd = pseudoRandom(456);
    setFill(ctx, { r: 128, g: 128, b: 255 });
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const n = (rnd() - 0.5) * 30;
        ctx.fillStyle = `rgb(${128 + n},${128 + n},255)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

// =============================================================
// Floor concrete (with subtle pattern)
// =============================================================
export function floorTexture() {
  return getOrMake("floor", 1024, 1024, (ctx, w, h) => {
    const base = hexToRgb("#15101f");
    const rnd = pseudoRandom(789);

    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Tile lines (large squares)
    const tile = 256;
    for (let x = 0; x < w; x += tile) {
      for (let y = 0; y < h; y += tile) {
        const tint = mixColor(base, hexToRgb("#1a1530"), rnd() * 0.4);
        setFill(ctx, tint);
        ctx.fillRect(x, y, tile, tile);
      }
    }

    // Grout lines
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Noise
    for (let i = 0; i < 5000; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const v = (rnd() - 0.5) * 30;
      ctx.fillStyle = `rgba(${v + 128},${v + 128},${v + 140},0.4)`;
      ctx.fillRect(x, y, 1, 1);
    }
  });
}

// =============================================================
// Ceiling (subtle pattern)
// =============================================================
export function ceilingTexture() {
  return getOrMake("ceiling", 1024, 1024, (ctx, w, h) => {
    const base = hexToRgb("#0a0814");
    const rnd = pseudoRandom(2024);
    setFill(ctx, base);
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    for (let x = 0; x < w; x += 64) {
      ctx.strokeStyle = "rgba(60,40,90,0.3)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 64) {
      ctx.strokeStyle = "rgba(60,40,90,0.3)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Stars
    for (let i = 0; i < 200; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 0.5 + rnd() * 1.5;
      ctx.fillStyle = `rgba(180,180,220,${0.3 + rnd() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
