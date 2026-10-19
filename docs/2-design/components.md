# Marketing Performance dashboard — Component

> Sinh tự động từ `docs/1-spec/dashboard.json` lúc 2026-10-18 22:00 (giờ Việt Nam). Muốn đổi điều gì, nói với Claude — Claude sửa JSON rồi chạy lại render. Không sửa tay file này: lần render sau sẽ dừng lại và báo.

Danh mục là tập đóng: mọi component dưới đây đã có sẵn trong khung app của skill `dashboard-build`. Cần một component mới là dấu hiệu đang trượt khỏi hệ.

## 1 · Khung app

| Component | Nội dung | Quy tắc |
|---|---|---|
| Shell | toàn bộ app, 1600×900 | tấm bo góc nổi trên mặt bàn, không tràn sát mép |
| Sidebar | logo + tên "Marketing Performance dashboard", 4 mục trang, số dòng đang xem, tài khoản | mục đang chọn tô `--sub2`, không tô brand |
| Header 46px | tên trang, giờ cập nhật, Tải lại, Cảnh báo, Xuất dữ liệu, **Bộ lọc** | "Bộ lọc" là nút brand duy nhất |
| Thanh chào 52px | lời chào + kỳ đang xem + ngày giờ theo **UTC+7**; bên phải là chip bộ lọc đang áp | giờ Việt Nam, không theo giờ máy |
| Trang giới thiệu | tên, mô tả, nút "Mở dashboard", nguồn dữ liệu | cùng shell và token với dashboard |

## 2 · Thẻ KPI

Băng 118px, 5 thẻ. Mỗi thẻ: nhãn + icon · số lớn · so kỳ trước (pill, mũi tên đảo màu với chỉ số nghịch) · sparkline có đường chuẩn gạch ngang · chân ghi ngưỡng.

| # | Thẻ | Số lớn | Chân thẻ | Màu |
|---|---|---|---|---|
| 1 | Chi phí | `SUM(spend)` | so với … kỳ trước | giữ mực |
| 2 | Doanh thu | `SUM(revenue)` | so với … kỳ trước | giữ mực |
| 3 | Conversion | `SUM(conversions)` | so với … kỳ trước | giữ mực |
| 4 | CPL | `SUM(spend) / SUM(leads)` | ngưỡng 250k · vượt … | đỏ khi > 250k, còn lại xanh |
| 5 | ROAS | `SUM(revenue) / SUM(spend)` | mục tiêu 4,00x · đang thiếu … | xanh khi ≥ 4,00x, còn lại đỏ |

So kỳ trước = cùng số ngày, ngay trước khoảng đang xem, cùng bộ lọc. Chênh dưới 0,2% hiện trung tính.

## 3 · Sáu loại visual

| Loại | Legend | Dùng ở |
|---|---|---|
| Donut tỷ trọng | 2 hàng (44px) | trang 1, 2, 3 — chỉ vẽ chỉ số cộng được; chỉ số đang chọn là tỷ lệ thì vẽ Chi phí |
| Area một chuỗi | không | trang 1, xu hướng chỉ số đang chọn |
| Line nhiều đường | 1 hàng (24px) | trang 2, 3 — top 5 nhóm |
| Bar xếp hạng | không | trang 1 (top chiến dịch), trang 2, 3 — tối đa 7 thanh |
| Bảng theo kỳ tô nhiệt | không | trang 1 — cột: Chi phí, Doanh thu, Conversion, CPL, ROAS |
| Bảng chỉ số đầy đủ | không | trang 2, 3 — cột: Chi phí, Doanh thu, Lead, Conversion, CPL, ROAS |
| Sparkline | không | trong thẻ KPI |

Legend nằm trên chart, căn trái, chỉ có màu ↔ tên nhóm. Bấm lát donut hoặc thanh bar = lọc theo nhóm đó (bấm lại để bỏ).

Ô nhiệt pha 5% → 29% mực; chi phí đơn vị pha bằng `--bad`. Pha mạnh hơn thì ô cao nhất lại khó đọc nhất.

## 4 · Điều khiển

