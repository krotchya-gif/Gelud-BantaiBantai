const stage = document.getElementById('stage');
const status = document.getElementById('status');
try {
  // Render the actual game factory, not a second set of preview-only models.
  for (const file of ['three-legacy', 'character-roster', 'world', 'character-models', 'brawlers']) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${import.meta.env.BASE_URL}engine/${file}.js?v=${__ENGINE_BUILD_ID__}`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  if (!['dusty', 'titan', 'ace', 'fuse', 'volt'].every(id => window.Bc[id]?.visual)) {
    throw new Error('cache game masih versi lama. Buka Main game, pilih UPDATE GAME, lalu kembali ke preview.');
  }
  // Use the engine's Three.js instance throughout. Mixing two copies causes
  // geometry/material ID collisions inside the WebGL renderer caches.
  const THREE = { WebGLRenderer: window.uc, Scene: window.vt,
    HemisphereLight: window.ri, DirectionalLight: window.Si,
    OrthographicCamera: window.bi, Mesh: window.Ln,
    CylinderGeometry: window.hr, MeshStandardMaterial: window.Nr };
  const renderer = new THREE.WebGLRenderer({ canvas: stage, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x111721);
  renderer.toneMapping = 4;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xd9e8ff, 0x536075, 2.5));
  const key = new THREE.DirectionalLight(0xffe7ce, 3.4);
  key.position.set(-3, 6, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ebdff, 2.5);
  rim.position.set(3, 4, -5);
  scene.add(rim);
  const camera = new THREE.OrthographicCamera(-4, 4, 2, -2, 0.1, 40);
  const ids = ['dusty', 'titan', 'ace', 'fuse', 'volt', 'naka', 'ello', 'syafiah'];
  const platforms = [], labels = [];
  const lineupPosition = index => ({
    x: (index % 4 - 1.5) * 1.48,
    y: Math.floor(index / 4) === 0 ? 0.72 : -1.22,
    z: Math.floor(index / 4) === 0 ? 0.34 : -0.62,
  });
  const models = ids.map((id, index) => {
    const def = window.Bc[id], model = window.uu(def, 0);
    const position = lineupPosition(index);
    model.root.position.set(position.x, position.y, position.z);
    model.root.scale.setScalar(0.72);
    model.root.rotation.y = 0.45;
    scene.add(model.root);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.58, 0.045, 48),
      new THREE.MeshStandardMaterial({ color: 0x283445, roughness: 0.85 }));
    base.position.set(position.x, position.y - 0.028, position.z);
    scene.add(base);
    platforms.push(base);
    const label = document.createElement('button');
    label.type = 'button';
    label.setAttribute('aria-pressed', 'false');
    const alias = (def.alias || def.name).toUpperCase();
    const role = (def.role || 'Brawler').toUpperCase();
    label.innerHTML = `<strong style="color:#${def.palette.accent.toString(16).padStart(6, '0')}">${def.name}</strong><span>${alias} / ${role}</span>`;
    document.getElementById('names').appendChild(label);
    labels.push(label);
    return model;
  });
  let moving = false, top = false, gray = false, focusIndex = -1;
  const resize = () => {
    const width = stage.clientWidth, height = stage.clientHeight;
    renderer.setSize(width, height, false);
    const lineup = focusIndex < 0;
    const halfHeight = lineup ? Math.max(1.85, 3.5 * height / width) : Math.max(0.93, 1.02 * height / width);
    const halfWidth = lineup ? halfHeight * width / height : Math.max(0.93, 1.02 * width / height);
    camera.left = -halfWidth; camera.right = halfWidth;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.position.set(0, top ? 8 : 3.2, top ? 4.5 : 9);
    // Give the two-row lineup more breathing room above and keep the models
    // lower in the canvas, closer to their name rail.
    camera.lookAt(0, lineup ? 0.80 : 0.77, 0);
    camera.updateProjectionMatrix();
  };
  const render = () => renderer.render(scene, camera);
  const observer = new ResizeObserver(() => { resize(); render(); });
  observer.observe(stage);
  const focus = index => {
    focusIndex = index;
    models.forEach((model, i) => {
      model.root.visible = index < 0 || i === index;
      const position = index < 0 ? lineupPosition(i) : { x: 0, y: 0, z: 0 };
      model.root.position.set(position.x, position.y, position.z);
      model.root.scale.setScalar(index < 0 ? 0.72 : 1);
      platforms[i].visible = model.root.visible;
      platforms[i].position.set(position.x, position.y - 0.028, position.z);
      labels[i].setAttribute('aria-pressed', String(index === i));
    });
    document.getElementById('lineup').setAttribute('aria-pressed', String(index < 0));
    resize(); render();
  };
  labels.forEach((label, index) => label.addEventListener('click', () => focus(index)));
  document.getElementById('lineup').addEventListener('click', () => focus(-1));
  document.querySelectorAll('[data-angle]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-angle]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    models.forEach(model => { model.root.rotation.y = Number(button.dataset.angle); });
    render();
  }));
  document.getElementById('top').addEventListener('click', (event) => {
    top = !top;
    event.currentTarget.setAttribute('aria-pressed', String(top));
    resize(); render();
  });
  document.getElementById('gray').addEventListener('click', (event) => {
    gray = !gray;
    stage.style.filter = gray ? 'grayscale(1)' : '';
    event.currentTarget.setAttribute('aria-pressed', String(gray));
  });
  const animate = (now) => {
    if (!moving) return;
    const phase = now * 0.007;
    models.forEach((model, index) => {
      const walk = Math.sin(phase + index * 0.3) * 0.65;
      model.legs[0].rotation.x = walk;
      model.legs[1].rotation.x = -walk;
      model.body.position.y = Math.abs(Math.cos(phase)) * 0.035;
      model.body.rotation.x = 0.13 + (model.pose.runLean || 0);
      if (model.electricCore) model.electricCore.rotation.z = now * 0.005;
    });
    render(); requestAnimationFrame(animate);
  };
  document.getElementById('motion').addEventListener('click', event => {
    moving = !moving;
    event.currentTarget.setAttribute('aria-pressed', String(moving));
    if (moving) requestAnimationFrame(animate);
    else {
      models.forEach(model => {
        model.legs.forEach(leg => { leg.rotation.x = 0; });
        model.body.position.y = 0; model.body.rotation.x = 0;
      });
      render();
    }
  });
  resize(); render();
  status.textContent = 'Delapan model yang sama dipakai langsung di arena. Pilih nama untuk melihat detail; aktifkan grayscale untuk membandingkan siluet.';
} catch (error) {
  console.error(error);
  status.textContent = `Preview gagal dimuat: ${error.message || 'periksa koneksi lalu muat ulang'}`;
}
