// =============================================================
// Scene.js — Three.js scene, camera, renderer, lighting, postFX
// =============================================================

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildWorkspace } from "./Workspace.js";

export function initScene(canvas) {
  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---------- Scene ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0c0816");
  scene.fog = new THREE.Fog("#0c0816", 22, 55);

  // ---------- Environment map (so reflective surfaces actually reflect) ----------
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();

  // ---------- Camera ----------
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 3.0, 11);
  camera.lookAt(0, 1.5, -2);

  // ---------- Lighting ----------
  // Stronger ambient so walls are visible
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  // Hemisphere — purple sky, dark ground
  const hemi = new THREE.HemisphereLight(0xb090ff, 0x100d25, 0.7);
  scene.add(hemi);

  // Key light from the front-top
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 35;
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.bias = -0.0003;
  scene.add(key);

  // Cool violet rim from behind
  const rim = new THREE.DirectionalLight(0x915eff, 0.7);
  rim.position.set(-5, 5, -6);
  scene.add(rim);

  // Pink fill from front-right
  const fill = new THREE.PointLight(0xf272c8, 1.3, 20, 1.5);
  fill.position.set(4, 2.5, 2);
  scene.add(fill);

  // Cyan accent from the left
  const accent = new THREE.PointLight(0x00f0ff, 0.9, 18, 1.8);
  accent.position.set(-5, 3, 0);
  scene.add(accent);

  // Soft top fill so the back wall is lit
  const topFill = new THREE.PointLight(0xdfd9ff, 0.6, 25, 1.2);
  topFill.position.set(0, 6, 0);
  scene.add(topFill);

  // ---------- Procedural workspace ----------
  const ws = buildWorkspace(scene);
  const workspace = ws.root;
  const interactiveMeshes = [];
  workspace.traverse((obj) => {
    if (obj.isMesh && obj.userData && obj.userData.interactiveId) {
      interactiveMeshes.push(obj);
    }
  });

  // ---------- Post-processing: bloom for the neon ----------
  const composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55,   // strength (lower so plants/screens don't blow out)
    0.5,    // radius
    0.8     // threshold — only really bright things
  );
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return {
    scene,
    camera,
    renderer,
    canvas,
    workspace,
    interactiveMeshes,
    composer,
    bloomPass,
    clockGroup: ws.clockGroup,
  };
}
