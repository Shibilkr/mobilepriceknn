'use strict';

// ── FEATURE RANGES (for normalization) ──────────────────
const RANGES = {
  ram:         { min:256,  max:4096 },
  battery:     { min:500,  max:6000 },
  internal:    { min:2,    max:256  },
  cam_px:      { min:2,    max:108  },
  fc:          { min:0,    max:64   },
  clock_speed: { min:0.5,  max:3.5  },
  n_cores:     { min:1,    max:8    },
  px_height:   { min:480,  max:2400 },
  px_width:    { min:320,  max:1440 },
  four_g:      { min:0,    max:1    },
  wifi:        { min:0,    max:1    },
  bluetooth:   { min:0,    max:1    },
  dual_sim:    { min:0,    max:1    },
  touch_screen:{ min:0,    max:1    },
};

const KEYS = Object.keys(RANGES);

// ── PRICE CLASS META ────────────────────────────────────
const CLASSES = [
  {
    label:   'Low Cost',
    range:   'Under ₹8,000  /  Under $100',
    emoji:   '💵',
    color:   '#d8d5cf',
    alpha:   'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.15)',
    brands: [
      { brand:'Redmi',   model:'Redmi A3',          price:'₹6,499',  img:'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-a3-1.jpg' },
      { brand:'Redmi',   model:'Redmi 13C',          price:'₹7,499',  img:'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-13c-1.jpg' },
      { brand:'Samsung', model:'Galaxy A03',         price:'₹7,999',  img:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a03-1.jpg' },
      { brand:'Lava',    model:'Lava Blaze',         price:'₹7,699',  img:'https://fdn2.gsmarena.com/vv/pics/lava/lava-blaze-1.jpg' },
      { brand:'Realme',  model:'Realme C53',         price:'₹7,999',  img:'https://fdn2.gsmarena.com/vv/pics/realme/realme-c53-1.jpg' },
      { brand:'POCO',    model:'POCO C65',           price:'₹6,999',  img:'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-c65-1.jpg' },
    ]
  },
  {
    label:   'Mid Range',
    range:   '₹8,000 – ₹20,000  /  $100–$250',
    emoji:   '💰',
    color:   '#d8d5cf',
    alpha:   'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.15)',
    brands: [
      { brand:'Redmi',   model:'Redmi Note 13',      price:'₹14,999', img:'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-1.jpg' },
      { brand:'Samsung', model:'Galaxy A35 5G',      price:'₹19,999', img:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a35-1.jpg' },
      { brand:'iQOO',    model:'iQOO Z9x',           price:'₹12,999', img:'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-z9x-1.jpg' },
      { brand:'Moto',    model:'Moto G54 5G',        price:'₹13,999', img:'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-moto-g54-1.jpg' },
      { brand:'OnePlus', model:'Nord CE 3 Lite',     price:'₹16,499', img:'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-ce3-lite-1.jpg' },
      { brand:'Realme',  model:'Realme 12+ 5G',      price:'₹18,999', img:'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-plus-1.jpg' },
    ]
  },
  {
    label:   'Upper Mid',
    range:   '₹20,000 – ₹50,000  /  $250–$600',
    emoji:   '💎',
    color:   '#d8d5cf',
    alpha:   'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.15)',
    brands: [
      { brand:'Samsung', model:'Galaxy A55 5G',      price:'₹34,999', img:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg' },
      { brand:'Google',  model:'Pixel 8a',           price:'₹49,999', img:'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8a-1.jpg' },
      { brand:'Nothing', model:'Phone (2a)',          price:'₹23,999', img:'https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-2a-1.jpg' },
      { brand:'Vivo',    model:'Vivo V30e',          price:'₹27,999', img:'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30e-1.jpg' },
      { brand:'OnePlus', model:'OnePlus 12R',        price:'₹39,999', img:'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12r-1.jpg' },
      { brand:'Realme',  model:'Realme GT 6T',       price:'₹30,999', img:'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6t-1.jpg' },
    ]
  },
  {
    label:   'Premium',
    range:   'Above ₹50,000  /  Above $600',
    emoji:   '👑',
    color:   '#d8d5cf',
    alpha:   'rgba(255,255,255,0.04)',
    border:  'rgba(255,255,255,0.15)',
    brands: [
      { brand:'Apple',   model:'iPhone 16',          price:'₹79,900', img:'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-1.jpg' },
      { brand:'Samsung', model:'Galaxy S24 Ultra',   price:'₹1,29,999',img:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-1.jpg' },
      { brand:'OnePlus', model:'OnePlus 13',         price:'₹69,999', img:'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-13-1.jpg' },
      { brand:'Google',  model:'Pixel 9 Pro',        price:'₹1,09,999',img:'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-pro-1.jpg' },
      { brand:'Apple',   model:'iPhone 16 Pro Max',  price:'₹1,44,900',img:'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg' },
      { brand:'Samsung', model:'Galaxy Z Fold 6',   price:'₹1,64,999',img:'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold6-1.jpg' },
    ]
  }
];

// ── TRAINING DATA GENERATOR ─────────────────────────────
function makeSeed(n) {
  let x = Math.sin(n) * 99999;
  return x - Math.floor(x);
}

function generateData() {
  const rows = [];

  // Class 0 — Low Cost (30 samples)
  for (let i = 0; i < 30; i++) {
    rows.push({
      ram: 256 + Math.floor(makeSeed(i*7+1) * 768),
      battery: 500 + Math.floor(makeSeed(i*3+2) * 1500),
      internal: 2 + Math.floor(makeSeed(i*5+3) * 28),
      cam_px: 2 + Math.floor(makeSeed(i*11+4) * 12),
      fc: Math.floor(makeSeed(i*13+5) * 5),
      clock_speed: +(0.5 + makeSeed(i*17+6) * 1.0).toFixed(1),
      n_cores: 1 + Math.floor(makeSeed(i*19+7) * 3),
      px_height: 480 + Math.floor(makeSeed(i*23+8) * 480),
      px_width: 320 + Math.floor(makeSeed(i*29+9) * 400),
      four_g: 0, wifi: Math.round(makeSeed(i*31+10)),
      bluetooth: 0, dual_sim: Math.round(makeSeed(i*37+11)), touch_screen: Math.round(makeSeed(i*41+12)),
      label: 0
    });
  }

  // Class 1 — Mid Range (30 samples)
  for (let i = 0; i < 30; i++) {
    rows.push({
      ram: 1024 + Math.floor(makeSeed(i*7+101) * 1024),
      battery: 2000 + Math.floor(makeSeed(i*3+102) * 1500),
      internal: 16 + Math.floor(makeSeed(i*5+103) * 48),
      cam_px: 8 + Math.floor(makeSeed(i*11+104) * 24),
      fc: 2 + Math.floor(makeSeed(i*13+105) * 14),
      clock_speed: +(1.2 + makeSeed(i*17+106) * 0.8).toFixed(1),
      n_cores: 2 + Math.floor(makeSeed(i*19+107) * 4),
      px_height: 720 + Math.floor(makeSeed(i*23+108) * 560),
      px_width: 540 + Math.floor(makeSeed(i*29+109) * 300),
      four_g: Math.round(makeSeed(i*31+110)), wifi: 1,
      bluetooth: Math.round(makeSeed(i*37+111)), dual_sim: Math.round(makeSeed(i*41+112)), touch_screen: 1,
      label: 1
    });
  }

  // Class 2 — Upper Mid (30 samples)
  for (let i = 0; i < 30; i++) {
    rows.push({
      ram: 2048 + Math.floor(makeSeed(i*7+201) * 1024),
      battery: 3000 + Math.floor(makeSeed(i*3+202) * 1500),
      internal: 64 + Math.floor(makeSeed(i*5+203) * 64),
      cam_px: 32 + Math.floor(makeSeed(i*11+204) * 40),
      fc: 12 + Math.floor(makeSeed(i*13+205) * 20),
      clock_speed: +(2.0 + makeSeed(i*17+206) * 0.8).toFixed(1),
      n_cores: 6 + Math.floor(makeSeed(i*19+207) * 2),
      px_height: 1280 + Math.floor(makeSeed(i*23+208) * 720),
      px_width: 720 + Math.floor(makeSeed(i*29+209) * 360),
      four_g: 1, wifi: 1,
      bluetooth: 1, dual_sim: Math.round(makeSeed(i*41+210)), touch_screen: 1,
      label: 2
    });
  }

  // Class 3 — Premium (30 samples)
  for (let i = 0; i < 30; i++) {
    rows.push({
      ram: 3072 + Math.floor(makeSeed(i*7+301) * 1024),
      battery: 4000 + Math.floor(makeSeed(i*3+302) * 2000),
      internal: 128 + Math.floor(makeSeed(i*5+303) * 128),
      cam_px: 64 + Math.floor(makeSeed(i*11+304) * 44),
      fc: 32 + Math.floor(makeSeed(i*13+305) * 32),
      clock_speed: +(2.8 + makeSeed(i*17+306) * 0.7).toFixed(1),
      n_cores: 8,
      px_height: 1800 + Math.floor(makeSeed(i*23+308) * 600),
      px_width: 1080 + Math.floor(makeSeed(i*29+309) * 360),
      four_g: 1, wifi: 1,
      bluetooth: 1, dual_sim: 1, touch_screen: 1,
      label: 3
    });
  }

  return rows;
}

const TRAIN = generateData();

// ── KNN ─────────────────────────────────────────────────
function norm(v, key) {
  const { min, max } = RANGES[key];
  return (v - min) / (max - min);
}

function dist(a, b) {
  let s = 0;
  for (const k of KEYS) s += (norm(a[k], k) - norm(b[k], k)) ** 2;
  return Math.sqrt(s);
}

function knn(query, k = 5) {
  const sorted = TRAIN
    .map(s => ({ d: dist(query, s), label: s.label }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);

  const votes = [0, 0, 0, 0];
  sorted.forEach(n => votes[n.label]++);

  const predicted = votes.indexOf(Math.max(...votes));
  return { predicted, confidence: votes[predicted] / k, votes };
}

// ── SLIDERS ──────────────────────────────────────────────
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

  // resolution (two sliders → one label)
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

// ── RENDER RESULT ─────────────────────────────────────────
const CLASS_COLORS = ['#aaaaaa','#777777','#444444','#111111'];
const CLASS_NAMES  = ['Low Cost','Mid Range','Upper Mid','Premium'];

function renderResult({ predicted, confidence, votes }) {
  const cls = CLASSES[predicted];
  const pct = Math.round(confidence * 100);

  // Show output panel
  document.getElementById('idle-state').style.display = 'none';
  const out = document.getElementById('output');
  out.style.display = 'block';

  // Price badge
  const badge = document.getElementById('price-badge');
  badge.style.background = cls.alpha;
  badge.style.borderColor = cls.border;
  document.getElementById('price-emoji').textContent = cls.emoji;
  const tierEl = document.getElementById('price-tier');
  tierEl.textContent = cls.label;
  tierEl.style.color = cls.color;
  document.getElementById('price-range').textContent = cls.range;

  // Result card border glow
  document.getElementById('result-card').style.borderColor = cls.border;

  // Confidence
  setTimeout(() => {
    document.getElementById('conf-bar').style.width = pct + '%';
  }, 80);
  document.getElementById('conf-pct').textContent = pct + '%';

  // Brand suggestions
  const grid = document.getElementById('brands-grid');
  grid.innerHTML = '';
  cls.brands.forEach(b => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.style.borderColor = cls.border;
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

  // Vote breakdown
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
  // Animate bars
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

// ── PREDICT HANDLER ───────────────────────────────────────
function predict() {
  const btn = document.getElementById('predict-btn');
  btn.classList.add('loading');
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="animation:spin 0.8s linear infinite"><path d="M10 2a8 8 0 1 0 8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Classifying…`;

  setTimeout(() => {
    const query = readForm();
    const result = knn(query, 5);
    renderResult(result);

    btn.classList.remove('loading');
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg> Predict Price Range`;
  }, 500);
}

// ── SPIN ANIMATION ────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`;
document.head.appendChild(style);

// ── INIT ──────────────────────────────────────────────────
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
