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
    minDistance: 3.0,
    maxDistance: 12.0,
    minPolarAngle: 0.25,                  // can't go above the ceiling
    maxPolarAngle: Math.PI * 0.49,        // can't go under the floor

    // Damping
    enableDamping: true,
    dampingFactor: 0.08,

    // Sensitivity
    rotateSpeed: 0.6,
    zoomSpeed: 0.8,
    panSpeed: 0.6,

    // Auto-rotate when idle
    autoRotate: true,
    autoRotateSpeed: 0.25,
    autoRotateDelay: 4000,                // ms of idle before auto-rotate kicks in

    // State
    spherical: new THREE.Spherical(),
    sphericalDelta: new THREE.Spherical(),
    panOffset: new THREE.Vector3(),
    scale: 1,

    // Mouse / touch state
    isPointerDown: false,
    pointerButton: -1,
    lastX: 0,
    lastY: 0,
    pointers: [],
    pinchStartDist: 0,
    pinchStartScale: 1,
    lastInteractionTime: performance.now(),
  };

  // Initialize spherical from camera position
  const offset = camera.position.clone().sub(config.target);
  config.spherical.setFromVector3(offset);

  // ---------- Helpers ----------
  function rotateLeft(angle) {
    config.sphericalDelta.theta -= angle;
  }
  function rotateUp(angle) {
    config.sphericalDelta.phi -= angle;
  }
  function dollyOut(dollyScale) {
    config.scale /= dollyScale;
  }
  function dollyIn(dollyScale) {
    config.scale *= dollyScale;
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
  }

  // ---------- Pointer events ----------
  function onPointerDown(e) {
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
        rotateLeft((2 * Math.PI * dx) / w * config.rotateSpeed);
        rotateUp((2 * Math.PI * dy) / h * config.rotateSpeed);
      } else if (config.pointerButton === 2) {
        // Right button: pan
        pan((10 * dx) / w, (10 * dy) / h);
      }
    }
  }

  function onPointerUp(e) {
    config.isPointerDown = false;
    config.pointerButton = -1;
    dom.releasePointerCapture?.(e.pointerId);
  }

  function onWheel(e) {
    e.preventDefault();
    config.lastInteractionTime = performance.now();
    if (e.deltaY < 0) dollyIn(1 + 0.1 * config.zoomSpeed);
    else dollyOut(1 + 0.1 * config.zoomSpeed);
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
      config.pinchStartScale = config.scale;
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
      rotateLeft((2 * Math.PI * dx) / w * config.rotateSpeed);
      rotateUp((2 * Math.PI * dy) / h * config.rotateSpeed);
    } else if (t.length === 2) {
      const d = touchDistance(t[0], t[1]);
      const ratio = d / config.pinchStartDist;
      config.scale = config.pinchStartScale / ratio;
      // Also pan
      const cx = (t[0].clientX + t[1].clientX) / 2;
      const cy = (t[0].clientY + t[1].clientY) / 2;
      pan((cx - config.lastX) / w * 5, (cy - config.lastY) / h * 5);
      config.lastX = cx;
      config.lastY = cy;
    }
  }

  function onTouchEnd() {
    config.isPointerDown = false;
    config.pointerButton = -1;
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

  // ---------- Update loop ----------
  function update(delta) {
    const spherical = config.spherical;
    const sphericalDelta = config.sphericalDelta;

    // Auto-rotate when idle
    if (config.autoRotate) {
      const idle = performance.now() - config.lastInteractionTime;
      if (idle > config.autoRotateDelay && !config.isPointerDown) {
        const speed = (2 * Math.PI) / 60 / 60 * config.autoRotateSpeed;
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
    spherical.phi = Math.max(config.minPolarAngle, Math.min(config.maxPolarAngle, spherical.phi));
    spherical.makeSafe();

    // Zoom
    if (config.scale !== 1) {
      spherical.radius *= config.scale;
      config.scale = 1;
    }
    spherical.radius = Math.max(config.minDistance, Math.min(config.maxDistance, spherical.radius));

    // Compute new camera position
    const offset = new THREE.Vector3();
    offset.setFromSpherical(spherical);
    camera.position.copy(config.target).add(offset);
    camera.lookAt(config.target);

    // Decay deltas
    if (config.enableDamping) {
      sphericalDelta.theta *= (1 - config.dampingFactor);
      sphericalDelta.phi *= (1 - config.dampingFactor);
    } else {
      sphericalDelta.set(0, 0, 0);
    }
  }

  // Public API for programmatic camera moves
  function focusOn(target, distance = 4) {
    const startPos = camera.position.clone();
    const startTarget = config.target.clone();
    const endTarget = new THREE.Vector3().fromArray(
      Array.isArray(target) ? target : [target.x, target.y, target.z]
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

  return { update, focusOn, spherical: config.spherical, target: config.target };
}
