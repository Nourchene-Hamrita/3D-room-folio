// =============================================================
// Animations.js — idle/ambient motion for the 3D scene
//   - Server rack LEDs blink at random intervals
//   - Plant leaves sway gently
//   - Coffee steam rises and fades
//   - Monitor screens pulse subtly
//   - Ambient floating dust particles
//   - Cursor moves on the central monitor (simulated activity)
// =============================================================

import * as THREE from "three";

export function initAnimations(app) {
  const scene = app.scene;
  const clock = { t: 0 };

  // ---------- Collect animatable objects ----------
  const leds = [];           // { mesh, baseIntensity, phase, rate }
  const plants = [];         // swayable objects
  const steams = [];         // { mesh, baseY, phase }
  const screens = [];        // { mesh, baseEmissive, baseScale }
  const clockHands = [];     // hour / minute hands
  const cursor = null;       // cursor on monitor (created below)
  const planets = [];        // floating planet display groups

  app.workspace.traverse((obj) => {
    if (obj.userData?.planetMotion) {
      planets.push({
        group: obj,
        baseY: obj.userData.planetMotion.baseY,
        spin: obj.userData.planetMotion.spin,
        float: obj.userData.planetMotion.float,
        phase: Math.random() * Math.PI * 2,
      });
    }

    if (!obj.isMesh) return;

    // Server LEDs (sphere geometry + emissive)
    if (
      obj.geometry?.type === "SphereGeometry" &&
      obj.material?.emissive &&
      obj.userData?.isLed !== false
    ) {
      // Tag once
      if (!obj.userData.isLed) obj.userData.isLed = true;
      leds.push({
        mesh: obj,
        base: obj.material.emissiveIntensity,
        phase: Math.random() * Math.PI * 2,
        rate: 1.5 + Math.random() * 2.5,
      });
    }

    // Plant leaves — cones with greenish color
    if (
      obj.geometry?.type === "ConeGeometry" &&
      obj.material?.color &&
      obj.material.color.g > 0.4 &&
      obj.material.color.b < 0.5
    ) {
      plants.push({
        mesh: obj,
        baseZ: obj.rotation.z,
        baseX: obj.rotation.x,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Steam particles
    if (obj.userData?.isSteam) {
      steams.push({
        mesh: obj,
        baseY: obj.userData.baseY,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Screens (planes with strong emissive)
    if (
      obj.geometry?.type === "PlaneGeometry" &&
      obj.material?.emissive &&
      obj.userData?.interactiveId
    ) {
      screens.push({
        mesh: obj,
        base: obj.material.emissiveIntensity,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Clock hands
    if (obj.userData?.isClockHand) {
      clockHands.push({
        mesh: obj,
        kind: obj.userData.isClockHand,
      });
    }
  });

  // ---------- Ambient floating particles ----------
  const particles = makeParticles();
  scene.add(particles);

  // ---------- Update loop ----------
  function update(delta) {
    clock.t += delta;

    // LEDs blink
    for (const l of leds) {
      const v = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(clock.t * l.rate + l.phase));
      l.mesh.material.emissiveIntensity = l.base * v;
    }

    // Plants sway
    for (const p of plants) {
      const sway = 0.05 * Math.sin(clock.t * 0.6 + p.phase);
      p.mesh.rotation.z = p.baseZ + sway;
      p.mesh.rotation.x = p.baseX + sway * 0.5;
    }

    // Steam rises & fades
    for (const s of steams) {
      const t = (clock.t * 0.6 + s.phase) % 1;
      s.mesh.position.y = s.baseY + t * 0.3;
      s.mesh.material.opacity = 0.18 * (1 - t);
      const scale = 0.8 + t * 0.6;
      s.mesh.scale.setScalar(scale);
    }

    // Monitor screens pulse
    for (const s of screens) {
      const v = 0.9 + 0.1 * Math.sin(clock.t * 1.4 + s.phase);
      s.mesh.material.emissiveIntensity = s.base * v;
    }

    // Clock hands rotate
    for (const h of clockHands) {
      if (h.kind === "hour") {
        h.mesh.rotation.z = -clock.t * 0.0001; // very slow
      } else if (h.kind === "minute") {
        h.mesh.rotation.z = -clock.t * 0.0015;
      }
    }

    // Ambient particles drift
    updateParticles(particles, clock.t, delta);

    // Give the planet a slow, display-like game-world motion.
    for (const planet of planets) {
      planet.group.rotation.y += delta * planet.spin;
      planet.group.position.y =
        planet.baseY + Math.sin(clock.t * planet.float + planet.phase) * 0.12;
    }
  }

  return { update };
}

// =============================================================
// Ambient floating particles
// =============================================================
function makeParticles() {
  const count = 350;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const colorPalette = [
    new THREE.Color(0x915eff),
    new THREE.Color(0xf272c8),
    new THREE.Color(0x00f0ff),
    new THREE.Color(0xdfd9ff),
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = Math.random() * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    speeds[i] = 0.05 + Math.random() * 0.12;
    phases[i] = Math.random() * Math.PI * 2;
    const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  return new THREE.Points(geo, mat);
}

function updateParticles(points, t, delta) {
  const pos = points.geometry.attributes.position;
  const arr = pos.array;
  for (let i = 0; i < arr.length / 3; i++) {
    // Slow upward drift + small horizontal sway
    arr[i * 3 + 1] += delta * 0.15;
    arr[i * 3 + 0] += Math.sin(t * 0.4 + i) * delta * 0.05;
    if (arr[i * 3 + 1] > 6) {
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 0] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
  }
  pos.needsUpdate = true;
}

// =============================================================
// Click feedback — particle burst at a 3D position
// =============================================================
export function spawnBurst(app, position, color = 0x915eff) {
  const count = 30;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2 + 0.5,
      (Math.random() - 0.5) * 2
    );
    velocities.push(v);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.1,
    color,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  app.scene.add(points);

  const start = performance.now();
  const dur = 700;
  function animate() {
    const t = (performance.now() - start) / dur;
    if (t >= 1) {
      app.scene.remove(points);
      geo.dispose();
      mat.dispose();
      return;
    }
    const pos = points.geometry.attributes.position;
    const arr = pos.array;
    for (let i = 0; i < velocities.length; i++) {
      arr[i * 3 + 0] += velocities[i].x * 0.02;
      arr[i * 3 + 1] += velocities[i].y * 0.02 - 0.005; // mild gravity
      arr[i * 3 + 2] += velocities[i].z * 0.02;
    }
    pos.needsUpdate = true;
    mat.opacity = 1 - t;
    requestAnimationFrame(animate);
  }
  animate();
}
