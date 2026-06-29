/* =========================================================
   NewJews — interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n) => n.toLocaleString("vi-VN") + "₫";

  /* ---------- Image fallback (never show a broken image) ----------
     If an Unsplash photo fails, swap to an on-brand inline SVG so the
     layout stays intact and elegant. */
  const FALLBACKS = {
    ring:     "Nhẫn",
    necklace: "Dây chuyền",
    earring:  "Bông tai",
    bracelet: "Lắc tay",
    default:  "NewJews",
  };
  function fallbackSVG(label) {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
         <defs>
           <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
             <stop offset='0' stop-color='#16161C'/><stop offset='1' stop-color='#0B0B0D'/>
           </linearGradient>
         </defs>
         <rect width='400' height='400' fill='url(#g)'/>
         <path d='M200 120l34 40-34 110-34-110z' fill='none' stroke='#C9A227' stroke-width='2'/>
         <path d='M166 160h68' stroke='#C9A227' stroke-width='2'/>
         <text x='200' y='320' fill='#C9A227' font-family='Georgia,serif' font-size='26'
               text-anchor='middle' opacity='.9'>${label}</text>
       </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function markLoaded(img) { img.classList.add("loaded"); }
  // Images use native loading="lazy" + decoding="async" in the markup; JS only
  // adds a graceful fade-in once decoded and an on-brand SVG fallback on error.
  function handleImg(img) {
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      const key = img.getAttribute("data-fallback") || "default";
      img.src = fallbackSVG(FALLBACKS[key] || FALLBACKS.default);
      img.classList.add("img-fallback");
      markLoaded(img);
    });
    if (img.complete && img.naturalWidth > 0) markLoaded(img);
    else img.addEventListener("load", () => markLoaded(img), { once: true });
  }
  const setupImage = handleImg;
  // Fade-in candidates plus the eager LCP hero image (for its error fallback).
  $$(".lazy-img").forEach(setupImage);
  const heroImgEl = $(".hero-img");
  if (heroImgEl) handleImg(heroImgEl);

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  const header = $("#siteHeader");
  const onScrollHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  const hamburger = $("#hamburger");
  const nav = $("#mainNav");
  const backdrop = $("#navBackdrop");
  function setNav(open) {
    nav.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    backdrop.hidden = !open;
    requestAnimationFrame(() => backdrop.classList.toggle("show", open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  hamburger.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  backdrop.addEventListener("click", () => setNav(false));
  $$(".nav-link", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));

  /* ---------- Reveal & parallax ----------
     Scroll-driven CSS animations (see styles.css) handle section reveals and
     the hero parallax natively in supporting browsers. JS only:
       - plays the hero intro on load (a one-time entrance, not scroll-tied),
       - falls back to IntersectionObserver where scroll-driven isn't supported,
       - reveals everything immediately under prefers-reduced-motion. */
  const supportsSDA = !!(window.CSS && CSS.supports &&
    CSS.supports("(animation-timeline: view()) and (animation-range: entry)"));

  // Hero intro — always a load-time entrance.
  const heroReveals = $$(".hero [data-reveal]");
  if (prefersReduced) {
    heroReveals.forEach((el) => el.classList.add("in-view"));
  } else {
    requestAnimationFrame(() => heroReveals.forEach((el) => {
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(() => el.classList.add("in-view"), delay);
    }));
  }

  // Section reveals — CSS scroll-driven when available, IO fallback otherwise.
  const sectionReveals = $$(".section [data-reveal]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    sectionReveals.forEach((el) => el.classList.add("in-view"));
  } else if (!supportsSDA) {
    const revIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = parseInt(e.target.getAttribute("data-delay") || "0", 10);
        setTimeout(() => e.target.classList.add("in-view"), delay);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    sectionReveals.forEach((el) => revIO.observe(el));
  } // else: native scroll-driven CSS reveals them.

  // Process-step underline — a one-shot trigger, kept on IO across all browsers.
  const steps = $$(".step");
  if ("IntersectionObserver" in window) {
    const stepIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    steps.forEach((el) => stepIO.observe(el));
  } else steps.forEach((el) => el.classList.add("in-view"));

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced) { el.textContent = target.toLocaleString("vi-VN") + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("vi-VN") + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statNums = $$(".stat-num");
  if ("IntersectionObserver" in window) {
    const statIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    statNums.forEach((el) => statIO.observe(el));
  } else statNums.forEach(countUp);

  /* ---------- Countdown timer ---------- */
  const cd = $("#countdown");
  if (cd) {
    // Target = end of the current month (rolls forward automatically)
    let target = (() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
    })();
    const set = (k, v) => { const el = cd.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = String(v).padStart(2, "0"); };
    function update() {
      let diff = target - Date.now();
      if (diff < 0) { target += 7 * 864e5; diff = target - Date.now(); }
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      set("days", d); set("hours", h); set("mins", m); set("secs", s);
    }
    update();
    setInterval(update, 1000);
  }

  /* ============================================================
     PRODUCTS + FILTER + CART
     ============================================================ */
  const PRODUCTS = [
    { id: "lumiere-solitaire", name: "Nhẫn Lumière Solitaire", cat: "nhan", catLabel: "Nhẫn",
      price: 42500000, old: 49900000, badge: "Bán chạy", desc: "Kim cương 0.5ct, ổ chấu vàng trắng 18K.",
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=80", fb: "ring" },
    { id: "aurora-pendant", name: "Dây chuyền Aurora", cat: "daychuyen", catLabel: "Dây chuyền",
      price: 18900000, old: null, badge: null, desc: "Mặt kim cương treo, dây vàng vàng 18K.",
      img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=80", fb: "necklace" },
    { id: "etoile-studs", name: "Bông tai Étoile", cat: "bongtai", catLabel: "Bông tai",
      price: 15500000, old: 17800000, badge: "Ưu đãi", desc: "Cặp bông tai nụ kim cương cắt brilliant.",
      img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80", fb: "earring" },
    { id: "serein-bracelet", name: "Lắc tay Sérein", cat: "lactay", catLabel: "Lắc tay",
      price: 23400000, old: null, badge: null, desc: "Lắc tennis kim cương, khóa an toàn kép.",
      img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80", fb: "bracelet" },
    { id: "eternel-band", name: "Nhẫn cưới Éternel", cat: "nhan", catLabel: "Nhẫn",
      price: 19800000, old: null, badge: "Đôi", desc: "Cặp nhẫn cưới trơn, khắc tên miễn phí.",
      img: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=700&q=80", fb: "ring" },
    { id: "celeste-necklace", name: "Dây chuyền Céleste", cat: "daychuyen", catLabel: "Dây chuyền",
      price: 27600000, old: 31200000, badge: "Mới", desc: "Mặt sao băng đính 12 viên kim cương nhỏ.",
      img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=80", fb: "necklace" },
    { id: "riviere-drops", name: "Bông tai Rivière", cat: "bongtai", catLabel: "Bông tai",
      price: 33900000, old: null, badge: null, desc: "Bông tai dài thả giọt, vàng trắng 18K.",
      img: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=80", fb: "earring" },
    { id: "halo-ring", name: "Nhẫn Halo Royale", cat: "nhan", catLabel: "Nhẫn",
      price: 56800000, old: 62000000, badge: "Cao cấp", desc: "Viên chủ 0.8ct bao quanh bởi vầng halo.",
      img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=700&q=80", fb: "ring" },
  ];

  const grid = $("#productGrid");
  const gridEmpty = $("#gridEmpty");

  function productCard(p) {
    const article = document.createElement("article");
    article.className = "product-card";
    article.dataset.cat = p.cat;
    article.innerHTML = `
      <div class="pc-media">
        ${p.badge ? `<span class="pc-badge">${p.badge}</span>` : ""}
        <button class="pc-fav" type="button" aria-label="Yêu thích ${p.name}" data-fav="${p.id}">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        </button>
        <img class="lazy-img" alt="${p.name}" loading="lazy" decoding="async" width="700" height="700" src="${p.img}" data-fallback="${p.fb}" />
      </div>
      <div class="pc-body">
        <span class="pc-cat">${p.catLabel}</span>
        <h3 class="pc-name">${p.name}</h3>
        <p class="pc-desc">${p.desc}</p>
        <div class="pc-foot">
          <span class="pc-price">${fmt(p.price)}${p.old ? `<small>${fmt(p.old)}</small>` : ""}</span>
          <button class="pc-add" type="button" data-add="${p.id}">
            <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            Thêm
          </button>
        </div>
      </div>`;
    return article;
  }

  PRODUCTS.forEach((p) => grid.appendChild(productCard(p)));
  $$(".lazy-img", grid).forEach(setupImage);

  // Filter
  const filterBtns = $$(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const f = btn.dataset.filter;
      let visible = 0;
      $$(".product-card", grid).forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        if (show) visible++;
        card.classList.add("filtering");
        setTimeout(() => {
          card.style.display = show ? "" : "none";
          requestAnimationFrame(() => card.classList.remove("filtering"));
        }, 180);
      });
      gridEmpty.hidden = visible !== 0;
    });
  });

  // Favourite toggle
  grid.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) fav.classList.toggle("is-fav");
  });

  /* ---------- CART ---------- */
  const CART_KEY = "newjews_cart_v1";
  let cart = loadCart();

  const cartToggle = $("#cartToggle");
  const cartDrawer = $("#cartDrawer");
  const cartOverlay = $("#cartOverlay");
  const cartClose = $("#cartClose");
  const cartItemsEl = $("#cartItems");
  const cartEmptyEl = $("#cartEmpty");
  const cartTotalEl = $("#cartTotal");
  const cartCountEl = $("#cartCount");
  const cartItemsCountEl = $("#cartItemsCount");
  const checkoutBtn = $("#checkoutBtn");

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  }
  function findProduct(id) { return PRODUCTS.find((p) => p.id === id); }

  function addToCart(id) {
    const existing = cart.find((i) => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart(); renderCart(true);
    const p = findProduct(id);
    showToast(`Đã thêm “${p.name}” vào giỏ`);
  }
  function changeQty(id, delta) {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
    saveCart(); renderCart();
  }
  function removeItem(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart(); renderCart();
  }

  function renderCart(bump) {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => { const p = findProduct(i.id); return s + (p ? p.price * i.qty : 0); }, 0);

    cartCountEl.textContent = count;
    cartCountEl.dataset.count = count;
    cartCountEl.classList.toggle("has-items", count > 0);
    if (bump && count > 0) {
      cartCountEl.classList.remove("bump");
      void cartCountEl.offsetWidth;
      cartCountEl.classList.add("bump");
    }
    cartItemsCountEl.textContent = `(${count})`;
    cartTotalEl.textContent = fmt(total);
    checkoutBtn.disabled = count === 0;

    cartEmptyEl.style.display = cart.length ? "none" : "";
    cartItemsEl.innerHTML = "";
    cart.forEach((i) => {
      const p = findProduct(i.id);
      if (!p) return;
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div class="ci-media"><img class="lazy-img" alt="${p.name}" loading="lazy" decoding="async" width="64" height="64" src="${p.img}" data-fallback="${p.fb}" /></div>
        <div class="ci-info">
          <span class="ci-name">${p.name}</span>
          <span class="ci-price">${fmt(p.price)}</span>
          <div class="ci-qty">
            <button type="button" aria-label="Giảm số lượng" data-dec="${p.id}">−</button>
            <span aria-label="Số lượng">${i.qty}</span>
            <button type="button" aria-label="Tăng số lượng" data-inc="${p.id}">+</button>
          </div>
        </div>
        <div class="ci-right">
          <span class="ci-sub">${fmt(p.price * i.qty)}</span>
          <button class="ci-remove" type="button" data-remove="${p.id}">Xoá</button>
        </div>`;
      cartItemsEl.appendChild(li);
      const im = li.querySelector("img");
      handleImg(im); if (im.complete) markLoaded(im);
    });
  }

  // Add-to-cart delegation
  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) addToCart(add.dataset.add);
  });
  // Cart item controls delegation
  cartItemsEl.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rm = e.target.closest("[data-remove]");
    if (inc) changeQty(inc.dataset.inc, +1);
    else if (dec) changeQty(dec.dataset.dec, -1);
    else if (rm) removeItem(rm.dataset.remove);
  });

  // Open / close drawer
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    cartOverlay.hidden = false;
    requestAnimationFrame(() => { cartOverlay.classList.add("show"); cartDrawer.classList.add("open"); });
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    cartClose.focus();
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => { cartOverlay.hidden = true; }, 360);
    if (lastFocus) lastFocus.focus();
  }
  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (cartDrawer.classList.contains("open")) closeCart();
      if (nav.classList.contains("open")) setNav(false);
    }
  });
  checkoutBtn.addEventListener("click", () => {
    showToast("Đây là website mẫu — chức năng thanh toán chỉ để minh hoạ.");
  });

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Newsletter ---------- */
  const newsForm = $("#newsForm");
  if (newsForm) {
    const input = $("#newsEmail");
    const msg = $("#newsMsg");
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!valid) {
        input.classList.add("invalid");
        msg.style.color = "#d9714f";
        msg.textContent = "Vui lòng nhập email hợp lệ.";
        input.focus();
        return;
      }
      input.classList.remove("invalid");
      msg.style.color = "";
      msg.textContent = "Cảm ơn bạn! Bạn đã đăng ký nhận tin thành công.";
      newsForm.reset();
      showToast("Đăng ký nhận tin thành công ✦");
    });
  }

  // Initial cart paint
  renderCart();
})();
