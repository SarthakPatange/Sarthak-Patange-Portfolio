/* =====================================================
   SARTHAK PATANGE — PORTFOLIO
   Main Script — Interactions, 3D Viewer, Animations
   ===================================================== */

'use strict';

/* =====================================================
   UTILITY
   ===================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =====================================================
   NAV — scroll effects + mobile toggle
   ===================================================== */
(function initNav() {
  const navbar     = $('#navbar');
  const menuBtn    = $('#navMenuBtn');
  const mobileMenu = $('#navMobileMenu');
  const links      = $$('.nav-links a, .nav-mobile-link');
  let isOpen = false;

  // Transparent → frosted on scroll + dark hero handling
  const heroEl = $('#hero');

  function updateNav() {
    const scrolled = window.scrollY > 10;
    navbar.style.borderBottomColor = scrolled ? 'rgba(0,0,0,0.08)' : 'transparent';

    // Detect if we're over dark hero
    if (heroEl) {
      const heroBottom = heroEl.offsetTop + heroEl.offsetHeight;
      document.body.classList.toggle('nav-dark', window.scrollY < heroBottom - 60);
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile burger
  menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileMenu.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);

    const spans = $$('span', menuBtn);
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on mobile link click
  $$('.nav-mobile-link').forEach(a => {
    a.addEventListener('click', () => {
      isOpen = false;
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', false);
      $$('span', menuBtn).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // Active section highlight
  const sections = $$('section[id]');

  function highlightActive() {
    const y = window.scrollY + 80;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.id;
      const link   = $$(`.nav-links a[href="#${id}"], .nav-mobile-link[href="#${id}"]`);
      link.forEach(l => l.classList.toggle('active', y >= top && y < top + height));
    });
  }

  window.addEventListener('scroll', highlightActive, { passive: true });
  highlightActive();
})();

/* =====================================================
   SMOOTH SCROLL — anchor links
   ===================================================== */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* =====================================================
   SCROLL REVEAL — IntersectionObserver
   ===================================================== */
(function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal-up, .reveal-left').forEach(el => obs.observe(el));
})();

/* =====================================================
   SKILL BARS — animate when visible
   ===================================================== */
(function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bars = $$('.skill-bars li', entry.target);
      bars.forEach((li, i) => {
        const pct  = li.dataset.pct || 0;
        const fill = li.querySelector('.bar-fill');
        setTimeout(() => {
          fill.style.width = pct + '%';
        }, i * 80);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  $$('.skill-group').forEach(el => obs.observe(el));
})();

/* =====================================================
   PROJECT CARDS — expand / collapse
   ===================================================== */
(function initProjectCards() {
  $$('.project-card').forEach(card => {
    const expandPanel = card.querySelector('.project-expand');
    if (!expandPanel) return;

    // Open on card click (but not on file-chip, btn, or expand-close)
    card.addEventListener('click', e => {
      if (e.target.closest('.project-expand') ||
          e.target.closest('.file-chip') ||
          e.target.closest('.btn-apple-sm')) return;

      openExpand(expandPanel);
    });

    // Keyboard
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.project-expand')) {
        e.preventDefault();
        openExpand(expandPanel);
      }
    });

    // Close button
    const closeBtn = card.querySelector('.expand-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeExpand(expandPanel);
      });
    }

    // Close on backdrop click (clicking outside expand-inner)
    expandPanel.addEventListener('click', e => {
      if (e.target === expandPanel) closeExpand(expandPanel);
    });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $$('.project-expand.open').forEach(p => closeExpand(p));
    }
  });

  function openExpand(panel) {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Scroll panel to top
    const inner = panel.querySelector('.expand-content');
    if (inner) inner.scrollTop = 0;
  }

  function closeExpand(panel) {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
})();

/* Gallery thumbnail switcher */
function setMain(thumb, mainId) {
  const main = document.getElementById(mainId);
  if (!main) return;
  main.src = thumb.src;
  const thumbs = thumb.closest('.gallery-thumbs');
  if (thumbs) $$('img', thumbs).forEach(t => t.classList.toggle('active', t === thumb));
}

/* =====================================================
   FILES TABS
   ===================================================== */
