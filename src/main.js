// =============================================================
// Nourchene Hamrita — 3D Portfolio entry point
//
// Architecture overview:
//   - main.js              ← orchestrator (this file)
//   - utils/Scene.js       ← Three.js scene + renderer + camera + composer
//   - utils/Workspace.js   ← procedural 3D room
//   - utils/Controls.js    ← custom orbit controls
//   - utils/Interactions.js← raycasting, hover, click
//   - utils/Modals.js      ← open/close UI panels
//   - utils/Theme.js       ← day/cyberpunk theme switching
//   - utils/Animations.js  ← idle animations + particles
//   - utils/Audio.js       ← Web Audio SFX
//   - data/portfolio.js    ← Nourchene's content
// =============================================================

import "./style.scss";
import * as THREE from "three";
import { initScene } from "./utils/Scene.js";
import { initControls } from "./utils/Controls.js";
import { initInteractions } from "./utils/Interactions.js";
import { initModals } from "./utils/Modals.js";
import { initTheme } from "./utils/Theme.js";
import { initAnimations } from "./utils/Animations.js";
import { audio } from "./utils/Audio.js";
import { portfolioData } from "./data/portfolio.js";

const app = {
  scene: null,
  camera: null,
  renderer: null,
  canvas: null,
  composer: null,
  controls: null,
  interactions: null,
  modals: null,
  theme: null,
  animations: null,
  data: portfolioData,
  clock: new THREE.Clock(),
  booted: false,
};

function boot() {
  if (app.booted) return;
  app.booted = true;
  console.log("🚀 Booting Nourchene 3D Portfolio…");

  // 1. Three.js scene + post-processing
  const sceneCtx = initScene(document.getElementById("experience-canvas"));
  Object.assign(app, sceneCtx);

  // 2. Orbit controls
  app.controls = initControls(app.camera, app.renderer.domElement);

  // 3. Theme
  app.theme = initTheme(app, audio);

  // 4. Modals (inject content + wire open/close)
  app.modals = initModals(app, audio);

  // 5. Idle animations
  app.animations = initAnimations(app);

  // 6. Raycasting interactions
  app.interactions = initInteractions(app, audio);

  // 7. Loading screen + intro animation
  setupLoadingScreen();
  setupIntro();

  // 8. Render loop
  startRenderLoop();

  // 9. Resize
  window.addEventListener("resize", onResize);

  // 10. Sound toggle
  setupSoundToggle();

  // 11. Mobile menu toggle
  setupMobileMenu();

  // Mobile browsers can suspend audio when the tab or app is backgrounded.
  window.addEventListener("pageshow", () => audio.resume());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") audio.resume();
  });
}

function setupSoundToggle() {
  const btn = document.getElementById("sound-toggle");
  if (!btn) return;
  let muted = false;
  btn.addEventListener("click", () => {
    muted = !muted;
    audio.setEnabled(!muted);
    btn.setAttribute("data-muted", String(muted));
    if (!muted) audio.click();
  });
}

function setupMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const nav = document.querySelector(".topbar-nav");
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-button").forEach((btn) => {
    btn.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });
}

function startRenderLoop() {
  const tick = () => {
    requestAnimationFrame(tick);
    const delta = Math.min(app.clock.getDelta(), 0.05); // clamp big jumps
    if (app.controls?.update) app.controls.update(delta);
    if (app.animations?.update) app.animations.update(delta);
    if (app.composer) {
      app.composer.render();
    } else if (app.scene && app.camera && app.renderer) {
      app.renderer.render(app.scene, app.camera);
    }
  };
  tick();
}

function onResize() {
  if (!app.camera || !app.renderer) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  app.camera.aspect = w / h;
  app.camera.updateProjectionMatrix();
  app.renderer.setSize(w, h);
  if (app.composer) {
    app.composer.setSize(w, h);
    if (app.bloomPass?.setSize) app.bloomPass.setSize(w, h);
  }
  app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function setupLoadingScreen() {
  const screen = document.getElementById("loading-screen");
  const bar = document.getElementById("loading-bar-fill");
  const percent = document.getElementById("loading-percent");
  const button = document.getElementById("enter-button");

  let p = 0;
  const tickProgress = () => {
    p = Math.min(100, p + Math.random() * 18 + 6);
    bar.style.width = p + "%";
    percent.textContent = Math.floor(p) + "%";
    if (p < 100) {
      setTimeout(tickProgress, 90);
    } else {
      button.disabled = false;
      const dismiss = () => {
        audio.unlock();
        audio.enter();
        screen.classList.add("is-hidden");
        runIntroAnimation();
      };
      button.addEventListener("click", dismiss, { once: true });
    }
  };
  tickProgress();
}

// ---------- Intro camera dolly ----------
function setupIntro() {
  // Pre-position the camera pulled back; the actual animation is
  // triggered by runIntroAnimation() once the loading screen is gone.
}

function runIntroAnimation() {
  if (!app.camera || !app.controls) return;

  // Start: high & pulled back
  const startPos = new THREE.Vector3(0, 3.5, 12);
  // End: the orbit controls' default lookAt
  const endTarget = new THREE.Vector3(0, 1.6, -2.5);
  const endPos = new THREE.Vector3(0, 2.4, 7.5);

  app.camera.position.copy(startPos);
  app.controls.target.copy(endTarget);

  const duration = 1800;
  const start = performance.now();
  function animate() {
    const t = Math.min(1, (performance.now() - start) / duration);
    // ease-out cubic
    const e = 1 - Math.pow(1 - t, 3);
    app.camera.position.lerpVectors(startPos, endPos, e);
    app.controls.target.lerpVectors(
      new THREE.Vector3(0, 1.4, 0),
      endTarget,
      e
    );
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Hand the camera position back to the controls
      const offset = app.camera.position.clone().sub(app.controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      if (app.controls.spherical) app.controls.spherical.copy(spherical);
    }
  }
  animate();
}

// ---------- Boot ----------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// Expose for debugging
window.__portfolio = app;
