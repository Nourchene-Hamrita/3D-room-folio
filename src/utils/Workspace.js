// =============================================================
// Workspace.js — procedural 3D dev workspace (textured edition)
//
// Every surface now has a procedural texture from Textures.js.
// The room is built like a real, lived-in developer workspace:
//   - Wood plank floor
//   - Wall paneling + concrete sections
//   - Ceiling with subtle star pattern
//   - Wooden desk (richer color, textured)
//   - 3 monitors with detailed canvas-painted screens
//   - Bookshelf on the side wall
//   - Floating shelves with plants, books, gadgets
//   - Server rack with blinking LEDs
//   - Diploma, posters, clock (all wall-mounted, not floating)
//   - Side table, computer tower, coffee, etc.
// =============================================================

import * as THREE from "three";
import {
  woodPlankTexture,
  woodDeskTexture,
  wallPanelTexture,
  concreteTexture,
  fabricTexture,
  brushedMetalTexture,
  darkGlassTexture,
  floorTexture,
  ceilingTexture,
} from "./Textures.js";

// ---------- Material helpers ----------
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.7,
    metalness: opts.metalness ?? 0.05,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    map: opts.map ?? null,
  });
}

function glowMat(color, intensity = 1.5) {
  return new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.3,
    metalness: 0.0,
  });
}

function mesh(geometry, material, castShadow = true, receiveShadow = true) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  return m;
}

// Helper: a 2D plane with a canvas-rendered image
function makeCanvasTexture(draw, w = 512, h = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Helper: rounded box (creates a box with beveled edges via segments)
function roundedBox(w, h, d, r = 0.05, seg = 4) {
  // Use Three.js BoxGeometry then push corners inward
  // For a real rounded look use RoundedBoxGeometry from drei, but
  // since we're vanilla, we'll approximate with a slightly oversized
  // box and overlaid edge highlights. For a "wood desk" the slight
  // bevel helps with shadowing.
  return new THREE.BoxGeometry(w, h, d, seg, seg, seg);
}

// =============================================================
// ROOM
// =============================================================
function buildRoom(scene) {
  const room = new THREE.Group();
  room.name = "Room";

  // Floor — wood planks (textured)
  const floor = mesh(
    new THREE.BoxGeometry(16, 0.3, 14),
    mat(0xffffff, {
      map: woodPlankTexture(),
      roughness: 0.6,
      metalness: 0.05,
    })
  );
  floor.material.map.repeat.set(2, 2);
  floor.position.y = -0.15;
  floor.receiveShadow = true;
  room.add(floor);

  // Back wall — wall panels
  const backWall = mesh(
    new THREE.BoxGeometry(16, 8, 0.3),
    mat(0xffffff, {
      map: wallPanelTexture(),
      roughness: 0.85,
    })
  );
  backWall.material.map.repeat.set(3, 1);
  backWall.position.set(0, 4, -7);
  backWall.receiveShadow = true;
  room.add(backWall);

  // Side wall (left) — concrete texture
  const leftWall = mesh(
    new THREE.BoxGeometry(0.3, 8, 14),
    mat(0xffffff, {
      map: concreteTexture(),
      roughness: 0.95,
    })
  );
  leftWall.material.map.repeat.set(1, 1.5);
  leftWall.position.set(-8, 4, 0);
  leftWall.receiveShadow = true;
  room.add(leftWall);

  // Side wall (right) — wall panels
  const rightWall = mesh(
    new THREE.BoxGeometry(0.3, 8, 14),
    mat(0xffffff, {
      map: wallPanelTexture(),
      roughness: 0.85,
    })
  );
  rightWall.material.map.repeat.set(1, 1.5);
  rightWall.position.set(8, 4, 0);
  rightWall.receiveShadow = true;
  room.add(rightWall);

  // Ceiling — subtle star pattern
  const ceiling = mesh(
    new THREE.BoxGeometry(16, 0.3, 14),
    mat(0xffffff, {
      map: ceilingTexture(),
      roughness: 0.95,
    })
  );
  ceiling.material.map.repeat.set(2, 2);
  ceiling.position.set(0, 7.85, 0);
  room.add(ceiling);

  // Baseboards
  for (const [x, z, w, h, d, ry] of [
    [0, -6.85, 16, 0.25, 0.05, 0],
    [0, 6.85, 16, 0.25, 0.05, 0],
    [-7.85, 0, 0.05, 0.25, 14, 0],
    [7.85, 0, 0.05, 0.25, 14, 0],
  ]) {
    const base = mesh(
      new THREE.BoxGeometry(w, h, d),
      mat(0x0a0814, { roughness: 0.5 })
    );
    base.position.set(x, 0.125, z);
    room.add(base);
  }

  // Crown molding (top of walls, subtle)
  for (const [x, z, w, h, d] of [
    [0, -6.85, 16, 0.15, 0.08],
    [0, 6.85, 16, 0.15, 0.08],
    [-7.85, 0, 0.08, 0.15, 14],
    [7.85, 0, 0.08, 0.15, 14],
  ]) {
    const crown = mesh(
      new THREE.BoxGeometry(w, h, d),
      mat(0x1a1530, { roughness: 0.4 })
    );
    crown.position.set(x, 7.6, z);
    room.add(crown);
  }

  // Floor accent (subtle violet glow strip — only near the desk, short)
  const floorStrip = mesh(
    new THREE.BoxGeometry(0.06, 0.02, 2.5),
    glowMat(0x915eff, 0.8),
    false,
    false
  );
  floorStrip.position.set(0, 0.005, 1.5);
  room.add(floorStrip);

  // Back wall neon strip accent
  const wallAccent = mesh(
    new THREE.BoxGeometry(8, 0.06, 0.04),
    glowMat(0x915eff, 2),
    false,
    false
  );
  wallAccent.position.set(0, 6.5, -6.83);
  room.add(wallAccent);

  const wallAccent2 = mesh(
    new THREE.BoxGeometry(0.04, 0.04, 8),
    glowMat(0xf272c8, 1.5),
    false,
    false
  );
  wallAccent2.position.set(-7.83, 6.5, 0);
  room.add(wallAccent2);

  scene.add(room);
  return room;
}

// =============================================================
// DESK
// =============================================================
function buildDesk(scene) {
  const desk = new THREE.Group();
  desk.name = "Desk";

  // Desktop — textured wood, rounded corners via slight chamfer geometry
  const topGeo = new THREE.BoxGeometry(5.5, 0.15, 2.4, 6, 2, 6);
  const top = mesh(
    topGeo,
    mat(0xffffff, {
      map: woodDeskTexture(),
      roughness: 0.75,
      metalness: 0.05,
    })
  );
  top.material.map.repeat.set(1, 1);
  top.position.set(0, 1.5, -3);
  top.receiveShadow = true;
  top.castShadow = true;
  desk.add(top);

  // Front edge bevel (a smaller box on the front edge for visual depth)
  const frontBevel = mesh(
    new THREE.BoxGeometry(5.5, 0.07, 0.06),
    mat(0x3d2a4a, { roughness: 0.3, metalness: 0.3 })
  );
  frontBevel.position.set(0, 1.46, -1.83);
  desk.add(frontBevel);

  // Edge LED strip along the front of the desk
  const led = mesh(
    new THREE.BoxGeometry(5.4, 0.025, 0.025),
    glowMat(0x915eff, 2.5),
    false,
    false
  );
  led.position.set(0, 1.5, -1.81);
  desk.add(led);

  // Side bevels
  for (const side of [-1, 1]) {
    const sideBevel = mesh(
      new THREE.BoxGeometry(0.06, 0.07, 2.4),
      mat(0x3d2a4a, { roughness: 0.3 })
    );
    sideBevel.position.set(side * 2.75, 1.46, -3);
    desk.add(sideBevel);
  }

  // Desk legs (metal, brushed)
  const legMat = mat(0xffffff, {
    map: brushedMetalTexture(),
    metalness: 0.8,
    roughness: 0.3,
  });
  const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
  for (const [x, z] of [[-2.6, -4.05], [2.6, -4.05], [-2.6, -1.95], [2.6, -1.95]]) {
    const leg = mesh(legGeo, legMat);
    leg.position.set(x, 0.75, z);
    desk.add(leg);
  }

  // Cross beam under the desk (a small detail)
  const beam = mesh(
    new THREE.BoxGeometry(5.2, 0.06, 0.06),
    mat(0x1a1820, { metalness: 0.6, roughness: 0.4 })
  );
  beam.position.set(0, 0.3, -4.0);
  desk.add(beam);

  scene.add(desk);
  return desk;
}

// =============================================================
// Monitor screens with simulated content
// =============================================================
function makeScreenContentTexture(label) {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);
    // Top window chrome
    ctx.fillStyle = "#151030";
    ctx.fillRect(0, 0, w, 36);
    // Traffic lights
    ctx.fillStyle = "#ff5f57";
    ctx.beginPath(); ctx.arc(18, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffbd2e";
    ctx.beginPath(); ctx.arc(38, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#28c93f";
    ctx.beginPath(); ctx.arc(58, 18, 6, 0, Math.PI * 2); ctx.fill();
    // Filename / tab
    ctx.fillStyle = "#915eff";
    ctx.fillRect(80, 8, 220, 22);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px ui-monospace, monospace";
    ctx.textBaseline = "middle";
    ctx.fillText("~ " + label + ".tsx", 90, 19);
    // Code lines
    const colors = ["#f272c8", "#915eff", "#00f0ff", "#aaa6c3", "#fff", "#7fffaf"];
    const tokens = [
      "const", "Nourchene", "=", "()", "=>", "{",
      "  return", "craft(", "design", ",", "code", ",", "ship",
      ");", "}", "};", "import", "from",
      "  useEffect", "(", "=>", "{", "}", ");",
      "  <div", "className=", '"app"', ">",
    ];
    let y = 70;
    let lineNo = 1;
    let x = 30;
    const lineHeight = 28;
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = "#3a3548";
      ctx.font = "12px ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(lineNo), 22, y);
      ctx.textAlign = "left";
      x = 36;
      const wordsThisLine = 4 + Math.floor(Math.random() * 5);
      for (let j = 0; j < wordsThisLine; j++) {
        const tk = tokens[Math.floor(Math.random() * tokens.length)];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.font = "13px ui-monospace, monospace";
        ctx.fillText(tk, x, y);
        x += ctx.measureText(tk).width + 8;
        if (x > w - 30) break;
      }
      y += lineHeight;
      lineNo++;
      if (y > h - 30) break;
    }
  }, 640, 400);
}

