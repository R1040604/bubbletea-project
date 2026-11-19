import './style.css';

import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// De 3D-scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8d7ef);
// Laad de 360°-omgeving
const hdrLoader = new HDRLoader();

hdrLoader.load(
  '/qwantani_dusk_2_puresky_1k.hdr',

  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    // De HDRI wordt zichtbaar als achtergrond.
    scene.background = texture;

    // De HDRI geeft ook licht en reflecties aan het model.
    scene.environment = texture;
  },

  undefined,

  function (error) {
    console.error('De HDRI kon niet worden geladen:', error);
  }
);

// De camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

camera.position.set(0, 1, 4);

// De renderer tekent de scene op de pagina
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

// Bediening met de muis
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Licht
// Zacht licht dat het model van alle kanten wat oplicht
const omgevingslicht = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(omgevingslicht);

// Hoofdlamp: schijnt van rechtsvoor
const hoofdlamp = new THREE.DirectionalLight(0xffffff, 3);
hoofdlamp.position.set(3, 4, 5);
scene.add(hoofdlamp);

// Extra lamp: verlicht de linkerkant
const linkerlamp = new THREE.DirectionalLight(0xffffff, 2);
linkerlamp.position.set(-4, 2, 3);
scene.add(linkerlamp);

// Extra lamp: verlicht de achterkant
const achterlamp = new THREE.DirectionalLight(0xffd8f5, 1.5);
achterlamp.position.set(0, 3, -4);
scene.add(achterlamp);

// Het model laden
const melding = document.querySelector('#melding');
const loader = new GLTFLoader();

loader.load(
  // Bestanden uit public worden vanaf de hoofdmap geladen.
  '/19-11-2026.glb',

  function (gltf) {
    const model = gltf.scene;

    // Grootte en midden van het model berekenen
    const box = new THREE.Box3().setFromObject(model);
    const grootte = new THREE.Vector3();
    const midden = new THREE.Vector3();

    box.getSize(grootte);
    box.getCenter(midden);

    const grootsteMaat = Math.max(
      grootte.x,
      grootte.y,
      grootte.z
    );

    if (grootsteMaat === 0) {
      melding.textContent = 'Het model heeft geen zichtbare grootte.';
      return;
    }

    // Model schalen en centreren
    const schaal = 2 / grootsteMaat;

    model.scale.setScalar(schaal);
    model.position.copy(midden).multiplyScalar(-schaal);

    scene.add(model);

    controls.target.set(0, 0, 0);
    controls.update();

    melding.textContent = '';
  },

  undefined,

  function (error) {
    console.error('Fout bij het laden van het model:', error);

    melding.textContent =
      'Het model kon niet worden geladen. Controleer de naam en de map public.';
  }
);

// Aanpassen wanneer het scherm van grootte verandert
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Scene blijven tekenen
function animate() {
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);