(function initFileTabs() {
  $$('.ftab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.ftab').forEach(t => t.classList.remove('active'));
      $$('.ftab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });
})();

/* =====================================================
   FILE PREVIEW MODAL
   ===================================================== */
function openFilePreview(src, title) {
  const modal   = $('#filePreviewModal');
  const iframe  = $('#modalIframe');
  const titleEl = $('#modalTitle');
  if (!modal) return;

  titleEl.textContent = title || 'Preview';
  iframe.src = src;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeFilePreview() {
  const modal  = $('#filePreviewModal');
  const iframe = $('#modalIframe');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  iframe.src = '';
  document.body.style.overflow = '';
}

// Escape to close modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeFilePreview();
});

/* =====================================================
   3D CAD VIEWER — Three.js STL/OBJ/GLB loader
   ===================================================== */
const cadScenes = new Map();

function initCADViewer(containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.THREE) return null;

  const THREE = window.THREE;

  // Scene
  const scene    = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d0d);

  // Camera
  const width  = container.clientWidth  || 600;
  const height = container.clientHeight || 420;
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
  camera.position.set(2, 1.5, 3);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // Clear existing canvas
  container.querySelectorAll('canvas').forEach(c => c.remove());
  container.appendChild(renderer.domElement);

  // Hide placeholder
  const placeholder = container.querySelector('.cad-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x99ccff, 0.4);
  fillLight.position.set(-5, -2, -3);
  scene.add(fillLight);

  // Grid
  const grid = new THREE.GridHelper(10, 20, 0x222222, 0x222222);
  scene.add(grid);

  // Controls — custom orbit (no OrbitControls in r128 CDN)
  let isDragging = false, isRightDrag = false;
  let prevMouse  = { x: 0, y: 0 };
  let spherical  = { theta: 0.5, phi: Math.PI / 3, radius: 4 };
  const target   = new THREE.Vector3(0, 0, 0);

  function updateCamera() {
    camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi);
    camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(target);
  }

  updateCamera();

  renderer.domElement.addEventListener('mousedown', e => {
    isDragging   = true;
    isRightDrag  = e.button === 2;
    prevMouse.x  = e.clientX;
    prevMouse.y  = e.clientY;
  });

  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;

    if (isRightDrag) {
      // Pan
      const panSpeed = 0.005;
      const right    = new THREE.Vector3();
      const up       = new THREE.Vector3();
      right.crossVectors(new THREE.Vector3(0,1,0), camera.position.clone().sub(target)).normalize();
      up.set(0, 1, 0);
      target.addScaledVector(right, dx * panSpeed);
      target.addScaledVector(up, -dy * panSpeed);
    } else {
      // Orbit
      spherical.theta -= dx * 0.008;
      spherical.phi    = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy * 0.008));
    }

    updateCamera();
  });

  document.addEventListener('mouseup', () => { isDragging = false; });

  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    spherical.radius = Math.max(0.5, Math.min(20, spherical.radius + e.deltaY * 0.01));
    updateCamera();
  }, { passive: false });

  // Touch support
  let lastTouchDist = 0;
  let lastTouchPos  = null;

  renderer.domElement.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  });

  renderer.domElement.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && lastTouchPos) {
      const dx = e.touches[0].clientX - lastTouchPos.x;
      const dy = e.touches[0].clientY - lastTouchPos.y;
      spherical.theta -= dx * 0.01;
      spherical.phi    = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy * 0.01));
      lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      updateCamera();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      spherical.radius = Math.max(0.5, Math.min(20, spherical.radius - (dist - lastTouchDist) * 0.02));
      lastTouchDist = dist;
      updateCamera();
    }
  }, { passive: false });

  // Resize
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);

  // Animation loop
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  const ctx = { scene, camera, renderer, spherical, target, updateCamera, animId };
  cadScenes.set(containerId, ctx);
  return ctx;
}

