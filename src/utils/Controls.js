// =============================================================
// Controls.js — custom orbit camera controls
// Mouse: left-drag to orbit, scroll to zoom, right-drag to pan
// Touch: one-finger orbit, two-finger zoom/pan
// =============================================================

import * as THREE from "three";

export function initControls(camera, dom) {
  const config = {
    // Target point the camera looks at
    target: new THREE.Vector3(0, 1.6, -2.5),

    // Limits
    minDistance: 1.8,
    maxDistance: 16.0,
    minPolarAngle: 0.25, // can't go above the ceiling
    maxPolarAngle: Math.PI * 0.49, // can't go under the floor

    // Damping
    enableDamping: true,
    dampingFactor: 0.08,

    // Sensitivity
    rotateSpeed: 0.6,
    zoomSpeed: 0.8,
    panSpeed: 0.6,
    zoomDamping: 0.16,

    // Auto-rotate when idle
    autoRotate: false,
    autoRotateSpeed: 0.25,
    autoRotateDelay: 4000, // ms of idle before auto-rotate kicks in

    // State
    spherical: new THREE.Spherical(),
    sphericalDelta: new THREE.Spherical(),
    panOffset: new THREE.Vector3(),
    targetRadius: 0,

    // Mouse / touch state
    isPointerDown: false,
    pointerButton: -1,
    lastX: 0,
    lastY: 0,
    pointers: [],
    pinchStartDist: 0,
    lastPinchDist: 0,
    lastTouchCenterX: 0,
    lastTouchCenterY: 0,
    lastInteractionTime: performance.now(),
  };

  // Initialize spherical from camera position
  const offset = camera.position.clone().sub(config.target);
  config.spherical.setFromVector3(offset);
  config.spherical.radius = THREE.MathUtils.clamp(
    config.spherical.radius,
    config.minDistance,
    config.maxDistance,
  );
  config.targetRadius = config.spherical.radius;

  // ---------- Helpers ----------
  function rotateLeft(angle) {
    config.sphericalDelta.theta -= angle;
  }
  function rotateUp(angle) {
    config.sphericalDelta.phi -= angle;
  }
  function dollyOut(dollyScale) {
    config.targetRadius *= dollyScale;
  }
  function dollyIn(dollyScale) {
    config.targetRadius /= dollyScale;
  }
  function applyZoomDelta(delta) {
    config.targetRadius = THREE.MathUtils.clamp(
      config.targetRadius + delta,
      config.minDistance,
      config.maxDistance,
    );
    config.lastInteractionTime = performance.now();
  }
  function pan(deltaX, deltaY) {
    const offset = new THREE.Vector3();
    offset.copy(camera.position).sub(config.target);
    offset.y = 0;
    offset.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(offset, camera.up).normalize();

    const up = new THREE.Vector3();
    up.crossVectors(right, offset).normalize();

    const move = new THREE.Vector3();
    move.addScaledVector(right, -deltaX);
    move.addScaledVector(up, deltaY);

    config.target.addScaledVector(move, config.panSpeed);
    config.panOffset.add(move.multiplyScalar(config.panSpeed));

    // Keep the room as the navigable stage instead of allowing the target
    // to drift into a wall or outside the scene after a large gesture.
    config.target.x = THREE.MathUtils.clamp(config.target.x, -3.5, 3.5);
    config.target.y = THREE.MathUtils.clamp(config.target.y, 0.8, 3.4);
    config.target.z = THREE.MathUtils.clamp(config.target.z, -5.5, 0.5);
  }

  // ---------- Pointer events ----------
  function onPointerDown(e) {
    if (e.pointerType === "touch") return;
    if (e.target.closest && e.target.closest(".modal.is-open, .topbar")) {
      return; // don't capture if interacting with UI
    }
    config.isPointerDown = true;
    config.pointerButton = e.button;
    config.lastX = e.clientX;
    config.lastY = e.clientY;
    config.lastInteractionTime = performance.now();
    dom.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (e.pointerType === "touch") return;
    if (!config.isPointerDown) return;
    const dx = e.clientX - config.lastX;
    const dy = e.clientY - config.lastY;
    config.lastX = e.clientX;
    config.lastY = e.clientY;
    config.lastInteractionTime = performance.now();

    const el = dom;
    const w = el.clientWidth;
    const h = el.clientHeight;

    if (e.pointerType === "touch") {
      // Two-finger: handled in touch-specific events
    } else {
      if (config.pointerButton === 0) {
        // Left button: orbit
        rotateLeft(((2 * Math.PI * dx) / w) * config.rotateSpeed);
        rotateUp(((2 * Math.PI * dy) / h) * config.rotateSpeed);
      } else if (config.pointerButton === 2) {
        // Right button: pan
        pan((10 * dx) / w, (10 * dy) / h);
      }
    }
  }

  function onPointerUp(e) {
    if (e.pointerType === "touch") return;
    config.isPointerDown = false;
    config.pointerButton = -1;
    dom.releasePointerCapture?.(e.pointerId);
  }

  function onWheel(e) {
    e.preventDefault();
    config.lastInteractionTime = performance.now();
    const lineHeight = 16;
    const pixels = e.deltaMode === 1 ? e.deltaY * lineHeight : e.deltaY;
    const normalized = THREE.MathUtils.clamp(pixels / 100, -2, 2);
    applyZoomDelta(normalized * config.zoomSpeed * 0.85);
  }

  function onContextMenu(e) {
    e.preventDefault();
  }

  // Touch handling
  function getTouches(e) {
    return Array.from(e.touches || []);
  }

  function touchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  function onTouchStart(e) {
    if (e.target.closest && e.target.closest(".modal.is-open, .topbar")) return;
    config.lastInteractionTime = performance.now();
    const t = getTouches(e);
    if (t.length === 1) {
      config.isPointerDown = true;
      config.pointerButton = 0;
      config.lastX = t[0].clientX;
      config.lastY = t[0].clientY;
    } else if (t.length === 2) {
      config.isPointerDown = true;
      config.pointerButton = 1; // pinch/pan
      config.pinchStartDist = touchDistance(t[0], t[1]);
      config.lastPinchDist = config.pinchStartDist;
      config.lastTouchCenterX = (t[0].clientX + t[1].clientX) / 2;
      config.lastTouchCenterY = (t[0].clientY + t[1].clientY) / 2;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    const t = getTouches(e);
    const w = dom.clientWidth;
    const h = dom.clientHeight;
    if (t.length === 1) {
      const dx = t[0].clientX - config.lastX;
      const dy = t[0].clientY - config.lastY;
      config.lastX = t[0].clientX;
      config.lastY = t[0].clientY;
      rotateLeft(((2 * Math.PI * dx) / w) * config.rotateSpeed);
      rotateUp(((2 * Math.PI * dy) / h) * config.rotateSpeed);
    } else if (t.length === 2) {
      const d = touchDistance(t[0], t[1]);
      if (!config.lastPinchDist) return;
      const pinchDelta = config.lastPinchDist - d;
      applyZoomDelta(pinchDelta * 0.012 * config.zoomSpeed);
      config.lastPinchDist = d;
      // Also pan
      const cx = (t[0].clientX + t[1].clientX) / 2;
      const cy = (t[0].clientY + t[1].clientY) / 2;
      pan(
        ((cx - config.lastTouchCenterX) / w) * 5,
        ((cy - config.lastTouchCenterY) / h) * 5,
      );
      config.lastTouchCenterX = cx;
      config.lastTouchCenterY = cy;
    }
  }

  function onTouchEnd() {
    config.isPointerDown = false;
    config.pointerButton = -1;
    config.pinchStartDist = 0;
    config.lastPinchDist = 0;
  }

  // ---------- Listeners ----------
  dom.addEventListener("pointerdown", onPointerDown);
  dom.addEventListener("pointermove", onPointerMove);
  dom.addEventListener("pointerup", onPointerUp);
  dom.addEventListener("pointercancel", onPointerUp);
  dom.addEventListener("wheel", onWheel, { passive: false });
  dom.addEventListener("contextmenu", onContextMenu);
  dom.addEventListener("touchstart", onTouchStart, { passive: false });
  dom.addEventListener("touchmove", onTouchMove, { passive: false });
  dom.addEventListener("touchend", onTouchEnd);
  dom.addEventListener("touchcancel", onTouchEnd);

  function resetView() {
    config.target.set(0, 1.6, -2.5);
    config.sphericalDelta.set(0, 0, 0);
    config.isPointerDown = false;
    config.pointerButton = -1;
    config.lastInteractionTime = performance.now();
    camera.position.set(0, 2.4, 7.5);
    const resetOffset = camera.position.clone().sub(config.target);
    config.spherical.setFromVector3(resetOffset);
    config.targetRadius = config.spherical.radius;
  }

  function onKeyDown(e) {
    if (
      e.key.toLowerCase() === "r" &&
      !e.target.closest?.("input, textarea, button, a")
    ) {
      resetView();
    }
  }

  window.addEventListener("keydown", onKeyDown);

  // ---------- Update loop ----------
  function update(delta) {
    const spherical = config.spherical;
    const sphericalDelta = config.sphericalDelta;

    // Auto-rotate is opt-in; it must never move the camera unexpectedly.
    if (config.autoRotate) {
      const idle = performance.now() - config.lastInteractionTime;
      if (idle > config.autoRotateDelay && !config.isPointerDown) {
        const speed = ((2 * Math.PI) / 60 / 60) * config.autoRotateSpeed;
        rotateLeft(speed * (delta * 60));
      }
    }

    if (config.enableDamping) {
      spherical.theta += sphericalDelta.theta * config.dampingFactor;
      spherical.phi += sphericalDelta.phi * config.dampingFactor;
    } else {
      spherical.theta += sphericalDelta.theta;
      spherical.phi += sphericalDelta.phi;
    }

    // Limit polar
    spherical.phi = Math.max(
      config.minPolarAngle,
      Math.min(config.maxPolarAngle, spherical.phi),
    );
    spherical.makeSafe();

    // Smoothly approach the requested zoom distance.
    spherical.radius = THREE.MathUtils.lerp(
      spherical.radius,
      config.targetRadius,
      1 - Math.pow(1 - config.zoomDamping, delta * 60),
    );
    spherical.radius = THREE.MathUtils.clamp(
      spherical.radius,
      config.minDistance,
      config.maxDistance,
    );

    // Compute new camera position
    const offset = new THREE.Vector3();
    offset.setFromSpherical(spherical);
    camera.position.copy(config.target).add(offset);
    camera.lookAt(config.target);

    // Decay deltas
    if (config.enableDamping) {
      sphericalDelta.theta *= 1 - config.dampingFactor;
      sphericalDelta.phi *= 1 - config.dampingFactor;
    } else {
      sphericalDelta.set(0, 0, 0);
    }
  }

  // Public API for programmatic camera moves
  function focusOn(target, distance = 4) {
    const startPos = camera.position.clone();
    const startTarget = config.target.clone();
    const endTarget = new THREE.Vector3().fromArray(
      Array.isArray(target) ? target : [target.x, target.y, target.z],
    );
    const dir = startPos.clone().sub(startTarget).normalize();
    const endPos = endTarget.clone().add(dir.multiplyScalar(distance));

    const duration = 1000;
    const start = performance.now();
    function animate() {
      const t = Math.min(1, (performance.now() - start) / duration);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      camera.position.lerpVectors(startPos, endPos, e);
      config.target.lerpVectors(startTarget, endTarget, e);
      const newOffset = camera.position.clone().sub(config.target);
      config.spherical.setFromVector3(newOffset);
      if (t < 1) requestAnimationFrame(animate);
    }
    animate();
  }

  return {
    update,
    focusOn,
    resetView,
    spherical: config.spherical,
    target: config.target,
  };
}
