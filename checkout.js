/* =========================================================
   NewJews — Checkout logic
   Reads the cart from localStorage, renders the order summary,
   handles payment-method selection, validation and confirmation.
   ========================================================= */
(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = window.NEWJEWS_fmt;
  const PRODUCTS = window.NEWJEWS_PRODUCTS || [];
  const CART_KEY = window.NEWJEWS_CART_KEY;
  const FALLBACKS = window.NEWJEWS_FALLBACKS;
  const fallbackSVG = window.NEWJEWS_fallbackSVG;
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Image fallback ---------- */
  function handleImg(img) {
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      img.src = fallbackSVG(FALLBACKS[img.getAttribute("data-fallback")] || FALLBACKS.default);
    }, { once: true });
  }

  /* ---------- Load cart ---------- */
  function loadCart() {
    try { return (JSON.parse(localStorage.getItem(CART_KEY)) || []).filter((i) => findProduct(i.id)); }
    catch { return []; }
  }
  const cart = loadCart();

  const elEmpty = $("#coEmpty");
  const elGrid = $("#coGrid");

  if (!cart.length) {
    elEmpty.hidden = false;
    elGrid.hidden = true;
    return;
  }
  elEmpty.hidden = true;
  elGrid.hidden = false;

  /* ---------- Render summary ---------- */
  const subtotal = cart.reduce((s, i) => s + findProduct(i.id).price * i.qty, 0);
  let discount = 0;

  const itemsEl = $("#coItems");
  cart.forEach((i) => {
    const p = findProduct(i.id);
    const li = document.createElement("li");
    li.className = "co-item";
    li.innerHTML = `
      <span class="co-item-media">
        <img alt="${p.name}" loading="lazy" decoding="async" width="56" height="56" src="${p.img}" data-fallback="${p.fb}" />
        <span class="co-item-qty">${i.qty}</span>
      </span>
      <span>
        <span class="co-item-name">${p.name}</span>
        <span class="co-item-meta">${p.catLabel} · SL ${i.qty}</span>
      </span>
      <span class="co-item-price">${fmt(p.price * i.qty)}</span>`;
    itemsEl.appendChild(li);
    handleImg(li.querySelector("img"));
  });

  const sumSubtotal = $("#sumSubtotal");
  const sumDiscount = $("#sumDiscount");
  const sumTotal = $("#sumTotal");
  const rowDiscount = $("#rowDiscount");

  function renderTotals() {
    sumSubtotal.textContent = fmt(subtotal);
    if (discount > 0) {
      rowDiscount.hidden = false;
      sumDiscount.textContent = "−" + fmt(discount);
    } else {
      rowDiscount.hidden = true;
    }
    sumTotal.textContent = fmt(Math.max(0, subtotal - discount));
  }
  renderTotals();

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------- Promo code ---------- */
  const promoInput = $("#promo");
  const promoMsg = $("#promoMsg");
  $("#applyPromo").addEventListener("click", () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) return;
    if (code === "NEWJEWS15") {
      discount = Math.round(subtotal * 0.15);
      promoMsg.classList.remove("err");
      promoMsg.textContent = "Đã áp dụng mã NEWJEWS15 — giảm 15%.";
      renderTotals();
      showToast("Áp dụng mã giảm giá thành công ✦");
    } else {
      discount = 0;
      promoMsg.classList.add("err");
      promoMsg.textContent = "Mã giảm giá không hợp lệ.";
      renderTotals();
    }
  });

  /* ---------- Payment method → card fields ---------- */
  const cardFields = $("#cardFields");
  const cardInputs = $$("#cardFields input");
  function syncPayment() {
    const method = ($('input[name="payment"]:checked') || {}).value;
    const isCard = method === "card";
    cardFields.hidden = !isCard;
    cardInputs.forEach((inp) => { inp.required = isCard; if (!isCard) inp.value = inp.value; });
  }
  $$('input[name="payment"]').forEach((r) => r.addEventListener("change", syncPayment));
  syncPayment();

  const METHOD_LABEL = {
    cod: "Thanh toán khi nhận hàng (COD)",
    bank: "Chuyển khoản ngân hàng",
    ewallet: "Ví điện tử (Momo / VNPay)",
    card: "Thẻ tín dụng / ghi nợ",
  };

  /* ---------- Accessible error announcement ----------
     Bridge the visual :user-invalid state to aria-invalid (per
     modern-web-guidance "accessible-error-announcement"), with a
     WeakMap fallback for browsers without :user-invalid. */
  const supportsUserInvalid = window.CSS && CSS.supports && CSS.supports("selector(:user-invalid)");

  if (supportsUserInvalid) {
    const updateAria = (e) => {
      const el = e.target;
      if (!el.matches || !el.matches("input, textarea, select")) return;
      if (el.matches(":user-invalid")) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
    };
    document.addEventListener("blur", updateAria, true);
    document.addEventListener("input", (e) => {
      const el = e.target;
      if (el.matches && el.matches("input, textarea, select") && el.getAttribute("aria-invalid") === "true") updateAria(e);
    });
  } else {
    const dirty = new WeakMap();
    const update = (el) => {
      const ok = el.checkValidity();
      el.classList.toggle("user-invalid-fallback", !ok);
      if (!ok) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    };
    const handle = (e) => {
      const el = e.target;
      if (!el.matches || !el.matches("input, textarea, select")) return;
      const st = dirty.get(el) || { typed: false, blurred: false };
      if (e.type === "input") { st.typed = true; if (st.blurred) update(el); }
      else if (e.type === "blur") { st.blurred = true; if (st.typed) update(el); }
      dirty.set(el, st);
    };
    document.addEventListener("blur", handle, true);
    document.addEventListener("input", handle, true);
  }

  /* ---------- Submit ---------- */
  const form = $("#checkoutForm");
  const placeBtn = $("#placeOrder");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    syncPayment();

    if (!form.checkValidity()) {
      form.reportValidity();
      // mark fields so :user-invalid / fallback messages appear
      $$("input, textarea", form).forEach((el) => {
        if (!el.checkValidity()) {
          el.setAttribute("aria-invalid", "true");
          el.classList.toggle("user-invalid-fallback", !supportsUserInvalid);
        }
      });
      const firstBad = $$("input, textarea", form).find((el) => !el.checkValidity());
      if (firstBad) firstBad.focus();
      showToast("Vui lòng kiểm tra lại các trường còn thiếu.");
      return;
    }

    // Simulate placing the order (demo site — no real transaction).
    placeBtn.disabled = true;
    placeBtn.textContent = "Đang xử lý…";

    setTimeout(() => {
      const name = ($("#fullname").value.trim().split(/\s+/).pop()) || "quý khách";
      const method = ($('input[name="payment"]:checked') || {}).value;
      const orderId = "#NJ-" + String(Math.floor(100000 + Math.random() * 900000));

      $("#successName").textContent = name;
      $("#orderId").textContent = orderId;
      $("#successTotal").textContent = fmt(Math.max(0, subtotal - discount));
      $("#successMethod").textContent = METHOD_LABEL[method] || "COD";

      // Clear the cart now that the order is placed.
      try { localStorage.removeItem(CART_KEY); } catch { /* ignore */ }

      $("#coGrid").hidden = true;
      $(".co-head").hidden = true;
      $(".co-steps").querySelectorAll(".co-step").forEach((s, idx) => {
        s.classList.toggle("is-done", idx <= 2);
        s.classList.toggle("is-current", false);
      });
      const success = $("#coSuccess");
      success.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      success.focus?.();
    }, 700);
  });
})();