function makeSideScreenTexture(palette, bigText) {
  return makeCanvasTexture((ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, palette[0]);
    grad.addColorStop(1, palette[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 90px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(bigText, w / 2, h / 2);
  }, 512, 320);
}

// =============================================================
// TRIPLE MONITOR SETUP
// =============================================================
function buildMonitors(scene, parent) {
  // Center monitor (largest) — bezel
  const centerBezel = mesh(
    new THREE.BoxGeometry(2.1, 1.3, 0.08),
    mat(0x0a0a14, { map: brushedMetalTexture(), metalness: 0.6, roughness: 0.4 })
  );
  centerBezel.position.set(0, 2.5, -4.7);
  parent.add(centerBezel);

  // Center monitor screen
  const centerTex = makeScreenContentTexture("portfolio");
  const centerScreen = mesh(
    new THREE.PlaneGeometry(1.95, 1.15),
    new THREE.MeshStandardMaterial({
      map: centerTex,
      emissiveMap: centerTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.85,
      roughness: 0.4,
    }),
    false,
    false
  );
  centerScreen.position.set(0, 2.5, -4.65);
  centerScreen.userData = { interactiveId: "monitor", label: "My work" };
  parent.add(centerScreen);

  // Stand neck
  const centerNeck = mesh(
    new THREE.BoxGeometry(0.08, 0.35, 0.08),
    mat(0x1a1820, { metalness: 0.7, roughness: 0.3 })
  );
  centerNeck.position.set(0, 2.18, -4.7);
  parent.add(centerNeck);

  // Stand base (round)
  const centerBase = mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.05, 24),
    mat(0x1a1820, { metalness: 0.6, roughness: 0.4 })
  );
  centerBase.position.set(0, 2.0, -4.7);
  parent.add(centerBase);

  // Side monitor (left)
  const leftBezel = mesh(
    new THREE.BoxGeometry(1.25, 0.9, 0.07),
    mat(0x0a0a14, { metalness: 0.6, roughness: 0.4 })
  );
  leftBezel.position.set(-1.8, 2.45, -4.65);
  leftBezel.rotation.y = 0.3;
  parent.add(leftBezel);

  const leftTex = makeSideScreenTexture(["#00f0ff", "#050816"], "</>");
  const leftScreen = mesh(
    new THREE.PlaneGeometry(1.12, 0.78),
    new THREE.MeshStandardMaterial({
      map: leftTex,
      emissiveMap: leftTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.7,
      roughness: 0.5,
    }),
    false,
    false
  );
  leftScreen.position.set(-1.8, 2.45, -4.61);
  leftScreen.rotation.y = 0.3;
  parent.add(leftScreen);

  // Side monitor (right)
  const rightBezel = mesh(
    new THREE.BoxGeometry(1.25, 0.9, 0.07),
    mat(0x0a0a14, { metalness: 0.6, roughness: 0.4 })
  );
  rightBezel.position.set(1.8, 2.45, -4.65);
  rightBezel.rotation.y = -0.3;
  parent.add(rightBezel);

  const rightTex = makeSideScreenTexture(["#f272c8", "#915eff"], "{}");
  const rightScreen = mesh(
    new THREE.PlaneGeometry(1.12, 0.78),
    new THREE.MeshStandardMaterial({
      map: rightTex,
      emissiveMap: rightTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.7,
      roughness: 0.5,
    }),
    false,
    false
  );
  rightScreen.position.set(1.8, 2.45, -4.61);
  rightScreen.rotation.y = -0.3;
  parent.add(rightScreen);
}