| Component | Class | Quy tắc |
|---|---|---|
| Segmented control | `.seg` | Ngày/Tuần/Tháng ở card có trục thời gian; 4 chỉ số trong drawer |
| Nút header | `.ibtn` · `.ibtn.pri` | chỉ "Bộ lọc" mang `.pri` |
| Nút trong drawer / bảng xuất | `.dbtn.ghost` · `.dbtn.pri` | nút chính tô mực, không tô brand |
| Checkbox | `.cbx` + `.box` | tick tô mực: chọn/không chọn không phải tốt/xấu |
| Radio | `.rad` | phạm vi dòng trong bảng xuất |
| Công tắc | `.sw` | "Chỉ hiện chiến dịch đang lỗ" (ROAS < 1,00x) |
| Ô ngày | `.dates` | hai ô có `min`/`max` giao nhau |
| Chip | `.chip` | bộ lọc đang áp trên thanh chào, bấm × để bỏ |
| Popover | `.pop` | cảnh báo (header), tài khoản (sidebar) |
| Badge | `.bdg` | số nhóm trên nav; số cảnh báo tô `--warn` |

## 5 · Drawer bộ lọc

Chứa: 4 lựa chọn chỉ số (Chi phí · Doanh thu · Conversion · ROAS, mặc định **Doanh thu**) · khoảng thời gian (7 ngày · 30 ngày · 3 tháng · toàn bộ · tuỳ chọn) · kênh (checkbox, kèm số dòng) · mục tiêu (danh sách thả) · chiến dịch (danh sách cuộn) · công tắc "chỉ hiện chiến dịch đang lỗ" · `Xoá hết` · `Áp dụng`.

Mọi thay đổi trong drawer là nháp, chỉ áp dụng khi bấm `Áp dụng`. Mặc định mở ra là 30 ngày cuối **của dữ liệu**, không tính từ hôm nay.

## 6 · Bảng xuất dữ liệu — hai bước

1. Bấm "Xuất dữ liệu" mở bảng chọn: phạm vi dòng (theo bộ lọc dashboard / toàn bộ / tuỳ chỉnh, kèm số dòng) · khoảng ngày · kênh · cột xuất (chọn/bỏ tất cả) · định dạng CSV dấu phẩy hoặc dấu chấm phẩy (mặc định **;**).
2. Xem trước "Sẽ xuất n dòng × m cột", rồi mới có nút `Tải xuống`.

"Theo bộ lọc dashboard" trả về đúng tập dòng đang hiển thị. Sửa trong bảng xuất không đụng bộ lọc dashboard. File UTF-8 có BOM để Excel đọc đúng tiếng Việt. Chỉ xuất dữ liệu: không PNG, không PDF.

## 7 · Cảnh báo

Chuông trên header đếm số chiến dịch vượt ngưỡng trong kỳ đang xem. Bấm một dòng = lọc đúng các chiến dịch đó và mở trang "Theo chiến dịch".

| Dòng trong chuông | Điều kiện | Màu chấm | Tính trên |
|---|---|---|---|
| CPL vượt 250k | CPL > 250.000 | `--warn` | kỳ đang xem |
| Chiến dịch đang lỗ | ROAS < 1,00x | `--bad` | kỳ đang xem |
| Dùng >80% ngân sách | % ngân sách đã dùng > 80,0% | `--ink3` | toàn bộ thời gian |

## 8 · Bốn trạng thái runtime

| Trạng thái | Hiển thị |
|---|---|
| Đang tải | vòng quay trong card |
| Lỗi | thông báo lỗi + gợi ý cách sửa + nút **Thử lại** |
| Có dữ liệu | 5 KPI + 4 chart |
| Không dòng nào khớp bộ lọc | thông báo + gợi ý nới khoảng ngày hoặc "Xoá tất cả" |

## 9 · Icon

33 icon Lucide nhúng sẵn trong `lib/icons.ts`, không cài gì thêm, không vẽ path theo trí nhớ, không emoji. Icon riêng của dashboard này: Google → `search` · Facebook → `users` · Email → `mail` · TikTok → `video` · Zalo → `message-circle` · KPI Chi phí → `coins` · KPI Doanh thu → `trending-up` · KPI Conversion → `target` · KPI CPL → `gauge` · KPI ROAS → `chart-pie` · trang kênh → `chart-pie` · trang chiến dịch → `megaphone`.

## Giả định cần bạn xác nhận

- **G13 · Vừa** — Cảnh báo xét theo campaign; bấm vào thì lọc đúng các nhóm đó và mở trang của dimension đó.  
  Vì: campaign_budget gắn với campaign, nên ngưỡng cạn nguồn lực chỉ tính được theo campaign.  
  Nếu sai: dashboard.json › alerts.dim.
- **G14 · Vừa** — Xuất CSV mặc định dấu chấm phẩy.  
  Vì: Excel bản Việt đọc dấu phẩy thành một cột duy nhất.  
  Nếu sai: dashboard.json › export.separator.