/* Load model from URL or File */
function loadCADModel(src, containerId = 'cad-viewer-main') {
  if (!window.THREE) {
    console.warn('Three.js not loaded');
    return;
  }

  const THREE = window.THREE;
  let ctx = cadScenes.get(containerId);
  if (!ctx) ctx = initCADViewer(containerId);
  if (!ctx) return;

  const { scene } = ctx;

  // Remove existing model meshes
  const toRemove = [];
  scene.traverse(obj => { if (obj.userData.isModel) toRemove.push(obj); });
  toRemove.forEach(obj => scene.remove(obj));

  // Determine file type
  const isFile   = src instanceof File;
  const fileName = isFile ? src.name.toLowerCase() : src.toLowerCase();
  const ext      = fileName.split('.').pop();

  function onModelLoaded(group) {
    group.userData.isModel = true;

    // Auto-center and scale
    const box    = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale  = 2.5 / maxDim;

    group.position.sub(center.multiplyScalar(scale));
    group.scale.setScalar(scale);

    scene.add(group);

    // Reset camera
    ctx.spherical.radius = 4;
    ctx.spherical.theta  = 0.5;
    ctx.spherical.phi    = Math.PI / 3;
    ctx.target.set(0, 0, 0);
    ctx.updateCamera();
  }

  function getURL() {
    return isFile ? URL.createObjectURL(src) : src;
  }

  // GLB/GLTF
  if (ext === 'glb' || ext === 'gltf') {
    // Inline minimal GLB loader using fetch + parse
    // For full support, include GLTFLoader. Here we provide a fallback message.
    const url = getURL();

    if (window.GLTFLoader) {
      const loader = new window.GLTFLoader();
      loader.load(url, gltf => onModelLoaded(gltf.scene), undefined, err => console.error(err));
    } else {
      // Show instruction
      showCADMessage(containerId, '⚠️ For GLB/GLTF: include GLTFLoader.js in your project.\nSTL and OBJ files work directly.');
    }
    return;
  }

  // OBJ
  if (ext === 'obj') {
    const url = getURL();
    fetch(url)
      .then(r => r.text())
      .then(text => {
        const group = parseOBJ(text, THREE);
        onModelLoaded(group);
        if (isFile) URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error(err);
        showCADMessage(containerId, '❌ Failed to load OBJ file.');
      });
    return;
  }

  // STL
  if (ext === 'stl') {
    const url = getURL();
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(buffer => {
        const geometry = parseSTL(buffer, THREE);
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.4,
          roughness: 0.6
        });
        const mesh = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();
        group.add(mesh);
        onModelLoaded(group);
        if (isFile) URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error(err);
        showCADMessage(containerId, '❌ Failed to load STL file.');
      });
    return;
  }

  showCADMessage(containerId, `⚠️ Unsupported format: .${ext}\nSupported: .stl, .obj, .glb, .gltf`);
}

function showCADMessage(containerId, msg) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let ph = container.querySelector('.cad-placeholder');
  if (!ph) {
    ph = document.createElement('div');
    ph.className = 'cad-placeholder';
    container.appendChild(ph);
  }
  ph.style.display = '';
  ph.innerHTML = `<div class="cad-icon">⚠️</div><p>${msg.replace(/\n/g,'<br>')}</p>`;
}