// =============================================================
// KEYBOARD + MOUSE
// =============================================================
function buildPeripherals(scene, parent) {
  // Keyboard — Razer-style, dark with RGB underglow
  const keyboard = mesh(
    new THREE.BoxGeometry(0.95, 0.04, 0.32),
    mat(0x0a0814, { metalness: 0.4, roughness: 0.4 })
  );
  keyboard.position.set(-0.5, 1.59, -2.6);
  parent.add(keyboard);

  // Underglow
  const keyboardGlow = mesh(
    new THREE.BoxGeometry(0.95, 0.01, 0.32),
    glowMat(0x915eff, 2.5)
  );
  keyboardGlow.position.set(-0.5, 1.575, -2.6);
  parent.add(keyboardGlow);

  // Keys
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 14; c++) {
      const keyColor = r === 4 ? 0x915eff : 0x1a1820;
      const key = mesh(
        new THREE.BoxGeometry(0.05, 0.018, 0.05),
        mat(keyColor, { metalness: 0.2 })
      );
      key.position.set(-1.0 + c * 0.07, 1.612, -2.74 + r * 0.07);
      key.castShadow = false;
      parent.add(key);
    }
  }

  // Mouse
  const mouse = mesh(
    new THREE.BoxGeometry(0.1, 0.04, 0.16),
    mat(0x0a0814, { metalness: 0.4, roughness: 0.4 })
  );
  mouse.position.set(0.75, 1.59, -2.55);
  parent.add(mouse);

  // Mouse pad
  const pad = mesh(
    new THREE.BoxGeometry(0.4, 0.01, 0.4),
    mat(0x1a1530, { roughness: 0.6 })
  );
  pad.position.set(0.75, 1.575, -2.55);
  parent.add(pad);

  // Mousepad RGB edge
  const padEdge = mesh(
    new THREE.BoxGeometry(0.4, 0.005, 0.01),
    glowMat(0xf272c8, 2)
  );
  padEdge.position.set(0.75, 1.582, -2.35);
  parent.add(padEdge);
}

// =============================================================
// LAPTOP
// =============================================================
function buildLaptop(scene, parent) {
  const group = new THREE.Group();

  // Base (Macbook-style)
  const base = mesh(
    new THREE.BoxGeometry(0.95, 0.04, 0.65),
    mat(0x1a1820, { map: brushedMetalTexture(), metalness: 0.7, roughness: 0.3 })
  );
  base.position.set(1.85, 1.58, -3.4);
  group.add(base);

  // Hinge
  const hinge = mesh(
    new THREE.BoxGeometry(0.95, 0.02, 0.04),
    mat(0x222, { metalness: 0.6 })
  );
  hinge.position.set(1.85, 1.6, -3.71);
  group.add(hinge);

  // Screen back
  const screen = mesh(
    new THREE.BoxGeometry(0.9, 0.58, 0.03),
    mat(0x1a1820, { map: brushedMetalTexture(), metalness: 0.7, roughness: 0.3 })
  );
  screen.position.set(1.85, 1.98, -3.73);
  screen.rotation.x = -0.2;
  screen.userData = { interactiveId: "laptop", label: "About me" };
  group.add(screen);

  // Screen face (glowing)
  const faceTex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#1a1530";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#915eff";
    ctx.font = "bold 80px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("</>", w / 2, h / 2 - 30);
    ctx.fillStyle = "#f272c8";
    ctx.font = "bold 30px 'Poppins', sans-serif";
    ctx.fillText("Nourchene", w / 2, h / 2 + 50);
  }, 512, 320);
  const face = mesh(
    new THREE.PlaneGeometry(0.82, 0.5),
    new THREE.MeshStandardMaterial({
      map: faceTex,
      emissiveMap: faceTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    }),
    false,
    false
  );
  face.position.set(1.85, 1.98, -3.71);
  face.rotation.x = -0.2;
  group.add(face);

  // Apple-style logo (just a glowing dot)
  const logo = mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    glowMat(0xffffff, 0.3)
  );
  logo.position.set(1.85, 1.98, -3.72);
  logo.rotation.x = -0.2;
  group.add(logo);

  parent.add(group);
}

// =============================================================
// PHONE
// =============================================================
function buildPhone(scene, parent) {
  const group = new THREE.Group();

  // Body
  const phone = mesh(
    new THREE.BoxGeometry(0.13, 0.27, 0.018),
    mat(0x0a0814, { metalness: 0.7, roughness: 0.3 })
  );
  phone.position.set(-1.9, 1.62, -3.0);
  phone.rotation.x = -0.4;
  phone.userData = { interactiveId: "phone", label: "Get in touch" };
  group.add(phone);

  // Screen
  const screenTex = makeCanvasTexture((ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#f272c8");
    g.addColorStop(1, "#915eff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 40px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📞", w / 2, h / 2);
  }, 256, 512);
  const screen = mesh(
    new THREE.PlaneGeometry(0.115, 0.23),
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissiveMap: screenTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    }),
    false,
    false
  );
  screen.position.set(-1.9, 1.62, -2.99);
  screen.rotation.x = -0.4;
  group.add(screen);

  parent.add(group);
}

