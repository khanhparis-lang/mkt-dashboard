# Marketing Performance dashboard — Đặc tả

> Sinh tự động từ `docs/1-spec/dashboard.json` lúc 2026-10-18 22:00 (giờ Việt Nam). Muốn đổi điều gì, nói với Claude — Claude sửa JSON rồi chạy lại render. Không sửa tay file này: lần render sau sẽ dừng lại và báo.

Domain: Marketing · Nguồn: Google Sheets "marketpulse_campaign_daily", tab `marketpulse_campaign_daily` · Ngày lập: 2026-10-18

## 1 · Mục tiêu

> Dashboard này giúp trưởng nhóm marketing thấy chi phí, doanh thu, ROAS theo kênh và chiến dịch mỗi ngày để quyết định dồn hay cắt ngân sách của từng kênh, từng chiến dịch. Mốc xét: CPL > 250.000 (cảnh báo); ROAS < 1,00x (lỗ); ROAS ≥ 4,00x (đạt mục tiêu); % ngân sách đã dùng > 80,0% (cạn nguồn lực).

## 2 · Người dùng

| Nhóm | Mở lúc nào | Quyết định việc gì |
|---|---|---|
| Trưởng nhóm marketing | Sáng thứ Hai và khi duyệt ngân sách | Dồn ngân sách vào kênh nào, dừng chiến dịch nào |
| Chuyên viên chạy quảng cáo | Cuối mỗi ngày | Chỉnh giá thầu, nội dung của chiến dịch có CPL tăng |

## 3 · Câu hỏi dashboard phải trả lời

1. Chiến dịch nào đang lỗ (ROAS < 1,00x) trong 30 ngày gần nhất?
2. Kênh nào có CPL > 250.000, và CPL đang tăng hay giảm so với kỳ trước?
3. ROAS toàn kỳ đang ở 3,16x: còn cách mốc ≥ 4,00x bao xa, kênh nào kéo xuống nhiều nhất?

## 4 · Bốn trang

| # | Trang | Trả lời câu hỏi gì | Băng KPI |
|---|---|---|---|
| 1 | Tổng quan | Các chỉ số đang đi về đâu, kênh nào chiếm phần lớn chi phí, chiến dịch nào dẫn đầu | có |
| 2 | Theo kênh | Kênh nào tốt nhất, kém nhất theo chỉ số đang chọn; xu hướng của top 5 | có |
| 3 | Theo chiến dịch | Chiến dịch nào tốt nhất, kém nhất; bảng đủ chỉ số để so | có |
| 4 | Nguồn dữ liệu | Dữ liệu lấy từ đâu, có đủ và đúng kiểu không | **không** |

Cấu trúc bốn trang là cố định. Chỉ dimension của trang 2 và trang 3 là quyết định.

## 5 · Năm thẻ KPI

| # | Nhãn | Công thức | Chiều tốt | Đường chuẩn sparkline | Tô màu |
|---|---|---|---|---|---|
| 1 | Chi phí | `SUM(spend)` | thấp hơn tốt hơn | trung bình kỳ | không |
| 2 | Doanh thu | `SUM(revenue)` | cao hơn tốt hơn | trung bình kỳ | không |
| 3 | Conversion | `SUM(conversions)` | cao hơn tốt hơn | trung bình kỳ | không |
| 4 | CPL | `SUM(spend) / SUM(leads)` | thấp hơn tốt hơn | ngưỡng 250.000 | có |
| 5 | ROAS | `SUM(revenue) / SUM(spend)` | cao hơn tốt hơn | mục tiêu 4,00x | có |

1. **Đường chuẩn là bắt buộc.** Sparkline không có mốc chỉ cho thấy hình dáng, không cho biết đang trên hay dưới ngưỡng.
2. **Chỉ KPI có ngưỡng mới được tô màu.** Còn lại giữ mực.
3. **Chỉ số nghịch** (thấp hơn tốt hơn): tăng là xấu, mũi tên so kỳ trước đảo màu.

## 6 · Chức năng chính

| Chức năng | Mô tả |
|---|---|
| Drawer bộ lọc | 4 lựa chọn chỉ số: Chi phí · Doanh thu · Conversion · ROAS (mặc định **Doanh thu**) · khoảng ngày · kênh · mục tiêu · chiến dịch · công tắc chỉ hiện chiến dịch đang lỗ. Sửa là nháp, bấm Áp dụng mới chạy |
| Khoảng ngày mặc định | 30 ngày cuối của dữ liệu (2026-07-05 → 2026-08-03), không tính từ hôm nay |
| Cảnh báo | CPL vượt 250k · Chiến dịch đang lỗ · Dùng >80% ngân sách — bấm vào thì lọc đúng các chiến dịch đó và mở trang của chúng |
| Xuất dữ liệu hai bước | mở bảng chọn → xem trước số dòng → tải CSV (mặc định dấu `;`). Không PNG/PDF |
| Thanh chào | lời chào và ngày giờ theo **UTC+7**, không theo giờ máy |
| Sáng / tối | chuyển ở hàng tài khoản cuối sidebar; cả hai chế độ đều phải kiểm |

