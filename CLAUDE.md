# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Kế thừa toàn bộ `../CLAUDE.md` của workspace. File này chỉ ghi cái riêng của project và
> những điểm **khác** workspace (kèm lý do).

## Project này là gì

**Marketing Performance dashboard** — dashboard theo dõi 4 trang cho dữ liệu chiến dịch
marketing hằng ngày. Khác các project phân tích khác: đầu ra là **một app Next.js chạy được**,
không phải report.

- Nguồn: Google Sheets, tab `marketpulse_campaign_daily` (đọc qua service account, khoá nằm
  trong `app/.env.local` — 3 biến `GOOGLE_*`; không in giá trị, không chép ra file khác).
- Grain: 1 dòng = `date` × `campaign`. `campaign` thuộc đúng một `channel` và một `objective`.
- `campaign_budget` là thuộc tính của campaign → lấy **MAX theo campaign, không SUM**.

## Khác workspace ở đâu (và vì sao)

| Luật workspace | Ở project này | Lý do |
| --- | --- | --- |
| Pipeline `data/raw` → clean → analysis → report | Không dùng. Pipeline là `dashboard-design` → duyệt → `dashboard-build` | Dữ liệu đọc trực tiếp từ Google Sheets, không có file thô trên đĩa |
| Output ở `analysis/`, `reports/` | Output ở `docs/` và `app/` | Sản phẩm là thiết kế + app |

Các luật còn lại (dừng chờ duyệt, không tự chọn định nghĩa mơ hồ, tiếng Việt) vẫn áp dụng.

## Pipeline — 2 skill

```text
Google Sheets
   │  ① dashboard-design        ⏸ dừng chờ người dùng duyệt giả định (nhóm Cao trước)
   ▼
docs/1-spec/dashboard.json  ──render──►  docs/1-spec/specification.md
                                         docs/2-design/design.md · layout.md · components.md
   │  ② dashboard-build         (chỉ chạy khi người dùng bảo)
   ▼
app/
```

- **`docs/1-spec/dashboard.json` là nguồn sự thật.** 4 file `.md` được sinh từ nó — không sửa
  tay `.md`; muốn đổi KPI, ngưỡng, nhãn, design system thì sửa JSON rồi chạy lại `render.mjs`
  của skill `dashboard-design`. Ngưỡng người dùng đã chốt ghi `"rule": "user"`.
- Script của skill nằm trong thư mục skill đã cài (không nằm trong project), chạy từ thư mục
  `dashboard/`.
- Phạm vi đã khoá: 4 trang · 5 KPI · 4 chart/trang · không trang phân tích sâu, chatbox AI,
  ô tìm kiếm, xuất PNG/PDF, emoji. Yêu cầu ngoài phạm vi → ghi vào `spec.later`, không làm.

## Metric và ngưỡng (bản nháp, chờ duyệt)

Định nghĩa chính thức nằm trong `docs/1-spec/specification.md`. Ngưỡng hiện tại theo playbook:
CPL > 250.000 là cảnh báo · ROAS < 1,00x là lỗ · mục tiêu ROAS ≥ 4,00x · % ngân sách đã dùng
> 80% là cạn (tính trên toàn thời gian, không theo bộ lọc ngày). Chưa duyệt thì chưa coi là luật.

## app/

Lệnh (chạy trong `app/`): `npm run dev` (port 3000; cũng có cấu hình `dashboard-app` trong
`../.claude/launch.json`) · `npm run build` · `npm run lint`. Không có test.

`app/AGENTS.md`: Next.js 16 có breaking changes — đọc docs trong `app/node_modules/next/dist/docs/`
trước khi viết code. Middleware ở `app/proxy.ts`.

Hiện `app/` đang chứa một app khác (quản lý công việc nhóm: JSON store `data/db.json`, đăng nhập
bằng cookie `uid`, email sáng qua Gmail). App đó **không** phải dashboard này — `dashboard-build`
sẽ dựng dashboard vào `app/`; hỏi người dùng trước khi ghi đè hoặc xoá code đang có.