// =============================================================
// BOOKS on desk
// =============================================================
function buildBooks(scene, parent) {
  const group = new THREE.Group();

  const bookData = [
    { color: 0x915eff, h: 0.28, t: "Clean Code" },
    { color: 0xf272c8, h: 0.32, t: "Refactoring" },
    { color: 0x00f0ff, h: 0.25, t: "DDD" },
  ];
  for (let i = 0; i < bookData.length; i++) {
    const d = bookData[i];
    const book = mesh(
      new THREE.BoxGeometry(0.2, d.h, 0.14),
      mat(d.color, { roughness: 0.6 })
    );
    book.position.set(-2.0 + i * 0.22, 1.5 + d.h / 2, -2.4);
    book.rotation.z = (i - 1) * 0.05;
    book.userData = {
      interactiveId: "books",
      label: i === 0 ? "Full-Stack project" : "More work",
    };
    group.add(book);
  }

  parent.add(group);
}

// =============================================================
// PLANT (bigger, more detailed)
// =============================================================
function buildPlant(scene, parent) {
  const group = new THREE.Group();

  // Pot (terracotta-ish)
  const pot = mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.32, 16),
    mat(0x3a2a45, { roughness: 0.7 })
  );
  pot.position.set(1.5, 1.68, -2.5);
  pot.userData = { interactiveId: "plant", label: "AI agent project" };
  group.add(pot);

  // Pot rim
  const rim = mesh(
    new THREE.TorusGeometry(0.22, 0.015, 6, 16),
    mat(0x2a1a35, { roughness: 0.7 })
  );
  rim.position.set(1.5, 1.84, -2.5);
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Soil
  const soil = mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16),
    mat(0x1a0e0a, { roughness: 1 })
  );
  soil.position.set(1.5, 1.85, -2.5);
  group.add(soil);

  // Leaves — varied sizes and angles (no emissive so they don't blow out)
  const leafColors = [0x3aff8c, 0x2ad96b, 0x4fff9a];
  for (let i = 0; i < 7; i++) {
    const leaf = mesh(
      new THREE.ConeGeometry(0.1 + Math.random() * 0.05, 0.35 + Math.random() * 0.3, 6),
      mat(leafColors[i % leafColors.length], { roughness: 0.6 })
    );
    const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.3;
    const r = 0.05 + Math.random() * 0.05;
    leaf.position.set(
      1.5 + Math.cos(angle) * r,
      2.05 + Math.random() * 0.15,
      -2.5 + Math.sin(angle) * r
    );
    leaf.rotation.z = Math.cos(angle) * 0.4;
    leaf.rotation.x = Math.sin(angle) * 0.4;
    group.add(leaf);
  }

  // Tall central leaf
  const tallLeaf = mesh(
    new THREE.ConeGeometry(0.15, 0.85, 6),
    mat(0x2ad96b, { roughness: 0.6 })
  );
  tallLeaf.position.set(1.5, 2.35, -2.5);
  group.add(tallLeaf);

  parent.add(group);
}

// =============================================================
// COFFEE
// =============================================================
function buildCoffee(scene, parent) {
  const group = new THREE.Group();

  // Saucer
  const saucer = mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.01, 16),
    mat(0xffffff, { roughness: 0.5 })
  );
  saucer.position.set(-1.6, 1.575, -3.5);
  group.add(saucer);

  // Cup
  const cup = mesh(
    new THREE.CylinderGeometry(0.08, 0.07, 0.14, 16),
    mat(0xf272c8, { map: darkGlassTexture(), roughness: 0.4 })
  );
  cup.position.set(-1.6, 1.65, -3.5);
  cup.userData = { interactiveId: "coffee", label: "Mobile app" };
  group.add(cup);

  // Coffee surface
  const coffee = mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 0.005, 16),
    mat(0x2a1408, { roughness: 0.4 })
  );
  coffee.position.set(-1.6, 1.72, -3.5);
  group.add(coffee);

  // Handle
  const handle = mesh(
    new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI),
    mat(0xf272c8, { roughness: 0.4 })
  );
  handle.position.set(-1.52, 1.65, -3.5);
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  // Steam
  for (let i = 0; i < 4; i++) {
    const steam = mesh(
      new THREE.SphereGeometry(0.018, 6, 6),
      mat(0xffffff, { transparent: true, opacity: 0.15 })
    );
    steam.position.set(-1.6 + (Math.random() - 0.5) * 0.04, 1.78 + i * 0.06, -3.5);
    steam.userData = { isSteam: true, baseY: steam.position.y };
    group.add(steam);
  }

  parent.add(group);
}

// =============================================================
// DESK ACCESSORIES (pen holder, sticky note, notebook)
// =============================================================
function buildDeskAccessories(scene, parent) {
  // Pen holder
  const holder = mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16),
    mat(0x1a1820, { metalness: 0.4, roughness: 0.5 })
  );
  holder.position.set(-1.0, 1.65, -3.5);
  parent.add(holder);

  // Pens
  for (let i = 0; i < 3; i++) {
    const pen = mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6),
      mat([0x915eff, 0xf272c8, 0x00f0ff][i], { metalness: 0.4 })
    );
    pen.position.set(-1.0 + (i - 1) * 0.03, 1.77, -3.5);
    pen.rotation.z = (i - 1) * 0.15;
    parent.add(pen);
  }

  // Sticky notes (stack of 3)
  for (let i = 0; i < 3; i++) {
    const sticky = mesh(
      new THREE.BoxGeometry(0.18, 0.005, 0.18),
      mat([0xfff5e0, 0xf272c8, 0x00f0ff][i], { roughness: 0.9 })
    );
    sticky.position.set(0.3, 1.575 + i * 0.005, -3.3);
    sticky.rotation.y = -0.3 + i * 0.1;
    parent.add(sticky);
  }

  // Notebook
  const notebook = mesh(
    new THREE.BoxGeometry(0.45, 0.025, 0.32),
    mat(0x1a1530, { roughness: 0.7 })
  );
  notebook.position.set(-0.2, 1.585, -3.6);
  notebook.rotation.y = 0.1;
  parent.add(notebook);

  // Lines on notebook
  for (let i = 0; i < 5; i++) {
    const line = mesh(
      new THREE.BoxGeometry(0.35, 0.005, 0.005),
      glowMat(0x915eff, 0.7)
    );
    line.position.set(-0.2, 1.6, -3.46 + i * 0.04);
    line.rotation.y = 0.1;
    parent.add(line);
  }

  // Mug (different from coffee - white ceramic)
  const mug = mesh(
    new THREE.CylinderGeometry(0.08, 0.075, 0.12, 16),
    mat(0xffffff, { roughness: 0.5 })
  );
  mug.position.set(1.1, 1.62, -3.4);
  parent.add(mug);

  // Mug text
  const mugHandle = mesh(
    new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI),
    mat(0xffffff, { roughness: 0.5 })
  );
  mugHandle.position.set(1.18, 1.62, -3.4);
  mugHandle.rotation.y = Math.PI / 2;
  parent.add(mugHandle);
}

