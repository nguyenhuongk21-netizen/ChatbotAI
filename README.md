# Prana Guide AI — bản Google Apps Script + GitHub Pages

Kiến trúc: **Google Apps Script** (backend gọi Gemini, không streaming) + **GitHub Pages**
(frontend tĩnh, HTML/CSS/JS thuần, không cần build). Đánh đổi đã chấp nhận: mất streaming
(trả lời hiện một lần) và mất phân quyền nhiều cấp (chỉ 1 trang Admin dùng chung 1 mật khẩu,
không có owner/staff riêng).

Đồng bộ code bằng **git** (frontend → GitHub Pages) và **clasp** (Apps Script) — sửa xong
file nào, báo lại là tự động `git push` hoặc `clasp push`, không copy-dán tay.

```
prana-guide-apps-script/            (git repo — đã push lên GitHub Pages)
├── index.html            Trang Landing (giới thiệu + widget chat)
├── embed.html            Trang chỉ có widget, nền trong suốt — dùng để nhúng iframe
├── chat.js               Lõi logic chat DUY NHẤT (PROXY_URL ở đầu file; cấu hình hiển
│                         thị được TẢI TỪ Apps Script, không hardcode) — index.html và
│                         embed.html cùng dùng file này
├── style.css             Toàn bộ giao diện
├── .nojekyll             Bắt buộc để GitHub Pages phục vụ đúng file JS/CSS
├── .gitignore
└── apps-script/          ← đồng bộ bằng `clasp push`, không copy-paste tay
    ├── .clasp.json        Trỏ vào Script ID thật (đã nối)
    ├── Code.gs            SYSTEM_PROMPT (1 hằng số duy nhất) + toàn bộ logic backend
    │                      + các hàm phục vụ trang Admin (đọc/ghi cấu hình)
    ├── KhoKienThuc.gs     KNOWLEDGE_BASE mặc định (62 tư thế Yoga, chép nguyên văn)
    ├── Admin.html         Trang quản trị — sửa giao diện/liên hệ, System Prompt, kiến
    │                      thức qua form, có hiệu lực NGAY, không cần deploy lại
    ├── AdminJS.html       JS phía client cho Admin.html
    └── appsscript.json    Manifest (quyền Web App: Anyone / Execute as Me)
```

## Cơ chế cấu hình 2 tầng (quan trọng, giải thích 1 lần)

`Code.gs`/`KhoKienThuc.gs` chứa giá trị **mặc định/dự phòng** (đúng yêu cầu F6: system
prompt gọn trong 1 hằng số). Khi bạn sửa qua trang **Admin**, giá trị mới được lưu vào:

- **Script Properties** — cho System Prompt và cấu hình bot (tên, lời chào, câu hỏi gợi ý,
  liên hệ, màu, logo, marquee). Có hiệu lực ngay lập tức.
- **1 file trên Google Drive** — riêng cho Kho kiến thức, vì Script Properties giới hạn
  9KB/mục trong khi kho kiến thức ~75.000 ký tự.

Có bản ghi đè → bot dùng bản ghi đè. Chưa có → dùng hằng số mặc định trong `.gs`. **Không
cần Deploy lại** sau khi sửa qua Admin — chỉ cần Deploy lại khi bạn tự sửa trực tiếp file
`.gs` trong Apps Script Editor.

---

## BƯỚC 1 — Tạo/nối project Apps Script

✅ Đã xong bằng `clasp clone-script` — project đã nối đúng Script ID bạn cung cấp.

## BƯỚC 2 — Đặt Script Properties

Vào project trên **script.google.com** → **⚙️ Project Settings** → **Script Properties** →
**Add script property**, thêm **2 mục**:

| Property | Value |
|---|---|
| `GEMINI_API_KEY` | Key Gemini thật (lấy tại aistudio.google.com → Get API key) |
| `ADMIN_SECRET` | Một mật khẩu bạn tự đặt (để mở trang Admin) |

Bấm **Save script properties**.

## BƯỚC 3 — Chạy `khoiTao()`

1. Trong Apps Script Editor (script.google.com), chọn hàm **`khoiTao`** ở dropdown cạnh nút ▷ Run.
2. Bấm **Run**. Cấp quyền khi được hỏi (Review permissions → chọn tài khoản → Advanced → Go to... (unsafe) → Allow — an toàn vì đây là app của bạn).
3. Xem **Execution log**: thấy `✅ KHỞI TẠO THÀNH CÔNG!` kèm phản hồi Gemini → key hoạt động tốt.

## BƯỚC 4 — Triển khai Ứng dụng web (Deploy)

1. **Deploy → New deployment → ⚙️ → Web app.**
2. Execute as: **Me**. Who has access: **Anyone**.
3. **Deploy**, cấp quyền nếu được hỏi, copy **Web app URL** (dạng
   `https://script.google.com/macros/s/AKfycb.../exec`).

