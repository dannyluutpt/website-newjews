/* =========================================================
   NewJews — shared data (catalog + cart key + helpers)
   Loaded by both the homepage (script.js) and checkout (checkout.js)
   so the product catalog has a single source of truth.
   ========================================================= */
(function () {
  "use strict";

  window.NEWJEWS_CART_KEY = "newjews_cart_v1";

  window.NEWJEWS_PRODUCTS = [
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

  window.NEWJEWS_FALLBACKS = { ring: "Nhẫn", necklace: "Dây chuyền", earring: "Bông tai", bracelet: "Lắc tay", default: "NewJews" };

  window.NEWJEWS_fmt = (n) => n.toLocaleString("vi-VN") + "₫";

  // On-brand SVG used when a stock photo fails to load — never a broken image.
  window.NEWJEWS_fallbackSVG = function (label) {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
         <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
           <stop offset='0' stop-color='#16161C'/><stop offset='1' stop-color='#0B0B0D'/>
         </linearGradient></defs>
         <rect width='400' height='400' fill='url(#g)'/>
         <path d='M200 120l34 40-34 110-34-110z' fill='none' stroke='#C9A227' stroke-width='2'/>
         <path d='M166 160h68' stroke='#C9A227' stroke-width='2'/>
         <text x='200' y='320' fill='#C9A227' font-family='Georgia,serif' font-size='26'
               text-anchor='middle' opacity='.9'>${label}</text>
       </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
})();
