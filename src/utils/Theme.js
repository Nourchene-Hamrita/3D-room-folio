// =============================================================
// Theme.js — day / cyberpunk theme toggle
// - Day mode: bright, clean, soft lighting
// - Cyberpunk (default): dark, neon glow, moody
// =============================================================

import * as THREE from "three";

export function initTheme(app, audio) {
  const root = document.documentElement;
  const button = document.getElementById("theme-toggle");
  let mode = "cyberpunk";

  const themes = {
    cyberpunk: {
      dataAttr: "cyberpunk",
      bg: "#0c0816",
      fog: "#0c0816",
      ambient: 0.55,
      hemi: 0.7,
      hemiSky: 0xb090ff,
      hemiGround: 0x100d25,
      keyIntensity: 1.0,
      rimColor: 0x915eff,
      rimIntensity: 0.7,
      fillColor: 0xf272c8,
      fillIntensity: 1.3,
      accentColor: 0x00f0ff,
      accentIntensity: 0.9,
      topFillIntensity: 0.6,
      bulbColor: 0xfff5e0,
      bulbIntensity: 1.8,
      exposure: 1.0,
      bloomStrength: 0.75,
    },
    day: {
      dataAttr: "day",
      bg: "#f5f3ff",
      fog: "#f5f3ff",
      ambient: 1.0,
      hemi: 0.9,
      hemiSky: 0xe8e0ff,
      hemiGround: 0x8a7aab,
      keyIntensity: 1.8,
      rimColor: 0xa3a8ff,
      rimIntensity: 0.4,
      fillColor: 0xfff0d8,
      fillIntensity: 0.3,
      accentColor: 0xc8d8ff,
      accentIntensity: 0.2,
      topFillIntensity: 0.3,
      bulbColor: 0xfff5e0,
      bulbIntensity: 0.5,
      exposure: 1.3,
      bloomStrength: 0.2,
    },
  };

  // Find lights by position heuristics
  const lights = {};
  app.scene.traverse((obj) => {
    if (!obj.isLight) return;
    if (obj.isAmbientLight) lights.ambient = obj;
    else if (obj.isHemisphereLight) lights.hemi = obj;
    else if (obj.isDirectionalLight && obj.position.x > 0) lights.key = obj;
    else if (obj.isDirectionalLight && obj.position.x < 0) lights.rim = obj;
    else if (obj.isPointLight && obj.position.y > 5.5) lights.bulb = obj;
    else if (obj.isPointLight && obj.position.y > 5) lights.topFill = obj;
    else if (obj.isPointLight) {
      if (obj.position.x < 0) lights.accent = obj;
      else lights.fill = obj;
    }
  });

  function apply(themeName) {
    const t = themes[themeName];
    mode = themeName;

    root.setAttribute("data-theme", t.dataAttr);
    button.setAttribute("data-mode", t.dataAttr);

    if (app.scene.background?.isColor) {
      app.scene.background.set(t.bg);
    }
    if (app.scene.fog?.isColor) {
      app.scene.fog.color.set(t.fog);
      app.scene.fog.near = 18;
      app.scene.fog.far = themeName === "day" ? 55 : 45;
    }

    if (lights.ambient) lights.ambient.intensity = t.ambient;
    if (lights.hemi) {
      lights.hemi.intensity = t.hemi;
      lights.hemi.color.setHex(t.hemiSky);
      lights.hemi.groundColor.setHex(t.hemiGround);
    }
    if (lights.key) lights.key.intensity = t.keyIntensity;
    if (lights.rim) {
      lights.rim.intensity = t.rimIntensity;
      lights.rim.color.setHex(t.rimColor);
    }
    if (lights.fill) {
      lights.fill.intensity = t.fillIntensity;
      lights.fill.color.setHex(t.fillColor);
    }
    if (lights.accent) {
      lights.accent.intensity = t.accentIntensity;
      lights.accent.color.setHex(t.accentColor);
    }
    if (lights.bulb) {
      lights.bulb.intensity = t.bulbIntensity;
      lights.bulb.color.setHex(t.bulbColor);
    }
    if (lights.topFill) {
      lights.topFill.intensity = t.topFillIntensity;
    }

    app.renderer.toneMappingExposure = t.exposure;
    if (app.bloomPass) {
      app.bloomPass.strength = t.bloomStrength;
    }

    // Boost/dim neon emissives based on theme
    app.scene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const m = obj.material;
      if (m.emissive && m.emissiveIntensity !== undefined) {
        if (obj.userData._origEmissive === undefined) {
          obj.userData._origEmissive = m.emissiveIntensity;
        }
        if (themeName === "cyberpunk") {
          m.emissiveIntensity = (obj.userData._origEmissive || 1) * 1.4;
        } else {
          m.emissiveIntensity = (obj.userData._origEmissive || 1) * 0.3;
        }
      }
    });

    if (audio) audio.theme();
  }

  function toggle() {
    apply(mode === "cyberpunk" ? "day" : "cyberpunk");
  }

  button.addEventListener("click", toggle);

  apply("cyberpunk");

  return { apply, toggle, get mode() { return mode; } };
}