> Sửa `Code.gs`/`KhoKienThuc.gs` trực tiếp trong Editor (không qua Admin) → phải
> **Deploy → Manage deployments → bút chì → New version → Deploy** mới có hiệu lực.
> Sửa qua **trang Admin** thì KHÔNG cần bước này.

## BƯỚC 5–7 — GitHub + Pages

✅ Đã xong: repo `github.com/nguyenhuongk21-netizen/ChatbotAI`, Pages bật ở
`main`/`root`, đã build thành công. Site live tại:
**https://nguyenhuongk21-netizen.github.io/ChatbotAI/**

## BƯỚC 8 — Dán URL Apps Script vào PROXY_URL

Mở `chat.js`, dòng `const PROXY_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";`, thay
bằng URL Web App thật (Bước 4). Báo lại để tự động commit + push.

---

## Dùng trang Admin

Sau khi deploy (Bước 4), mở:
```
<Web App URL>?page=admin&key=<ADMIN_SECRET bạn đặt ở Bước 2>
```
Sửa xong mục nào, bấm nút **Lưu** của đúng mục đó — có hiệu lực ngay cho lượt chat tiếp theo.

⚠️ Đây là bảo vệ đơn giản bằng mật khẩu trong URL (phù hợp với 1 admin duy nhất, không phân
quyền nhiều cấp như đã thống nhất) — không chia sẻ URL này cho người khác.

## Nhúng vào WordPress (dùng `embed.html`)

```html
<iframe
  src="https://nguyenhuongk21-netizen.github.io/ChatbotAI/embed.html"
  title="Prana Guide AI - Chat"
  style="position:fixed; bottom:0; right:0; width:420px; height:650px; max-width:100vw; max-height:100vh; border:none; background:transparent; z-index:999999;"
  loading="lazy"
></iframe>
```
Dán vào block **Custom HTML** trên trang WordPress, hoặc vào `footer.php` trước `</body>` để hiện toàn site.

## Sửa nội dung sau này

- **Cách khuyên dùng — qua trang Admin** (xem mục trên): System Prompt, Kho kiến thức, tên
  bot/lời chào/câu hỏi gợi ý/liên hệ/màu/logo/marquee — có hiệu lực ngay, không cần deploy.
- **Cách khác — sửa trực tiếp code**: mở `Code.gs`/`KhoKienThuc.gs` trong Apps Script
  Editor, sửa hằng số, Save, rồi Deploy lại (xem lưu ý ở Bước 4). Chỉ dùng khi Admin không
  đọc được do lỗi, hoặc muốn đổi lại giá trị "mặc định gốc".

## Quy trình đồng bộ code từ nay

- Sửa file **frontend** (`index.html`, `embed.html`, `chat.js`, `style.css`) → tự động
  `git add -A && git commit -m "..." && git push` — không hỏi lại trước khi push.
- Sửa file **Apps Script** (`apps-script/*.gs`, `apps-script/*.html`) → tự động
  `clasp push` — không hỏi lại trước khi push.
- **`clasp push` chỉ đưa code lên, KHÔNG tự triển khai bản Web App mới.** Sau mỗi lần
  `clasp push` có sửa `Code.gs`/`KhoKienThuc.gs`/`appsscript.json`, cần vào Apps Script:
  **Triển khai → Quản lý triển khai → biểu tượng bút chì → Phiên bản: Mới → Triển khai**.
  Không làm bước này thì bản Web App online vẫn chạy code cũ. (Sửa `Admin.html`/`AdminJS.html`
  cũng cần bước này để trang Admin cập nhật giao diện mới — nhưng KHÔNG cần nếu bạn chỉ sửa
  nội dung qua chính trang Admin, vì đó là ghi dữ liệu chứ không phải sửa code.)

## Đã kiểm thử trước khi giao

- Cú pháp toàn bộ file `.gs`/`.js`/JS trong `.html` hợp lệ (`node --check`).
- Đối chiếu byte-for-byte: nội dung `KhoKienThuc.gs` khớp 100% với `yoga-poses.md` gốc.
- `chat.js`: xác nhận `fetchBotConfig()` gọi đúng `?action=config` và parse đúng JSON trả về
  (test bằng phản hồi giả lập).
- Giao diện `index.html`/`embed.html`: mở/đóng widget, câu hỏi gợi ý tự ẩn, markdown/ảnh/
  nhúng YouTube hiển thị đúng (test cục bộ bằng phản hồi giả lập).
- `embed.html`: nền trong suốt tuyệt đối, vùng trống không chặn click trên trang nền.
- **Chưa test được**: gọi Gemini thật, và trang Admin (`Admin.html`/`AdminJS.html`) — cả 2
  cần bạn tự Deploy Web App bằng tài khoản Google của bạn trước (Bước 3–4), mình không có
  quyền tự làm thay.