// =============================================================
// SERVER RACK
// =============================================================
function buildServerRack(scene, parent) {
  const group = new THREE.Group();

  // Cabinet
  const cabinet = mesh(
    new THREE.BoxGeometry(1.0, 2.2, 0.7),
    mat(0xffffff, { map: brushedMetalTexture(), metalness: 0.6, roughness: 0.4 })
  );
  cabinet.position.set(-6, 1.1, -4.5);
  group.add(cabinet);

  // Cabinet accent strip
  const accent = mesh(
    new THREE.BoxGeometry(0.04, 2.0, 0.04),
    glowMat(0x915eff, 2.5)
  );
  accent.position.set(-5.5, 1.1, -4.18);
  group.add(accent);

  // Server units
  for (let i = 0; i < 8; i++) {
    const unit = mesh(
      new THREE.BoxGeometry(0.9, 0.22, 0.6),
      mat(0x0a0814, { metalness: 0.6, roughness: 0.4 })
    );
    unit.position.set(-6, 0.3 + i * 0.25, -4.48);
    group.add(unit);

    // Vents
    for (let j = 0; j < 4; j++) {
      const vent = mesh(
        new THREE.BoxGeometry(0.04, 0.005, 0.55),
        mat(0x222, { metalness: 0.4 })
      );
      vent.position.set(-6.1 + j * 0.08, 0.3 + i * 0.25, -4.48);
      group.add(vent);
    }

    // LEDs
    for (let j = 0; j < 3; j++) {
      const led = mesh(
        new THREE.SphereGeometry(0.02, 6, 6),
        glowMat(j === 0 ? 0x00f0ff : j === 1 ? 0x915eff : 0xf272c8, 2)
      );
      led.position.set(-5.8 + j * 0.08, 0.3 + i * 0.25, -4.2);
      group.add(led);
    }
  }

  // Main interactive hitbox
  const hitbox = mesh(
    new THREE.BoxGeometry(1.05, 2.3, 0.75),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitbox.position.set(-6, 1.1, -4.5);
  hitbox.userData = { interactiveId: "server", label: "Automation" };
  group.add(hitbox);

  parent.add(group);
}

// =============================================================
// BOOKSHELF on the left wall
// =============================================================
function buildBookshelf(scene, parent) {
  const group = new THREE.Group();

  // Shelf bracket back (against the wall)
  const back = mesh(
    new THREE.BoxGeometry(2.4, 2.5, 0.05),
    mat(0x1a1530, { roughness: 0.8 })
  );
  back.position.set(-6.0, 3.5, -5.5);
  group.add(back);

  // Shelves (5 of them)
  for (let i = 0; i < 5; i++) {
    const shelf = mesh(
      new THREE.BoxGeometry(2.4, 0.06, 0.6),
      mat(0x3d2a4a, { roughness: 0.6 })
    );
    shelf.position.set(-6.0, 1.0 + i * 0.5, -5.2);
    group.add(shelf);

    // Books on the shelf (different colors and sizes)
    for (let b = 0; b < 6; b++) {
      const colors = [0x915eff, 0xf272c8, 0x00f0ff, 0x4a3a6e, 0x1a1530, 0x6a5a8e];
      const bookHeight = 0.2 + Math.random() * 0.18;
      const book = mesh(
        new THREE.BoxGeometry(0.12, bookHeight, 0.4),
        mat(colors[Math.floor(Math.random() * colors.length)], { roughness: 0.7 })
      );
      book.position.set(
        -7.1 + b * 0.22,
        1.03 + i * 0.5 + bookHeight / 2,
        -5.2
      );
      book.rotation.z = (Math.random() - 0.5) * 0.05;
      group.add(book);
    }

    // Decorative item on some shelves
    if (i === 1) {
      // Plant on shelf
      const plantPot = mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.1, 12),
        mat(0x915eff, { roughness: 0.7 })
      );
      plantPot.position.set(-7.0, 1.07 + i * 0.5, -5.0);
      group.add(plantPot);

      const plantLeaf = mesh(
        new THREE.ConeGeometry(0.08, 0.25, 6),
        mat(0x2ad96b, { roughness: 0.6 })
      );
      plantLeaf.position.set(-7.0, 1.25 + i * 0.5, -5.0);
      group.add(plantLeaf);
    }

    if (i === 3) {
      // Mug on shelf
      const m = mesh(
        new THREE.CylinderGeometry(0.06, 0.055, 0.1, 12),
        mat(0xf272c8, { roughness: 0.5 })
      );
      m.position.set(-5.1, 1.08 + i * 0.5, -5.0);
      group.add(m);
    }
  }

  parent.add(group);
}

