/* ============================================
   TÂM LINH VIỆT – MAIN SCRIPT
   ============================================ */

/* ---- Sample Product Data ---- */
const defaultProducts = [
];

/* ---- State ---- */
let cart = JSON.parse(localStorage.getItem('tlv_cart') || '[]');
let currentLightboxIndex = 0;
const galleryItems = [
  { icon: 'fa-torii-gate', label: 'Phòng thờ gia đình', bg: 'linear-gradient(135deg,#2a1206,#5c2d0e)' },
  { icon: 'fa-pray',        label: 'Bàn thờ gỗ hương',  bg: 'linear-gradient(135deg,#3d1a00,#7a3400)' },
  { icon: 'fa-fire',        label: 'Bộ đồ thờ đồng',    bg: 'linear-gradient(135deg,#1a0d00,#4d2a00)' },
  { icon: 'fa-cabinet-filing', label: 'Tủ thờ cao cấp', bg: 'linear-gradient(135deg,#0d0a00,#3d2e00)' },
  { icon: 'fa-coins',       label: 'Bàn thờ thần tài',  bg: 'linear-gradient(135deg,#4d0000,#8b1a1a)' },
  { icon: 'fa-yin-yang',    label: 'Tượng phong thủy',  bg: 'linear-gradient(135deg,#0d1a3d,#1e3a8a)' }
];

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initNavbar();
  initHeroSwiper();
  initTestimonialSwiper();
  renderProducts();
  initProductFilters();
  initCart();
  initSearch();
  initContactForm();
  initBackToTop();
  updateCartCount();
});

/* ---- AOS ---- */
function initAOS() {
  AOS.init({ duration: 700, once: true, offset: 60 });
}

/* ---- Navbar ---- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  // Sticky scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
  });

  // Close menu when link clicked
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id');
    });
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  });
}

/* ---- Hero Swiper ---- */
function initHeroSwiper() {
  new Swiper('.heroSwiper', {
    loop: true,
    autoplay: { delay: 5500, disableOnInteraction: false },
    pagination: { el: '.heroSwiper .swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.heroSwiper .swiper-button-next',
      prevEl: '.heroSwiper .swiper-button-prev'
    },
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 900
  });
}

