# Prana Guide AI — bản Google Apps Script + GitHub Pages

Kiến trúc: **Google Apps Script** (backend gọi Gemini, không streaming) + **GitHub Pages**
(frontend tĩnh, HTML/CSS/JS thuần, không cần build). Đánh đổi đã chấp nhận: mất streaming
(trả lời hiện một lần) và mất phân quyền nhiều cấp (không có trang admin — sửa system
prompt/kiến thức bằng cách mở trực tiếp `Code.gs` / `Knowledge.gs` trong Apps Script Editor).

> ⚠️ Cấu trúc dưới đây đang trong quá trình chuyển sang quản lý bằng **git + clasp** (xem
> yêu cầu mới nhất) — mục "Apps Script" sẽ được cập nhật lại sau khi nối `clasp` xong với
> project thật (file `Code.gs`, `KhoKienThuc.gs`, `Admin.html`, `AdminJS.html`). Phần
> **frontend bên dưới đã đúng với thực tế hiện tại** (đã đẩy lên GitHub, đang chờ bật Pages).

```
prana-guide-apps-script/            (git repo — đã push lên GitHub)
├── index.html          Trang Landing (giới thiệu + widget chat)
├── embed.html           Trang chỉ có widget, nền trong suốt — dùng để nhúng iframe
├── chat.js              Lõi logic chat DUY NHẤT (gồm cả cấu hình PROXY_URL/BOT_CONFIG
│                        ở đầu file) — index.html và embed.html cùng dùng file này
├── style.css            Toàn bộ giao diện
├── .nojekyll             Bắt buộc để GitHub Pages phục vụ đúng file JS/CSS
├── .gitignore
└── apps-script/         ← sẽ đồng bộ bằng `clasp push`, không copy-paste tay nữa
    ├── Code.gs           SYSTEM_PROMPT (1 hằng số duy nhất) + toàn bộ logic backend
    ├── Knowledge.gs      KNOWLEDGE_BASE (62 tư thế Yoga, chép nguyên văn) — sẽ đổi tên
    │                     thành KhoKienThuc.gs cho khớp project Apps Script đã có
    └── appsscript.json  Manifest
```

---

## BƯỚC 1 — Tạo project Apps Script

1. Vào **script.google.com** → **New project**.
2. Đổi tên project (góc trên trái) thành `Prana Guide AI Backend`.
3. Xóa hết nội dung mặc định trong `Code.gs`, dán nguyên nội dung file
   [`apps-script/Code.gs`](apps-script/Code.gs) vào.
4. Bấm dấu **+** cạnh "Files" → **Script** → đặt tên `Knowledge` (Apps Script tự thêm đuôi
   `.gs`) → dán nguyên nội dung file [`apps-script/Knowledge.gs`](apps-script/Knowledge.gs) vào.
5. Bấm biểu tượng **⚙️ Project Settings** (bên trái) → tick **"Show appscript.json manifest
   file in editor"** → quay lại tab **Editor**, mở file `appsscript.json` vừa hiện ra, thay
   nội dung bằng file [`apps-script/appsscript.json`](apps-script/appsscript.json).
6. Bấm **Save** (biểu tượng đĩa mềm, hoặc Ctrl/Cmd+S).

## BƯỚC 2 — Đặt Script Properties (giữ API key an toàn)

1. Bấm **⚙️ Project Settings** (bên trái).
2. Cuộn xuống mục **Script Properties** → **Add script property**.
3. Property: `GEMINI_API_KEY` — Value: dán key Gemini thật của bạn (lấy tại
   aistudio.google.com → Get API key).
4. Bấm **Save script properties**.

> Key nằm ở đây, KHÔNG nằm trong `Code.gs` — không ai xem được code mà thấy key của bạn.

## BƯỚC 3 — Chạy `khoiTao()`

1. Quay lại tab **Editor**, ở thanh trên cùng chọn hàm **`khoiTao`** trong dropdown (cạnh nút
   ▷ Run).
2. Bấm **Run** (▷).
3. Lần đầu chạy, Google sẽ hỏi cấp quyền — bấm **Review permissions** → chọn tài khoản Google
   của bạn → nếu hiện cảnh báo "Google hasn't verified this app", bấm **Advanced** → **Go to
   Prana Guide AI Backend (unsafe)** → **Allow**. (Đây là app CỦA BẠN, an toàn — cảnh báo này
   hiện với mọi Apps Script tự viết chưa nộp Google thẩm định.)
4. Xem kết quả tại **Execution log** (View → Logs, hoặc Ctrl/Cmd+Enter): nếu thấy
   `✅ KHỞI TẠO THÀNH CÔNG!` kèm câu trả lời từ Gemini → key hoạt động tốt.
   Nếu báo lỗi thiếu `GEMINI_API_KEY` → quay lại Bước 2 kiểm tra lại.