/* Minimal STL parser */
function parseSTL(buffer, THREE) {
  const geometry = new THREE.BufferGeometry();
  const data     = new DataView(buffer);

  // Check ASCII vs binary
  const header = new Uint8Array(buffer, 0, 80);
  const isBinary = !String.fromCharCode(...header.slice(0, 5)).startsWith('solid') ||
                   data.getUint32(80, true) * 50 + 84 === buffer.byteLength;

  if (!isBinary) {
    // ASCII
    const text   = new TextDecoder().decode(buffer);
    const positions = [];
    const regex  = /facet normal[^]*?endloop/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const nums = match[0].match(/-?\d+\.?\d*(?:[eE][+-]?\d+)?/g).map(Number);
      // nums[0..2] = normal, then 3 vertices × 3
      for (let i = 3; i < nums.length; i++) positions.push(nums[i]);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }

  // Binary
  const triCount  = data.getUint32(80, true);
  const positions = new Float32Array(triCount * 9);
  let offset = 84, pi = 0;

  for (let i = 0; i < triCount; i++) {
    offset += 12; // skip normal
    for (let v = 0; v < 3; v++) {
      positions[pi++] = data.getFloat32(offset, true);
      positions[pi++] = data.getFloat32(offset + 4, true);
      positions[pi++] = data.getFloat32(offset + 8, true);
      offset += 12;
    }
    offset += 2; // attribute byte count
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/* Minimal OBJ parser */
function parseOBJ(text, THREE) {
  const verts  = [];
  const uvs    = [];
  const norms  = [];
  const positions = [];
  const normals   = [];

  const lines = text.split('\n');

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === 'v')  verts.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
    if (parts[0] === 'vn') norms.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
    if (parts[0] === 'f') {
      const face = parts.slice(1).map(p => {
        const idx = p.split('/');
        return { v: parseInt(idx[0]) - 1, n: idx[2] ? parseInt(idx[2]) - 1 : -1 };
      });
      // Triangulate
      for (let i = 1; i < face.length - 1; i++) {
        [face[0], face[i], face[i+1]].forEach(f => {
          positions.push(verts[f.v*3], verts[f.v*3+1], verts[f.v*3+2]);
          if (f.n >= 0) normals.push(norms[f.n*3], norms[f.n*3+1], norms[f.n*3+2]);
        });
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  else geo.computeVertexNormals();

  const mat   = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.35, roughness: 0.65 });
  const mesh  = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

/* File input handler for CAD uploads */
document.addEventListener('DOMContentLoaded', () => {
  // Main CAD file input
  const mainInput = $('#cad-main-file-input');
  if (mainInput) {
    mainInput.addEventListener('change', function() {
      if (this.files[0]) loadCADModel(this.files[0], 'cad-viewer-main');
    });
  }

  // Per-project file inputs
  $$('.cad-file-input').forEach(input => {
    input.addEventListener('change', function() {
      const viewerId = this.dataset.viewer;
      if (this.files[0] && viewerId) loadCADModel(this.files[0], viewerId);
    });
  });
});

/* =====================================================
   PARALLAX — hero grid follows scroll
   ===================================================== */
(function initParallax() {
  const grid = $('.hero-bg-grid');
  if (!grid) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      grid.style.transform = `translateY(${y * 0.3}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* =====================================================
   CURSOR GLOW — subtle accent on desktop
   ===================================================== */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position:     'fixed',
    pointerEvents:'none',
    zIndex:       '9997',
    width:        '280px',
    height:       '280px',
    borderRadius: '50%',
    background:   'radial-gradient(circle, rgba(0,102,204,0.04) 0%, transparent 70%)',
    transform:    'translate(-50%, -50%)',
    transition:   'opacity 0.3s',
    top:          '0',
    left:         '0',
  });
  document.body.appendChild(glow);

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  (function loop() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* =====================================================
   HERO PHOTO — slight mouse-follow tilt
   ===================================================== */
(function initHeroTilt() {
  const ring = $('.hero-photo-ring');
  if (!ring) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const rx = ((e.clientY - cy) / cy) * -8;
    const ry = ((e.clientX - cx) / cx) *  8;
    ring.style.transform = `perspective(400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }, { passive: true });

  ring.addEventListener('mouseleave', () => { ring.style.transform = ''; });
})();

/* =====================================================
   STAT COUNTER ANIMATION (intro meta numbers)
   ===================================================== */
(function initCounters() {
  const els = $$('.meta-num');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw.match(/[\d.]+/));
      const sfx = raw.replace(/[\d.]+/, '');
      if (isNaN(num)) return;

      const dur   = 1200;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        const v = num <= 10 ? (e * num).toFixed(0) : Math.round(e * num);
        el.textContent = v + sfx;
        if (t < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  els.forEach(el => obs.observe(el));
})();

/* =====================================================
   ACHIEVEMENT CARDS — sequential reveal
   ===================================================== */
(function initAchievements() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.ach-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('in-view'), i * 80);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  const achSection = $('.achievements-section');
  if (achSection) obs.observe(achSection);
})();

// Apply same reveal styles to ach-cards
document.querySelectorAll('.ach-card').forEach(c => {
  c.style.opacity = '0';
  c.style.transform = 'translateY(28px)';
  c.style.transition = 'opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
});

document.addEventListener('DOMContentLoaded', () => {
  // Already handled by IntersectionObserver above
  // But ensure in-view class applies styles
  const style = document.createElement('style');
  style.textContent = '.ach-card.in-view { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);
});