/* ---- Testimonial Swiper ---- */
function initTestimonialSwiper() {
  new Swiper('.testimonialSwiper', {
    loop: true,
    autoplay: { delay: 4500, disableOnInteraction: false },
    pagination: { el: '.testimonialSwiper .swiper-pagination', clickable: true },
    slidesPerView: 1,
    spaceBetween: 24,
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
}

/* ============================================
   PRODUCTS
   ============================================ */
function getAllProducts() {
  const stored = JSON.parse(localStorage.getItem('tlv_products') || '[]');
  return [...defaultProducts, ...stored];
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const all = getAllProducts();
  const filtered = filter === 'all' ? all : all.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-aos="fade-up" data-id="${p.id}">
      <div class="product-img-wrap">
        ${p.img
          ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">`
          : `<div class="product-img-placeholder" style="background:${p.color || 'var(--cream)'}">
               <i class="fas ${p.icon || 'fa-box'}"></i>
               <span>${p.catLabel || p.category}</span>
             </div>`
        }
        ${p.badge ? `<span class="product-badge badge-${p.badgeType}">${p.badge}</span>` : ''}
        <div class="product-actions-hover">
          <button class="product-btn product-btn-view" onclick="viewProduct(${p.id})">
            <i class="fas fa-eye"></i> Xem
          </button>
          <button class="product-btn product-btn-cart" onclick="addToCart(${p.id})">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.catLabel || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <div class="stars">${'★'.repeat(p.rating)}${'☆'.repeat(5 - p.rating)}</div>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-price">
          <span class="price-sale">${formatPrice(p.priceSale)}</span>
          ${p.price !== p.priceSale ? `<span class="price-original">${formatPrice(p.price)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Re-init AOS for newly rendered elements
  AOS.refresh();
}

function initProductFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.dataset.filter);
    });
  });
}

function formatPrice(n) {
  return n.toLocaleString('vi-VN') + '₫';
}

function viewProduct(id) {
  const products = getAllProducts();
  const p = products.find(x => x.id === id);
  if (p) showToast(`🔍 Đang xem: ${p.name}`);
}

/* ============================================
   CART
   ============================================ */
function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const closeCart = document.getElementById('closeCart');
  const overlay = document.getElementById('cartOverlay');

  cartBtn.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartSidebar);
  overlay.addEventListener('click', closeCartSidebar);
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  renderCartItems();
}

function closeCartSidebar() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}

function addToCart(id) {
  const products = getAllProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: p.id, name: p.name, price: p.priceSale, icon: p.icon, qty: 1 });
  }
  localStorage.setItem('tlv_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
  showToast(`🛒 Đã thêm "${p.name}" vào giỏ hàng!`);
  // Cart shake animation
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.style.transform = 'scale(1.3)';
  setTimeout(() => cartBtn.style.transform = '', 300);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem('tlv_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty"><i class="fas fa-shopping-cart" style="font-size:2rem;color:var(--cream-dark);display:block;margin-bottom:.5rem"></i>Giỏ hàng trống</p>';
    totalEl.textContent = '0₫';
    return;
  }

  container.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-img"><i class="fas ${c.icon || 'fa-box'}"></i></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">${formatPrice(c.price)} × ${c.qty}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${c.id})">
          <i class="fas fa-trash-alt"></i> Xóa
        </button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  totalEl.textContent = formatPrice(total);
}

/* ============================================
   SEARCH
   ============================================ */
function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const input = document.getElementById('searchInput');

  toggle.addEventListener('click', () => {
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) input.focus();
  });

  input.addEventListener('input', debounce(() => {
    const q = input.value.toLowerCase().trim();
    if (!q) { renderProducts(); return; }
    const all = getAllProducts();
    const grid = document.getElementById('productsGrid');
    const filtered = all.filter(p => p.name.toLowerCase().includes(q) || (p.catLabel || '').toLowerCase().includes(q));
    grid.innerHTML = filtered.length === 0
      ? '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:3rem">Không tìm thấy sản phẩm phù hợp.</p>'
      : filtered.map(p => renderProductCard(p)).join('');
    // Scroll to products section
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 350));
}

function renderProductCard(p) {
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap">
        ${p.img
          ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">`
          : `<div class="product-img-placeholder" style="background:${p.color || 'var(--cream)'}">
               <i class="fas ${p.icon || 'fa-box'}"></i>
               <span>${p.catLabel || p.category}</span>
             </div>`
        }
        ${p.badge ? `<span class="product-badge badge-${p.badgeType}">${p.badge}</span>` : ''}
        <div class="product-actions-hover">
          <button class="product-btn product-btn-view" onclick="viewProduct(${p.id})">
            <i class="fas fa-eye"></i> Xem
          </button>
          <button class="product-btn product-btn-cart" onclick="addToCart(${p.id})">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.catLabel || p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <div class="stars">${'★'.repeat(p.rating)}${'☆'.repeat(5 - p.rating)}</div>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-price">
          <span class="price-sale">${formatPrice(p.priceSale)}</span>
          ${p.price !== p.priceSale ? `<span class="price-original">${formatPrice(p.price)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* ============================================
   LIGHTBOX
   ============================================ */
function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function changeLightbox(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + galleryItems.length) % galleryItems.length;
  updateLightbox();
}

function updateLightbox() {
  const item = galleryItems[currentLightboxIndex];
  document.getElementById('lightboxContent').innerHTML = `
    <div class="lightbox-img-placeholder" style="background:${item.bg}">
      <i class="fas ${item.icon}" style="font-size:6rem;color:var(--gold)"></i>
      <p style="color:rgba(255,255,255,.8);font-size:1.1rem;font-family:var(--font-display)">${item.label}</p>
      <p style="color:rgba(255,255,255,.5);font-size:.8rem">${currentLightboxIndex + 1} / ${galleryItems.length}</p>
    </div>
  `;
}

/* ============================================
   CONTACT FORM
   ============================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const phone = document.getElementById('cfPhone').value.trim();
    const msg = document.getElementById('cfMessage').value.trim();
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

    if (!name) { showToast('⚠️ Vui lòng nhập họ tên!'); return; }
    if (!phone || !phoneRegex.test(phone)) { showToast('⚠️ Số điện thoại không hợp lệ!'); return; }
    if (!msg) { showToast('⚠️ Vui lòng nhập nội dung!'); return; }

    showToast('✅ Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.');
    form.reset();
  });
}

/* ============================================
   BACK TO TOP
   ============================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   UTILITIES
   ============================================ */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---- Listen for product updates from admin ---- */
window.addEventListener('storage', e => {
  if (e.key === 'tlv_products') renderProducts();
});