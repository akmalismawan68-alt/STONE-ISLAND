/* ============================================================
   STONE ISLAND — script.js
   ============================================================ */

/* ===== CART ===== */
function getCart() {
  try { return JSON.parse(localStorage.getItem('si_cart')) || []; }
  catch { return []; }
}
function saveCart(c) {
  localStorage.setItem('si_cart', JSON.stringify(c));
  updateCartBadge();
}
function updateCartBadge() {
  const c = getCart();
  const t = c.reduce((s, i) => s + (i.jumlah || 1), 0);
  const b = document.getElementById('cartBadge');
  if (b) b.textContent = t;
}
function showToast(msg) {
  const t = document.getElementById('toastNotif');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ===== LOGIN MODAL ===== */
function showLoginModal() {
  document.getElementById('loginModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeLoginModal(e) {
  if (e && e.target !== document.getElementById('loginModal')) return;
  document.getElementById('loginModal').classList.remove('show');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLoginModal();
});

/* ===== CART ADD ===== */
function tambahKeKeranjang(nama, pg, qtyId, img, fp) {
  if (!localStorage.getItem('loggedUser')) { showLoginModal(); return; }
  let harga = fp || 0;
  if (pg) {
    const s = document.querySelector('input[name="' + pg + '"]:checked');
    if (s) harga = parseInt(s.value);
  }
  const jumlah = parseInt(document.getElementById(qtyId).value) || 1;
  const cart = getCart();
  const idx = cart.findIndex(i => i.nama === nama && i.harga === harga);
  if (idx > -1) cart[idx].jumlah = (cart[idx].jumlah || 1) + jumlah;
  else cart.push({ nama, harga, jumlah, img });
  saveCart(cart);
  showToast('✅ ' + (nama.length > 30 ? nama.substring(0, 30) + '…' : nama) + ' ditambahkan!');
}

/* ===== SIDEBAR ===== */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

/* ===== FILTER ===== */
let activeFilter = null;
function filterKategori(k, el) {
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  if (activeFilter === k) { activeFilter = null; resetFilter(); return; }
  el.classList.add('active');
  activeFilter = k;
  document.querySelectorAll('.product-card').forEach(c => c.classList.toggle('hidden', c.dataset.kategori !== k));
  document.getElementById('filterResetBtn').style.display = 'inline-block';
}
function resetFilter() {
  activeFilter = null;
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('hidden'));
  document.getElementById('filterResetBtn').style.display = 'none';
}

/* ===== SEARCH ===== */
const products = [
  { nama: "Stone Island Kid's Logo Embroidered Baseball Cap, Blue", harga: "Rp 1.263.457", img: "topi.jpg" },
  { nama: "Stone Island Men Compass Hooded Jacket",               harga: "Rp 12.765.683", img: "jaket2.jpg" },
  { nama: "Stone Island Men's Logo Print T-Shirt, White",         harga: "Rp 2.150.000",  img: "kaos.jpg" },
  { nama: "Stone Island Compass Patch Shoulder Bag",              harga: "Rp 3.450.000",  img: "tas1.webp" },
  { nama: "Stone Island FW22 Waistbag",                           harga: "Rp 101.700",    img: "sg-11134201-7rd55-lug8ck6g9m3108_avif.webp" },
  { nama: "Crewneck Stone Island Green Military",                  harga: "Rp 4.465.000",  img: "id-11134207-8224s-mhr5vs5u21vq55_avif.webp" }
];
function handleSearch(val) {
  const q    = val.trim().toLowerCase();
  const box  = document.getElementById('searchResult');
  const none = document.getElementById('noResult');
  const grid = document.getElementById('searchResultGrid');
  document.getElementById('searchKeyword').textContent = val;
  if (!q) { box.style.display = 'none'; none.style.display = 'none'; return; }
  const found = products.filter(p => p.nama.toLowerCase().includes(q));
  if (!found.length) { box.style.display = 'none'; none.style.display = 'block'; return; }
  none.style.display = 'none';
  box.style.display  = 'block';
  grid.innerHTML = found.map(p =>
    `<div class="search-card">
       <img src="${p.img}" alt="${p.nama}" onerror="this.src='https://placehold.co/140x100/222/555?text=No+Image'">
       <h5>${p.nama}</h5><p>${p.harga}</p>
     </div>`
  ).join('');
}

/* ===== AUTH ===== */
function handleAuthBtn() {
  if (localStorage.getItem('loggedUser')) {
    localStorage.removeItem('loggedUser');
    location.reload();
  } else {
    window.location.href = 'login_combined.html';
  }
}

/* ===== PRODUCT IMAGE SLIDER ===== */
const _slider = {};

function _buildDots(trackId) {
  const state     = _slider[trackId];
  const container = document.getElementById('dots-' + trackId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < state.count; i++) {
    const d = document.createElement('button');
    d.className    = 'slider-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Gambar ' + (i + 1));
    d.addEventListener('click', (function(idx) { return function() { goToSlide(trackId, idx); }; })(i));
    container.appendChild(d);
  }
}

function goToSlide(trackId, index) {
  const s = _slider[trackId];
  if (!s) return;
  s.cur = ((index % s.count) + s.count) % s.count;
  const track = document.getElementById(trackId);
  if (track) track.style.transform = 'translateX(-' + s.cur * 100 + '%)';
  document.querySelectorAll('#dots-' + trackId + ' .slider-dot')
    .forEach((d, i) => d.classList.toggle('active', i === s.cur));
}

function slideMove(trackId, dir) {
  const s = _slider[trackId];
  if (!s) return;
  goToSlide(trackId, s.cur + dir);
}

function initSliders() {
  document.querySelectorAll('.slider-track').forEach(track => {
    const id    = track.id;
    const count = track.querySelectorAll('img').length;
    _slider[id] = { cur: 0, count };
    if (count <= 1) {
      const slider = track.closest('.product-slider');
      if (slider) slider.querySelectorAll('.slider-btn, .slider-dots').forEach(el => el.style.display = 'none');
    } else {
      _buildDots(id);
    }
  });
}

/* Touch swipe for product sliders */
function initSwipe() {
  document.querySelectorAll('.product-slider').forEach(slider => {
    let sx = 0;
    const track = slider.querySelector('.slider-track');
    if (!track) return;
    const id = track.id;
    slider.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) slideMove(id, dx < 0 ? 1 : -1);
    }, { passive: true });
  });
}

/* ===== CAROUSEL PROGRESS BAR ===== */
function initCarouselProgress() {
  const carouselEl = document.getElementById('carouselExampleRide');
  const bar        = document.querySelector('.carousel-progress');
  if (!carouselEl || !bar) return;

  function restartBar() {
    bar.classList.remove('running');
    /* force reflow so animation restarts */
    void bar.offsetWidth;
    bar.classList.add('running');
  }

  restartBar();
  carouselEl.addEventListener('slid.bs.carousel', restartBar);
}

/* ===== DOM READY ===== */
window.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initSliders();
  initSwipe();
  initCarouselProgress();

  const user = localStorage.getItem('loggedUser');
  if (user) {
    const g = document.getElementById('userGreeting');
    if (g) { g.textContent = '👋 Halo, ' + user; g.style.display = 'block'; }
    const b = document.getElementById('loginBtn');
    if (b) b.textContent = 'Logout';
  }
});