## 7 · Dữ liệu và vai trò từng cột

Nguồn: Google Sheets "marketpulse_campaign_daily", tab `marketpulse_campaign_daily` · 1.613 dòng · 2026-02-05 → 2026-08-03 (180 ngày) · Hạt dữ liệu: 1 ngày × 1 chiến dịch

| # | Cột | Nhãn | Kiểu | Vai trò | Ví dụ |
|---|---|---|---|---|---|
| 1 | `date` | Ngày | date | `DATE` | 2026-02-05 |
| 2 | `channel` | Kênh | text | `PRIMARY_DIM` | Facebook |
| 3 | `campaign` | Chiến dịch | text | `SECONDARY_DIM` | Tết Sale 2026 |
| 4 | `objective` | Mục tiêu | text | `SECONDARY_DIM` | Conversion |
| 5 | `spend` | Chi phí | number | `METRIC` | 3.014.121 |
| 6 | `impressions` | Hiển thị | number | `METRIC` | 44.368 |
| 7 | `clicks` | Lượt nhấp | number | `METRIC` | 843 |
| 8 | `leads` | Lead | number | `METRIC` | 27 |
| 9 | `qualified_leads` | Lead đạt chuẩn | number | `METRIC` | 15 |
| 10 | `conversions` | Conversion | number | `METRIC` | 5 |
| 11 | `revenue` | Doanh thu | number | `METRIC` | 13.298.700 |
| 12 | `campaign_budget` | Ngân sách | number | `ATTRIBUTE` | 330.000.000 |

### Cột ATTRIBUTE — không được SUM

| Cột | Cách tổng hợp | Lý do |
|---|---|---|
| `campaign_budget` | MAX theo `campaign`, rồi mới cộng các chiến dịch | lặp lại ở mọi dòng của cùng một chiến dịch |

## 8 · Chỉ số phái sinh

Tỷ lệ luôn tính lại từ tổng: `SUM(tử) / SUM(mẫu)`. Lấy trung bình tỷ lệ từng dòng là lỗi im lặng — không báo gì, chỉ ra một con số sai trông rất bình thường. Cột cuối là con số sai đó trên chính dữ liệu này:

| Chỉ số | Công thức đúng | Đúng (toàn kỳ) | Sai: trung bình từng dòng |
|---|---|---|---|
| ROAS | `SUM(revenue) / SUM(spend)` | 3,16x | 3,79x |
| CPL | `SUM(spend) / SUM(leads)` | 170.497 | 177.084 |
| CPA | `SUM(spend) / SUM(conversions)` | 847.750 | 851.132 |
| CTR | `SUM(clicks) / SUM(impressions)` | 1,0% | 2,9% |
| % ngân sách đã dùng | `SUM(spend) / MAX(campaign_budget) theo campaign — toàn bộ thời gian` | 73,7% | — |

## 9 · Ngưỡng nghiệp vụ

```
CPL cảnh báo           CPL > 250.000
Ngưỡng lỗ ROAS         ROAS < 1,00x
Mục tiêu ROAS          ROAS ≥ 4,00x
Cạn ngân sách          % ngân sách đã dùng > 80,0%
```

| Ngưỡng | Loại | Giá trị | Nguồn | Dùng ở đâu |
|---|---|---|---|---|
| CPL cảnh báo | Chi phí đơn vị | CPL > 250.000 | playbook, chưa xác nhận với đội | KPI CPL, cảnh báo, chữ đỏ trong bảng, ô nhiệt pha đỏ |
| Ngưỡng lỗ ROAS | Ngưỡng lỗ | ROAS < 1,00x | điểm hoà vốn | nhóm đang lỗ tô đỏ trên mọi chart, cảnh báo, công tắc "đang lỗ" |
| Mục tiêu ROAS | Mục tiêu | ROAS ≥ 4,00x | playbook, chưa xác nhận với đội | KPI ROAS: xanh/đỏ + đường chuẩn sparkline |
| Cạn ngân sách | Cạn nguồn lực | % ngân sách đã dùng > 80,0% | playbook, chưa xác nhận với đội | cảnh báo, tính trên toàn bộ thời gian |

## 10 · Phạm vi phiên bản đầu

| Có trong v1 | Để lại sau |
|---|---|
| 4 trang · 5 KPI · 4 chart mỗi trang · lọc · xuất CSV · cảnh báo · sáng/tối | Đăng nhập bằng Google và giới hạn người được xem.; Đưa lên Internet để cả đội mở bằng trình duyệt. |

Không có trong v1: trang phân tích sâu (phễu, cohort, ma trận thời gian) · chatbox AI · ô tìm kiếm toàn cục · xuất PNG/PDF.

## 11 · Số liệu tham chiếu để tự kiểm

Sau khi build, dashboard phải hiện đúng các số này. Lệch là sai ở khâu đọc hoặc tổng hợp dữ liệu, không phải ở chart. Skill `dashboard-build` tự đối chiếu bằng `check.mjs`.

