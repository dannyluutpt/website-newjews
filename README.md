# NewJews — Website mẫu trang sức chế tác riêng

Website giới thiệu cho **NewJews**, một xưởng chế tác trang sức theo yêu cầu.
Đây là **website mẫu (demo)** dùng để quảng bá dịch vụ thiết kế web.

Tone sang trọng **đen + vàng gold**, typography lớn, nhiều animation &
micro-interaction. Xây dựng bằng **HTML + CSS + JavaScript thuần** — không cần
build step, deploy tĩnh được ngay.

## ✨ Tính năng

- Header dính (sticky), menu hamburger trên mobile, nhóm nút (tìm kiếm / giỏ hàng / menu) **luôn căn sát mép phải**.
- Hero parallax với CTA, dải marquee chạy, danh mục, **lưới sản phẩm có bộ lọc**.
- **Giỏ hàng hoạt động đầy đủ**: thêm / tăng-giảm số lượng / xoá / tính tổng (lưu bằng `localStorage`).
- Đếm số (count-up), **đồng hồ đếm ngược** khuyến mãi, lý do chọn, đánh giá khách hàng, đăng ký nhận tin, footer đầy đủ.
- Ảnh sản phẩm dùng **ảnh thật** (Unsplash), `object-fit: cover`, **fade-in khi tải**, và **ảnh dự phòng SVG** nếu ảnh lỗi (không bao giờ "vỡ ảnh").
- Responsive hoàn chỉnh cho điện thoại, hỗ trợ `prefers-reduced-motion`, có skip-link và focus rõ ràng.

## 📁 Cấu trúc

```
index.html    — nội dung & bố cục
styles.css    — toàn bộ giao diện, animation, responsive
script.js     — giỏ hàng, bộ lọc, reveal, parallax, count-up, countdown
.nojekyll     — để GitHub Pages phục vụ file tĩnh nguyên trạng
```

## 🚀 Bật GitHub Pages

1. Vào **Settings → Pages**.
2. Mục **Build and deployment → Source** chọn **Deploy from a branch**.
3. Chọn nhánh **`main`**, thư mục **`/ (root)`**, bấm **Save**.
4. Đợi 1–2 phút, website sẽ chạy tại:
   **https://dannyluutpt.github.io/website-newjews/**

> Font và ảnh được tải từ Google Fonts / Unsplash nên cần kết nối Internet khi xem.