## BƯỚC 4 — Triển khai Ứng dụng web (Deploy)

1. Bấm nút **Deploy** (góc trên phải) → **New deployment**.
2. Bấm biểu tượng ⚙️ cạnh "Select type" → chọn **Web app**.
3. Điền:
   - Description: `Prana Guide AI v1`
   - Execute as: **Me (email của bạn)**
   - Who has access: **Anyone**
4. Bấm **Deploy**.
5. Cấp quyền lần nữa nếu được hỏi (giống Bước 3).
6. Sau khi deploy xong, **copy "Web app URL"** hiện ra (dạng
   `https://script.google.com/macros/s/AKfycb.../exec`) — giữ lại URL này cho Bước 8.

> Mỗi lần bạn sửa `Code.gs`/`Knowledge.gs` và muốn bản Web App cập nhật theo, phải vào
> **Deploy → Manage deployments → biểu tượng bút chì → New version → Deploy** (URL không đổi).

## BƯỚC 5 — Tạo repo GitHub

1. Vào **github.com** → đăng nhập → bấm **+** (góc trên phải) → **New repository**.
2. Đặt tên, ví dụ `prana-guide-ai`. Để **Public** (bắt buộc để dùng GitHub Pages miễn phí).
3. Bấm **Create repository**.

## BƯỚC 6 — Upload file lên GitHub

✅ Đã xong bằng `git push` — không cần thao tác tay. Repo: `github.com/nguyenhuongk21-netizen/ChatbotAI`.

## BƯỚC 7 — Bật GitHub Pages

1. Trong repo → tab **Settings** → mục **Pages** (menu bên trái).
2. Ở **Source**, chọn **Deploy from a branch**.
3. Branch chọn **main**, thư mục chọn **/ (root)** → **Save**.
4. Chờ khoảng 1 phút, refresh trang — sẽ thấy dòng
   `Your site is live at https://<tên-tài-khoản>.github.io/<tên-repo>/`. Đó là domain thật
   của bạn.

## BƯỚC 8 — Dán URL Apps Script vào PROXY_URL

1. Mở file `chat.js` (dòng khai báo `const PROXY_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";`
   ở đầu file).
2. Thay bằng URL Web App thật lấy ở Bước 4.
3. Lưu — vì đang dùng git, chỉ cần báo lại để tự động commit + push, GitHub Pages tự cập
   nhật sau khi push (không cần thao tác tay trên GitHub nữa).

---

## Nhúng vào WordPress (dùng `embed.html`)

```html
<iframe
  src="https://<tên-tài-khoản>.github.io/<tên-repo>/embed.html"
  title="Prana Guide AI - Chat"
  style="position:fixed; bottom:0; right:0; width:420px; height:650px; max-width:100vw; max-height:100vh; border:none; background:transparent; z-index:999999;"
  loading="lazy"
></iframe>
```
Dán vào block **Custom HTML** trên trang WordPress, hoặc vào `footer.php` trước `</body>` để hiện toàn site.

## Sửa nội dung sau này

- **System prompt / quy tắc an toàn**: mở `Code.gs` trong Apps Script Editor, sửa nguyên khối
  trong `SYSTEM_PROMPT`, Save, rồi **Deploy → Manage deployments → New version** để áp dụng.
- **Kho kiến thức**: mở `Knowledge.gs`, sửa `KNOWLEDGE_BASE`, Save, deploy lại tương tự.
- **Tên bot, câu hỏi gợi ý, liên hệ, màu, logo**: sửa `BOT_CONFIG` ở đầu `chat.js` —
  KHÔNG cần deploy lại Apps Script, GitHub Pages tự cập nhật sau khi push.

## Đã kiểm thử trước khi giao

- Cú pháp cả 4 file `.gs`/`.js` hợp lệ (node --check).
- Đối chiếu byte-for-byte: nội dung `Knowledge.gs` khớp 100% với `yoga-poses.md` gốc.
- Chạy thử `index.html` và `embed.html` bằng server tĩnh cục bộ: giao diện hiển thị đúng,
  mở/đóng widget hoạt động, câu hỏi gợi ý tự ẩn sau tin đầu, markdown/ảnh/nhúng YouTube hoạt
  động đúng (test bằng phản hồi giả lập — **chưa test được với Gemini thật** vì cần bạn tự
  deploy Apps Script bằng tài khoản Google của bạn).
- `embed.html`: xác nhận nền trong suốt tuyệt đối và vùng trống không chặn click trên trang nền.