// =============================================================
// FLOATING SHELVES on back wall (above desk)
// =============================================================
function buildFloatingShelves(scene, parent) {
  const group = new THREE.Group();

  // Two floating shelves on the back wall
  const shelves = [
    { y: 5.5, x: -4.0, items: "gadgets" },
    { y: 5.5, x: 4.0, items: "books" },
  ];

  for (const shelf of shelves) {
    // Bracket (L-shaped, made of 2 boxes)
    const bracket = mesh(
      new THREE.BoxGeometry(0.04, 0.04, 0.25),
      mat(0x1a1820, { metalness: 0.5 })
    );
    bracket.position.set(shelf.x - 0.4, shelf.y - 0.02, -6.85);
    group.add(bracket);
    const bracket2 = mesh(
      new THREE.BoxGeometry(0.04, 0.04, 0.25),
      mat(0x1a1820, { metalness: 0.5 })
    );
    bracket2.position.set(shelf.x + 0.4, shelf.y - 0.02, -6.85);
    group.add(bracket2);

    // Shelf plank
    const plank = mesh(
      new THREE.BoxGeometry(1.2, 0.05, 0.3),
      mat(0x3d2a4a, { map: woodDeskTexture(), roughness: 0.5 })
    );
    plank.position.set(shelf.x, shelf.y, -6.75);
    group.add(plank);

    // Items on the shelf
    if (shelf.items === "gadgets") {
      // Headphones (simplified)
      const headBand = mesh(
        new THREE.TorusGeometry(0.12, 0.015, 6, 16, Math.PI),
        mat(0x1a1820, { metalness: 0.5 })
      );
      headBand.position.set(shelf.x - 0.3, shelf.y + 0.13, -6.75);
      headBand.rotation.x = Math.PI / 2;
      group.add(headBand);

      const earcupL = mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
        mat(0x915eff, { metalness: 0.4 })
      );
      earcupL.position.set(shelf.x - 0.3 - 0.12, shelf.y + 0.04, -6.75);
      group.add(earcupL);

      const earcupR = mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
        mat(0x915eff, { metalness: 0.4 })
      );
      earcupR.position.set(shelf.x - 0.3 + 0.12, shelf.y + 0.04, -6.75);
      group.add(earcupR);

      // Small figurine
      const fig = mesh(
        new THREE.BoxGeometry(0.1, 0.2, 0.1),
        mat(0xf272c8, { roughness: 0.5 })
      );
      fig.position.set(shelf.x + 0.2, shelf.y + 0.13, -6.75);
      group.add(fig);
      const head = mesh(
        new THREE.SphereGeometry(0.06, 12, 12),
        mat(0xdfd9ff, { roughness: 0.5 })
      );
      head.position.set(shelf.x + 0.2, shelf.y + 0.27, -6.75);
      group.add(head);
    } else {
      // Stack of books
      for (let i = 0; i < 3; i++) {
        const b = mesh(
          new THREE.BoxGeometry(0.18, 0.06, 0.22),
          mat([0x915eff, 0xf272c8, 0x00f0ff][i], { roughness: 0.7 })
        );
        b.position.set(shelf.x, shelf.y + 0.04 + i * 0.06, -6.75);
        b.rotation.y = i * 0.05;
        group.add(b);
      }

      // Plant
      const p = mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12),
        mat(0x1a1820, { roughness: 0.7 })
      );
      p.position.set(shelf.x + 0.4, shelf.y + 0.07, -6.75);
      group.add(p);
      const leaf = mesh(
        new THREE.ConeGeometry(0.06, 0.2, 6),
        mat(0x2ad96b, { roughness: 0.6 })
      );
      leaf.position.set(shelf.x + 0.4, shelf.y + 0.2, -6.75);
      group.add(leaf);
    }
  }

  parent.add(group);
}

// =============================================================
// DIPLOMA on back wall
// =============================================================
function buildDiploma(scene, parent) {
  const group = new THREE.Group();

  // Frame outer
  const frame = mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.05),
    mat(0x915eff, { metalness: 0.4, roughness: 0.4 })
  );
  frame.position.set(2.5, 5.0, -6.85);
  group.add(frame);

  // Frame inner (matted)
  const matte = mesh(
    new THREE.BoxGeometry(1.3, 0.9, 0.04),
    mat(0x1a1530, { roughness: 0.5 })
  );
  matte.position.set(2.5, 5.0, -6.83);
  group.add(matte);

  // Paper (diploma content) - use plane so texture maps cleanly
  const diplomaTex = makeCanvasTexture((ctx, w, h) => {
    // Dark background so it's visible on the wall
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, w, h);
    // Border
    ctx.strokeStyle = "#915eff";
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, w - 60, h - 60);
    // Title
    ctx.fillStyle = "#dfd9ff";
    ctx.textAlign = "center";
    ctx.font = "bold 56px 'Poppins', sans-serif";
    ctx.fillText("DIPLOMA", w / 2, 120);
    // Awarded to
    ctx.fillStyle = "#aaa6c3";
    ctx.font = "italic 20px 'Poppins', sans-serif";
    ctx.fillText("awarded to", w / 2, 200);
    // Name
    ctx.font = "bold italic 60px 'Poppins', sans-serif";
    ctx.fillStyle = "#f272c8";
    ctx.fillText("Nourchene Hamrita", w / 2, 300);
    // Description
    ctx.fillStyle = "#dfd9ff";
    ctx.font = "18px 'Poppins', sans-serif";
    const lines = [
      "for outstanding achievement in",
      "Software Engineering, Web Development,",
      "and Design — a future built by code.",
    ];
    lines.forEach((l, i) => ctx.fillText(l, w / 2, 360 + i * 28));
    // Signatures
    ctx.font = "italic 18px 'Poppins', sans-serif";
    ctx.fillText("Nourchene H.", w * 0.25, 440);
    ctx.fillText("2024 — 2026", w * 0.75, 440);
  }, 600, 480);
  const paper = mesh(
    new THREE.PlaneGeometry(1.2, 0.8),
    new THREE.MeshStandardMaterial({
      map: diplomaTex,
      emissiveMap: diplomaTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      roughness: 0.6,
    }),
    false,
    false
  );
  paper.position.set(2.5, 5.0, -6.81);
  group.add(paper);

  // Subtle glow (very small one — the diploma content shows, not the glow)
  const glow = mesh(
    new THREE.PlaneGeometry(1.3, 0.9),
    glowMat(0x915eff, 0.08)
  );
  glow.position.set(2.5, 5.0, -6.88);
  glow.userData = { interactiveId: "diploma", label: "About me" };
  group.add(glow);

  parent.add(group);
}

