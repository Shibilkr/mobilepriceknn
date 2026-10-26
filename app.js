'use strict';

// ── SLIDERS INITIALIZATION ────────────────────────────────
function initSliders() {
  const sliders = [
    { id: 'ram',         fmt: v => v + ' MB' },
    { id: 'battery',     fmt: v => v + ' mAh' },
    { id: 'internal',    fmt: v => v + ' GB' },
    { id: 'cam_px',      fmt: v => v + ' MP' },
    { id: 'fc',          fmt: v => v + ' MP' },
    { id: 'clock_speed', fmt: v => parseFloat(v).toFixed(1) + ' GHz' },
    { id: 'n_cores',     fmt: v => v + ' cores' },
  ];

  sliders.forEach(({ id, fmt }) => {
    const el = document.getElementById(id);
    const disp = document.getElementById(id + '-val');
    if (!el || !disp) return;
    const update = () => { disp.textContent = fmt(el.value); };
    el.addEventListener('input', update);
    update();
  });

  // Screen resolution (two sliders → one combined label)
  const ph = document.getElementById('px_height');
  const pw = document.getElementById('px_width');
  const rv = document.getElementById('px_height-val');
  const update = () => { rv.textContent = ph.value + ' × ' + pw.value; };
  ph.addEventListener('input', update);
  pw.addEventListener('input', update);
  update();
}

// ── READ FORM ────────────────────────────────────────────
function readForm() {
  return {
    ram:          +document.getElementById('ram').value,
    battery:      +document.getElementById('battery').value,
    internal:     +document.getElementById('internal').value,
    cam_px:       +document.getElementById('cam_px').value,
    fc:           +document.getElementById('fc').value,
    clock_speed:  +document.getElementById('clock_speed').value,
    n_cores:      +document.getElementById('n_cores').value,
    px_height:    +document.getElementById('px_height').value,
    px_width:     +document.getElementById('px_width').value,
    four_g:       document.getElementById('four_g').checked ? 1 : 0,
    wifi:         document.getElementById('wifi').checked ? 1 : 0,
    bluetooth:    document.getElementById('bluetooth').checked ? 1 : 0,
    dual_sim:     document.getElementById('dual_sim').checked ? 1 : 0,
    touch_screen: document.getElementById('touch_screen').checked ? 1 : 0,
  };
}

// ── RENDER RESULT (RECEIVED FROM PYTHON) ──────────────────
const CLASS_COLORS = ['#aaaaaa', '#777777', '#444444', '#111111'];
const CLASS_NAMES  = ['Low Cost', 'Mid Range', 'Upper Mid', 'Premium'];

function renderResult(result) {
  const { predicted, confidence, votes, class_info } = result;
  const pct = Math.round(confidence * 100);

  // Show output panel, hide idle placeholder
  document.getElementById('idle-state').style.display = 'none';
  const out = document.getElementById('output');
  out.style.display = 'block';

  // Price badge
  const badge = document.getElementById('price-badge');
  badge.style.background = class_info.alpha || 'rgba(255,255,255,0.04)';
  badge.style.borderColor = class_info.border || 'rgba(255,255,255,0.15)';
  document.getElementById('price-emoji').textContent = class_info.emoji;
  const tierEl = document.getElementById('price-tier');
  tierEl.textContent = class_info.label;
  tierEl.style.color = class_info.color || '#d8d5cf';
  document.getElementById('price-range').textContent = class_info.range;

  // Result card border glow
  document.getElementById('result-card').style.borderColor = class_info.border || 'rgba(255,255,255,0.15)';

  // Confidence bar
  setTimeout(() => {
    document.getElementById('conf-bar').style.width = pct + '%';
  }, 80);
  document.getElementById('conf-pct').textContent = pct + '%';

  // Brand suggestions from Python model
  const grid = document.getElementById('brands-grid');
  grid.innerHTML = '';
  if (class_info.brands && Array.isArray(class_info.brands)) {
    class_info.brands.forEach(b => {
      const card = document.createElement('div');
      card.className = 'brand-card';
      card.style.borderColor = class_info.border || 'rgba(255,255,255,0.15)';
      card.innerHTML = `
        <div class="brand-img-wrap">
          <img class="brand-img" src="${b.img}" alt="${b.brand} ${b.model}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <span class="brand-img-fallback" style="display:none">📱</span>
        </div>
        <div class="brand-info">
          <div class="brand-name">${b.brand}</div>
          <div class="phone-name">${b.model}</div>
          <div class="phone-price-tag">${b.price}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Vote breakdown from Python KNN
  const list = document.getElementById('votes-list');
  list.innerHTML = '';
  const maxVote = Math.max(...votes);
  votes.forEach((v, i) => {
    const row = document.createElement('div');
    row.className = 'vote-row';
    const barW = maxVote > 0 ? Math.round((v / maxVote) * 100) : 0;
    row.innerHTML = `
      <span class="vote-label">${CLASS_NAMES[i]}</span>
      <div class="vote-track">
        <div class="vote-fill" style="width:0%;background:${CLASS_COLORS[i]}" data-w="${barW}"></div>
      </div>
      <span class="vote-count">${v}/5</span>
    `;
    list.appendChild(row);
  });

  // Animate vote bars
  requestAnimationFrame(() => {
    list.querySelectorAll('.vote-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  });
}

// ── RESET ─────────────────────────────────────────────────
function reset() {
  document.getElementById('idle-state').style.display = 'block';
  document.getElementById('output').style.display = 'none';
  document.getElementById('result-card').style.borderColor = '';
  document.getElementById('conf-bar').style.width = '0';
}

// ── PREDICT HANDLER (CALLS PYTHON KNN BACKEND) ─────────────
async function predict() {
  const btn = document.getElementById('predict-btn');
  btn.classList.add('loading');
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="animation:spin 0.8s linear infinite"><path d="M10 2a8 8 0 1 0 8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Running Python KNN…`;

  const query = readForm();

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    renderResult(data);
  } catch (err) {
    console.error('Python KNN Request Error:', err);
    alert(
      '⚠️ Python Backend Offline\n\n' +
      'Please run the Python backend in your terminal using:\n' +
      '   python3 app.py\n\n' +
      'Then visit http://127.0.0.1:8000 in your browser.'
    );
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg> Predict Price Range`;
  }
}

// ── SPIN ANIMATION ────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`;
document.head.appendChild(style);

// ── INITIALIZATION ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  document.getElementById('predict-btn').addEventListener('click', predict);
  document.getElementById('reset-btn').addEventListener('click', reset);

  // Model details toggle
  const detailsBtn = document.getElementById('details-toggle-btn');
  const detailsContent = document.getElementById('details-content');
  if (detailsBtn && detailsContent) {
    detailsBtn.addEventListener('click', () => {
      const isClosed = detailsContent.style.display === 'none';
      detailsContent.style.display = isClosed ? 'block' : 'none';
      detailsBtn.classList.toggle('open', isClosed);
      detailsBtn.setAttribute('aria-expanded', isClosed);
      const icon = detailsBtn.querySelector('.toggle-icon');
      if (icon) icon.textContent = isClosed ? '▾' : '▸';
    });
  }
});