| Hạng mục | Kỳ mặc định | Toàn bộ thời gian |
|---|---|---|
| Khoảng ngày | 2026-07-05 → 2026-08-03 | 2026-02-05 → 2026-08-03 |
| Số dòng | 330 | 1.613 |
| Chi phí | 437.474.143 | 2.044.772.913 |
| Doanh thu | 1.158.443.629 | 6.465.244.708 |
| Conversion | 435 | 2.412 |
| CPL | 202.910 | 170.497 |
| ROAS | 2,65x | 3,16x |

Số nhóm: Kênh 5 · Chiến dịch 12.

## 12 · Ghi chú nghiệp vụ

- Chiến dịch Awareness luôn có ROAS thấp vì mục tiêu là hiển thị, không phải bán. Lọc theo mục tiêu trước khi kết luận một chiến dịch lỗ.

## 13 · Dashboard này KHÔNG trả lời được gì

- Vì sao CPL của một kênh tăng? Dữ liệu không có giá thầu, nội dung quảng cáo hay tệp nhắm chọn.
- Lead giao cho sale có thành đơn không? Dữ liệu không có mã lead hay trạng thái deal.
- Kênh nào lãi thật? Dữ liệu không có giá vốn, nên ROAS chỉ là doanh thu chia chi phí quảng cáo.

Dashboard theo dõi cho biết *cái gì đang xảy ra*, không cho biết *vì sao*.

## Giả định cần bạn xác nhận

- **G1 · Cao** — Domain Marketing: dùng playbook Marketing.  
  Vì: Khớp cột: spend, impressions, clicks, leads, conversions.  
  Nếu sai: dashboard.json › app.domain và các mục lấy từ playbook (metrics, kpis, thresholds), rồi chạy lại render.
- **G2 · Cao** — PRIMARY_DIM = channel (5 giá trị); trang 3 theo campaign (12); objective (4) làm bộ lọc phụ.  
  Vì: Trục chính cần 3–8 nhóm để donut đọc được; playbook Marketing chọn channel. Cột chữ khác: campaign (12), objective (4).  
  Nếu sai: dashboard.json › pages.primary / pages.secondary và columns[].role, rồi chạy lại render.
- **G3 · Cao** — campaign_budget là ATTRIBUTE: MAX theo campaign, không SUM.  
  Vì: Giá trị cố định ở mọi dòng của cùng một campaign (12 chiến dịch). SUM sẽ nhân lên theo số dòng: tổng sai thành 384.782.000.000 thay vì 2.774.000.000.  
  Nếu sai: dashboard.json › columns[campaign_budget].role.
- **G4 · Cao** — CPL cảnh báo: CPL > 250.000.  
  Vì: Lấy từ playbook Marketing, chưa xác nhận với đội. CPL toàn kỳ hiện là 170.497.  
  Nếu sai: dashboard.json › thresholds[cpl_max].value.
- **G5 · Cao** — Ngưỡng lỗ ROAS: ROAS < 1,00x.  
  Vì: Điểm hoà vốn toán học của ROAS. ROAS toàn kỳ hiện là 3,16x.  
  Nếu sai: dashboard.json › thresholds[roas_loss].value.
- **G6 · Cao** — Mục tiêu ROAS: ROAS ≥ 4,00x.  
  Vì: Lấy từ playbook Marketing, chưa xác nhận với đội. ROAS toàn kỳ hiện là 3,16x.  
  Nếu sai: dashboard.json › thresholds[roas_target].value.
- **G7 · Cao** — Cạn ngân sách: % ngân sách đã dùng > 80,0%, tính trên toàn bộ thời gian (không theo bộ lọc ngày).  
  Vì: Lấy từ playbook Marketing, chưa xác nhận với đội. % ngân sách đã dùng toàn kỳ hiện là 73,7%.  
  Nếu sai: dashboard.json › thresholds[budget_burn].value.
- **G8 · Vừa** — 5 KPI: Chi phí · Doanh thu · Conversion · CPL · ROAS.  
  Vì: Bộ 5 KPI của playbook Marketing, theo thứ tự đầu vào → đầu ra → hiệu quả.  
  Nếu sai: dashboard.json › kpis.
- **G9 · Vừa** — 4 lựa chọn chỉ số: Chi phí · Doanh thu · Conversion · ROAS; mặc định Doanh thu.  
  Vì: Bộ 4 của playbook Marketing.  
  Nếu sai: dashboard.json › params / defaultParam.
- **G10 · Vừa** — Donut vẽ Chi phí khi chỉ số đang chọn là tỷ lệ.  
  Vì: Tỷ trọng của một tỷ lệ là con số vô nghĩa; donut cần chỉ số cộng được.  
  Nếu sai: dashboard.json › donutMetric.
- **G11 · Thấp** — Tên dashboard "Marketing Performance dashboard", lời chào gọi "bạn".  
  Vì: Lấy theo tên spreadsheet; chưa biết tên người xem.  
  Nếu sai: dashboard.json › app.name / app.user.