// =============================================================
// POSTERS
// =============================================================
function buildPosters(scene, parent) {
  // Big poster
  const poster1Tex = makeCanvasTexture((ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0a0a1a");
    g.addColorStop(1, "#3a1f55");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 60px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("</>", w / 2, h / 2 - 50);
    ctx.font = "bold 36px 'Poppins', sans-serif";
    ctx.fillStyle = "#f272c8";
    ctx.fillText("BUILD. SHIP.", w / 2, h / 2 + 20);
    ctx.fillText("REPEAT.", w / 2, h / 2 + 65);
    ctx.fillStyle = "#915eff";
    ctx.fillRect(0, h - 12, w, 12);
  }, 512, 768);
  const poster1 = mesh(
    new THREE.PlaneGeometry(1.1, 1.65),
    new THREE.MeshStandardMaterial({
      map: poster1Tex,
      emissiveMap: poster1Tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.4,
      roughness: 0.7,
    }),
    false,
    false
  );
  poster1.position.set(-5, 4.5, -6.86);
  parent.add(poster1);

  // Smaller poster - "GIT PUSH" style
  const poster2Tex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#0a0814";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#915eff";
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.fillStyle = "#f272c8";
    ctx.font = "bold 60px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GIT", w / 2, h / 2 - 50);
    ctx.fillStyle = "#00f0ff";
    ctx.fillText("PUSH", w / 2, h / 2 + 30);
    ctx.fillStyle = "#aaa6c3";
    ctx.font = "20px 'Poppins', sans-serif";
    ctx.fillText("force the future", w / 2, h / 2 + 90);
  }, 400, 600);
  const poster2 = mesh(
    new THREE.PlaneGeometry(0.8, 1.2),
    new THREE.MeshStandardMaterial({
      map: poster2Tex,
      emissiveMap: poster2Tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.4,
      roughness: 0.7,
    }),
    false,
    false
  );
  poster2.position.set(-2, 4.0, -6.86);
  parent.add(poster2);

  // Code snippet poster (right side)
  const poster3Tex = makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);
    // Title
    ctx.fillStyle = "#915eff";
    ctx.fillRect(0, 0, w, 50);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("~/nourchene", w / 2, 25);
    // Code
    const lines = [
      "while (!ship) {",
      "  design();",
      "  code();",
      "  test();",
      "  ship = true;",
      "}",
    ];
    const colors = ["#f272c8", "#915eff", "#00f0ff", "#fff", "#aaa6c3"];
    ctx.textAlign = "left";
    lines.forEach((line, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.font = "26px ui-monospace, monospace";
      ctx.fillText(line, 30, 120 + i * 45);
    });
  }, 500, 700);
  const poster3 = mesh(
    new THREE.PlaneGeometry(1.0, 1.4),
    new THREE.MeshStandardMaterial({
      map: poster3Tex,
      emissiveMap: poster3Tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.4,
      roughness: 0.7,
    }),
    false,
    false
  );
  poster3.position.set(5.5, 4.5, -6.86);
  parent.add(poster3);
}

// =============================================================
// WALL CLOCK
// =============================================================
function buildClock(scene, parent) {
  const group = new THREE.Group();

  // Frame
  const frame = mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.06, 32),
    mat(0x1a1530, { map: brushedMetalTexture(), metalness: 0.6, roughness: 0.4 })
  );
  frame.rotation.x = Math.PI / 2;
  frame.position.set(5.5, 6.0, -6.85);
  group.add(frame);

  // Face
  const face = mesh(
    new THREE.CircleGeometry(0.42, 32),
    mat(0xdfd9ff, { roughness: 0.5 })
  );
  face.position.set(5.5, 6.0, -6.82);
  group.add(face);

  // Tick marks
  for (let i = 0; i < 12; i++) {
    const tick = mesh(
      new THREE.BoxGeometry(0.02, 0.06, 0.01),
      mat(0x915eff, { metalness: 0.3 })
    );
    const a = (i / 12) * Math.PI * 2;
    tick.position.set(5.5 + Math.cos(a - Math.PI / 2) * 0.36, 6.0 + Math.sin(a - Math.PI / 2) * 0.36, -6.81);
    tick.rotation.z = a;
    group.add(tick);
  }

  // Center dot
  const pin = mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12),
    mat(0x915eff, { metalness: 0.6 })
  );
  pin.rotation.x = Math.PI / 2;
  pin.position.set(5.5, 6.0, -6.78);
  group.add(pin);

  // Hands
  const hourHand = mesh(
    new THREE.BoxGeometry(0.04, 0.2, 0.01),
    mat(0x915eff, { emissive: 0x915eff, emissiveIntensity: 0.3 })
  );
  hourHand.position.set(5.5, 5.92, -6.79);
  group.add(hourHand);
  hourHand.userData.isClockHand = "hour";

  const minuteHand = mesh(
    new THREE.BoxGeometry(0.03, 0.3, 0.01),
    mat(0xf272c8, { emissive: 0xf272c8, emissiveIntensity: 0.3 })
  );
  minuteHand.position.set(5.5, 5.86, -6.79);
  group.add(minuteHand);
  minuteHand.userData.isClockHand = "minute";

  parent.add(group);
  return group;
}

// =============================================================
// COMPUTER TOWER (under the desk)
// =============================================================
function buildComputerTower(scene, parent) {
  const group = new THREE.Group();

  // Tower
  const tower = mesh(
    new THREE.BoxGeometry(0.5, 1.0, 0.6),
    mat(0x0a0814, { map: brushedMetalTexture(), metalness: 0.6, roughness: 0.4 })
  );
  tower.position.set(-2.0, 0.5, -3.5);
  group.add(tower);

  // Front panel (glass with RGB inside)
  const frontGlass = mesh(
    new THREE.PlaneGeometry(0.42, 0.8),
    mat(0x915eff, {
      transparent: true,
      opacity: 0.4,
      emissive: 0x915eff,
      emissiveIntensity: 0.5,
    })
  );
  frontGlass.position.set(-2.0, 0.5, -3.19);
  group.add(frontGlass);

  // RGB strip inside
  const rgb = mesh(
    new THREE.BoxGeometry(0.05, 0.7, 0.01),
    glowMat(0x915eff, 3)
  );
  rgb.position.set(-2.15, 0.5, -3.18);
  group.add(rgb);

  // Power button
  const power = mesh(
    new THREE.CircleGeometry(0.03, 12),
    glowMat(0x00f0ff, 2)
  );
  power.position.set(-2.0, 0.85, -3.19);
  group.add(power);

  parent.add(group);
}

