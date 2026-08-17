// =============================================================
// Interactions.js — raycasting, hover hints, click-to-open
// =============================================================

import * as THREE from "three";
import { spawnBurst } from "./Animations.js";

export function initInteractions(app, audio) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  let lastHoverKey = null;
  const hint = document.getElementById("hover-hint");
  const hintText = hint?.querySelector(".hover-hint-text");

  function setPointer(e) {
    const rect = app.renderer.domElement.getBoundingClientRect();
    const x = e.clientX !== undefined ? e.clientX : (e.touches?.[0]?.clientX ?? 0);
    const y = e.clientY !== undefined ? e.clientY : (e.touches?.[0]?.clientY ?? 0);
    pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
  }

  function pick() {
    raycaster.setFromCamera(pointer, app.camera);
    const intersects = raycaster.intersectObjects(app.interactiveMeshes, false);
    return intersects[0] || null;
  }

  function showHint(label) {
    if (!hint || !hintText) return;
    hintText.textContent = label || "Click to explore";
    hint.classList.add("is-visible");
  }

  function hideHint() {
    hint?.classList.remove("is-visible");
  }

  function applyHover(mesh) {
    if (hovered === mesh) return;
    if (hovered) restoreHover(hovered);
    hovered = mesh;
    if (mesh) {
      // Highlight: scale up slightly + boost emissive
      gsapMesh(mesh, { scale: 1.06, emissiveBoost: 0.8 });
      showHint(mesh.userData.label);
      document.body.style.cursor = "pointer";
      // Sound
      if (lastHoverKey !== mesh.uuid && audio) audio.hover();
      lastHoverKey = mesh.uuid;
    } else {
      hideHint();
      document.body.style.cursor = "grab";
      lastHoverKey = null;
    }
  }

  function restoreHover(mesh) {
    gsapMesh(mesh, { scale: 1, emissiveBoost: 0 }, true);
  }

  // Lightweight tween
  const tweens = [];
  function gsapMesh(mesh, target, restore = false) {
    const startScale = mesh.scale.x;
    const startEmissive = mesh.material?.emissiveIntensity ?? 0;
    const t0 = performance.now();
    const dur = 220;
    const tween = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      const s = startScale + (target.scale - startScale) * e;
      mesh.scale.set(s, s, s);
      if (mesh.material && "emissiveIntensity" in mesh.material) {
        mesh.material.emissiveIntensity = startEmissive + target.emissiveBoost * e;
      }
      if (t < 1) requestAnimationFrame(tween);
    };
    requestAnimationFrame(tween);
  }

  // Click pop animation
  function popMesh(mesh) {
    const startScale = mesh.scale.x;
    const t0 = performance.now();
    const dur = 350;
    const tween = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      // Bounce
      const e = t < 0.5
        ? 1.15 + 0.1 * Math.sin(t * Math.PI * 4)
        : 1 + 0.15 * (1 - (t - 0.5) * 2);
      const s = startScale * e;
      mesh.scale.set(s, s, s);
      if (t < 1) requestAnimationFrame(tween);
      else mesh.scale.set(startScale, startScale, startScale);
    };
    requestAnimationFrame(tween);
  }

  // ---------- Listeners ----------
  function onPointerMove(e) {
    if (e.pointerType === "touch") return;
    setPointer(e);
    const hit = pick();
    applyHover(hit?.object ?? null);
  }

  function onPointerLeave() {
    applyHover(null);
  }

  function onClick(e) {
    setPointer(e);
    const hit = pick();
    if (!hit) return;
    const mesh = hit.object;
    const id = mesh.userData.interactiveId;
    if (!id) return;
    const config = app.data.interactive[id];
    if (!config) return;

    // Visual + sound feedback
    popMesh(mesh);
    spawnBurst(app, hit.point, mesh.material?.emissive?.getHex?.() || 0x915eff);
    if (audio) audio.click();

    if (config.action === "open-modal") {
      if (config.modal === "project") {
        app.modals.openProject(config.project);
      } else {
        app.modals.open(config.modal);
      }
      if (audio) setTimeout(() => audio.open(), 100);
    }
  }

  app.renderer.domElement.addEventListener("pointermove", onPointerMove);
  app.renderer.domElement.addEventListener("pointerleave", onPointerLeave);
  app.renderer.domElement.addEventListener("click", onClick);

  // Initial cursor
  document.body.style.cursor = "grab";
  app.renderer.domElement.addEventListener("pointerdown", () => {
    if (!hovered) document.body.style.cursor = "grabbing";
  });
  app.renderer.domElement.addEventListener("pointerup", () => {
    document.body.style.cursor = hovered ? "pointer" : "grab";
  });

  return {
    raycaster,
    pick,
  };
}