// =============================================================
// SIDE TABLE with second plant
// =============================================================
function buildSideTable(scene, parent) {
  const group = new THREE.Group();

  // Table top
  const top = mesh(
    new THREE.BoxGeometry(0.8, 0.06, 0.8),
    mat(0x3d2a4a, { map: woodDeskTexture(), roughness: 0.5 })
  );
  top.position.set(5, 0.95, -3);
  group.add(top);

  // Legs
  for (const [x, z] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) {
    const leg = mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.92, 8),
      mat(0x1a1820, { metalness: 0.5 })
    );
    leg.position.set(5 + x, 0.46, -3 + z);
    group.add(leg);
  }

  // Lamp on the side table
  const lampBase = mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16),
    mat(0x1a1820, { metalness: 0.4 })
  );
  lampBase.position.set(5, 1.0, -3);
  group.add(lampBase);

  const lampPole = mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8),
    mat(0x1a1820, { metalness: 0.5 })
  );
  lampPole.position.set(5, 1.27, -3);
  group.add(lampPole);

  const lampShade = mesh(
    new THREE.ConeGeometry(0.18, 0.18, 16, 1, true),
    mat(0xf272c8, { metalness: 0.3, side: THREE.DoubleSide })
  );
  lampShade.position.set(5, 1.58, -3);
  group.add(lampShade);

  const lampBulb = mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    glowMat(0xfff5e0, 4)
  );
  lampBulb.position.set(5, 1.52, -3);
  group.add(lampBulb);

  // Point light from the side lamp
  const sideLamp = new THREE.PointLight(0xfff5e0, 0.6, 6, 1.5);
  sideLamp.position.set(5, 1.5, -3);
  group.add(sideLamp);

  // Plant on side table (no emissive so it doesn't blow out)
  const pot = mesh(
    new THREE.CylinderGeometry(0.13, 0.1, 0.18, 12),
    mat(0x2a2545, { roughness: 0.7 })
  );
  pot.position.set(4.7, 1.07, -2.8);
  group.add(pot);

  for (let i = 0; i < 4; i++) {
    const leaf = mesh(
      new THREE.ConeGeometry(0.07, 0.22, 6),
      mat([0x2ad96b, 0x3aff8c, 0x4fff9a][i % 3], { roughness: 0.6 })
    );
    const a = (i / 4) * Math.PI * 2;
    leaf.position.set(4.7 + Math.cos(a) * 0.05, 1.27, -2.8 + Math.sin(a) * 0.05);
    leaf.rotation.z = Math.cos(a) * 0.4;
    leaf.rotation.x = Math.sin(a) * 0.4;
    group.add(leaf);
  }

  parent.add(group);
}

// =============================================================
// CEILING LAMP
// =============================================================
function buildCeilingLamp(scene, parent) {
  const group = new THREE.Group();

  // Cord
  const cord = mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 1.5, 6),
    mat(0x222, { roughness: 0.9 })
  );
  cord.position.set(0, 7.1, -3);
  group.add(cord);

  // Shade
  const shade = mesh(
    new THREE.ConeGeometry(0.55, 0.35, 16, 1, true),
    mat(0x915eff, { metalness: 0.3, side: THREE.DoubleSide })
  );
  shade.position.set(0, 6.25, -3);
  group.add(shade);

  // Bulb glow
  const bulb = mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    glowMat(0xfff5e0, 3)
  );
  bulb.position.set(0, 6.05, -3);
  group.add(bulb);

  // Light source
  const lampLight = new THREE.PointLight(0xfff5e0, 1.8, 14, 1.2);
  lampLight.position.set(0, 6.0, -3);
  lampLight.castShadow = true;
  group.add(lampLight);

  parent.add(group);
}

// =============================================================
// CEILING NEON strips
// =============================================================
function buildNeonStrips(scene, parent) {
  const strip1 = mesh(
    new THREE.BoxGeometry(8, 0.04, 0.04),
    glowMat(0x915eff, 2.5)
  );
  strip1.position.set(0, 7.7, -3);
  parent.add(strip1);

  const strip2 = mesh(
    new THREE.BoxGeometry(0.04, 0.04, 8),
    glowMat(0xf272c8, 2.5)
  );
  strip2.position.set(-3, 7.7, 0);
  parent.add(strip2);

  const strip3 = mesh(
    new THREE.BoxGeometry(0.04, 0.04, 8),
    glowMat(0x00f0ff, 2.5)
  );
  strip3.position.set(3, 7.7, 0);
  parent.add(strip3);
}

// =============================================================
// ENTRANCE RUG (smaller, in back)
// =============================================================
function buildRug(scene, parent) {
  const rug = mesh(
    new THREE.BoxGeometry(2.5, 0.05, 1.2),
    mat(0xffffff, { map: fabricTexture(), roughness: 0.95 })
  );
  rug.position.set(0, 0.04, 4.5);
  rug.receiveShadow = true;
  parent.add(rug);

  // Rug border
  const border = mesh(
    new THREE.BoxGeometry(2.55, 0.06, 0.05),
    glowMat(0x915eff, 1.0)
  );
  border.position.set(0, 0.07, 4.5);
  parent.add(border);
}

// =============================================================
// MAIN BUILD
// =============================================================
export function buildWorkspace(scene) {
  const root = new THREE.Group();
  root.name = "Workspace";

  buildRoom(root);
  const desk = buildDesk(root);
  buildMonitors(scene, desk);
  buildPeripherals(scene, desk);
  buildLaptop(scene, desk);
  buildPhone(scene, desk);
  buildBooks(scene, desk);
  buildDeskAccessories(scene, desk);
  buildPlant(scene, desk);
  buildCoffee(scene, desk);
  buildComputerTower(scene, root);
  buildSideTable(scene, root);
  buildServerRack(scene, root);
  buildBookshelf(scene, root);
  buildFloatingShelves(scene, root);
  buildDiploma(scene, root);
  buildPosters(scene, root);
  const clockGroup = buildClock(scene, root);
  buildCeilingLamp(scene, root);
  buildNeonStrips(scene, root);
  buildRug(scene, root);

  scene.add(root);
  return { root, clockGroup };
}
