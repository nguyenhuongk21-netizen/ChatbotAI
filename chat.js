/**
 * chat.js — LÕI DUY NHẤT xử lý toàn bộ logic chat (gọi API, render tin nhắn, lịch sử).
 * Dùng chung cho index.html VÀ embed.html — không copy code, chỉ 1 file này.
 *
 * Yêu cầu: marked.js + DOMPurify phải được nạp trước (render markdown an toàn).
 *
 * Không có streaming (Apps Script không hỗ trợ) — trả lời hiện ra một lần sau khi
 * nhận đủ phản hồi từ server. Cấu hình hiển thị (tên bot, lời chào, câu hỏi gợi ý,
 * liên hệ, màu, logo, marquee) được TẢI TỪ Apps Script (?action=config) — sửa qua
 * trang Admin (Apps Script), KHÔNG sửa cứng trong file này nữa.
 */

// =============================================================================
// ⚠️ VIỆC BẠN CẦN LÀM: sau khi deploy Apps Script thành Web App (xem README),
// dán URL đó vào PROXY_URL bên dưới. Thiếu bước này thì chat KHÔNG hoạt động.
// =============================================================================
const PROXY_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

// Cấu hình dự phòng — CHỈ dùng khi không gọi được Apps Script (mất mạng, PROXY_URL
// sai...), để widget vẫn hiển thị được thay vì trắng trang. Cấu hình THẬT lấy từ
// Apps Script (Script Properties, sửa qua trang Admin) mỗi khi trang tải lên.
const FALLBACK_CONFIG = {
  botName: "Prana Guide AI",
  botSubtitle: "Yoga · Thiền · Sức khỏe Thân–Tâm–Trí",
  logoUrl: "",
  primaryColor: "#4f7a6b",
  greeting: "Xin chào! Mình là Prana Guide AI. Hiện mình chưa kết nối được với máy chủ, vui lòng thử lại sau ít phút.",
  suggestedQuestions: [],
  contactInfo: {
    hotline: "0976188870",
    zalo: "0976188870",
    email: "nguyenhuongk21@gmail.com",
    hours: "8h–12h và 14h–21h",
  },
  marqueeEnabled: false,
  marqueeText: "",
};

async function fetchBotConfig() {
  try {
    const url = PROXY_URL + (PROXY_URL.indexOf("?") >= 0 ? "&" : "?") + "action=config";
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    console.warn("Không tải được cấu hình từ Apps Script, dùng cấu hình dự phòng:", err);
    return FALLBACK_CONFIG;
  }
}

(function () {
  "use strict";

  // ---------- Helpers: markdown, ảnh, YouTube ----------

  const BARE_IMAGE_URL = /(^|\s)(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)(?:\?\S*)?)/gi;

  function prepareMarkdown(text) {
    return text.replace(BARE_IMAGE_URL, (_m, lead, url) => `${lead}![](${url})`);
  }

  const YOUTUBE_ID_RE = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  function extractYouTubeId(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      if (!/(^|\.)youtube\.com$/.test(host) && !/(^|\.)youtu\.be$/.test(host)) return null;
    } catch {
      return null;
    }
    const match = YOUTUBE_ID_RE.exec(url);
    return match ? match[1] : null;
  }

  function darkenHex(hex, amount) {
    const match = /^#?([0-9a-fA-F]{6})$/.exec(hex);
    if (!match) return hex;
    const num = parseInt(match[1], 16);
    const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
    const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
    const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /** Render nội dung markdown của bot thành HTML an toàn, tự nhúng YouTube/ảnh. */
  function renderMarkdown(text) {
    const raw = marked.parse(prepareMarkdown(text), { breaks: true, gfm: true });
    const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ["target", "rel"] });

    const wrapper = document.createElement("div");
    wrapper.innerHTML = clean;

    wrapper.querySelectorAll("img").forEach((img) => {
      img.classList.add("msg-image");
      img.loading = "lazy";
    });

    wrapper.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const videoId = extractYouTubeId(href);
      if (videoId) {
        const embed = document.createElement("span");
        embed.className = "msg-youtube-wrap";
        embed.innerHTML =
          '<iframe class="msg-youtube-iframe" src="https://www.youtube-nocookie.com/embed/' +
          videoId +
          '" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        a.replaceWith(embed);
      } else {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
    });

    return wrapper.innerHTML;
  }

  // ---------- Gọi backend (Apps Script Web App) ----------

  /**
   * Gửi Content-Type: text/plain để KHÔNG kích hoạt CORS preflight (OPTIONS) —
   * Apps Script Web App không xử lý preflight, phải tránh nó bằng cách này.
   */
  async function callChatApi(messages) {
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ messages }),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Phản hồi không hợp lệ từ server (${res.status}).`);
    }
    if (!res.ok || data.error) {
      throw new Error(data.error || `Yêu cầu thất bại (${res.status}).`);
    }
    return data.reply;
  }

  // ---------- Widget ----------

  function createChatWidget(rootEl, cfg) {
    let open = false;
    let sending = false;
    let messages = [{ id: "greeting", role: "assistant", content: cfg.greeting }];

    const brandColor = cfg.primaryColor || "#4f7a6b";
    const brandColorDark = darkenHex(brandColor, 0.18);
    rootEl.style.setProperty("--brand-color", brandColor);
    rootEl.style.setProperty("--brand-color-dark", brandColorDark);

    function makeId() {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    function avatarHtml(sizeClass) {
      if (cfg.logoUrl) {
        return `<img src="${cfg.logoUrl}" alt="${cfg.botName}" class="${sizeClass}" onerror="this.replaceWith(document.createTextNode('🧘'))" />`;
      }
      return "🧘";
    }

    function render() {
      rootEl.innerHTML = "";

      if (!open) {
        const fab = document.createElement("button");
        fab.type = "button";
        fab.className = "chat-fab";
        fab.setAttribute("aria-label", `Mở chat với ${cfg.botName}`);
        fab.innerHTML = avatarHtml("chat-avatar-img");
        fab.addEventListener("click", () => {
          open = true;
          render();
        });
        rootEl.appendChild(fab);
        return;
      }

      const widget = document.createElement("div");
      widget.className = "chat-widget";

      // Header
      const header = document.createElement("header");
      header.className = "chat-header";
      header.innerHTML = `
        <div class="chat-header-title">
          <span class="chat-header-avatar">${avatarHtml("chat-avatar-img")}</span>
          <div>
            <div class="chat-header-name"></div>
            <div class="chat-header-subtitle"></div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button type="button" class="contact-btn">📞 Gặp tư vấn viên</button>
          <button type="button" class="chat-minimize" aria-label="Thu nhỏ">—</button>
        </div>`;
      header.querySelector(".chat-header-name").textContent = cfg.botName;
      header.querySelector(".chat-header-subtitle").textContent = cfg.botSubtitle;
      header.querySelector(".contact-btn").addEventListener("click", () => showContactModal(rootEl, cfg));
      header.querySelector(".chat-minimize").addEventListener("click", () => {
        open = false;
        render();
      });
      widget.appendChild(header);

      // Marquee
      if (cfg.marqueeEnabled && cfg.marqueeText) {
        const marquee = document.createElement("div");
        marquee.className = "chat-marquee";
        const track = document.createElement("div");
        track.className = "chat-marquee-track";
        const s1 = document.createElement("span");
        s1.textContent = cfg.marqueeText;
        const s2 = document.createElement("span");
        s2.textContent = cfg.marqueeText;
        track.append(s1, s2);
        marquee.appendChild(track);
        widget.appendChild(marquee);
      }

      // Message list
      const list = document.createElement("div");
      list.className = "chat-list";
      messages.forEach((m) => list.appendChild(renderMessage(m, cfg)));
      widget.appendChild(list);

      // Suggested questions — chỉ hiện khi mới có lời chào
      if (messages.length <= 1) {
        const row = document.createElement("div");
        row.className = "suggested-row";
        cfg.suggestedQuestions.forEach((q) => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "suggested-chip";
          chip.textContent = q.label;
          chip.disabled = sending;
          chip.addEventListener("click", () => sendMessage(q.prompt));
          row.appendChild(chip);
        });
        widget.appendChild(row);
      }

      // Input row
      const form = document.createElement("form");
      form.className = "chat-input-row";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "chat-input";
      input.placeholder = "Nhập câu hỏi của bạn...";
      input.setAttribute("aria-label", "Nhập câu hỏi của bạn");
      input.disabled = sending;
      const sendBtn = document.createElement("button");
      sendBtn.type = "submit";
      sendBtn.className = "chat-send";
      sendBtn.textContent = sending ? "..." : "Gửi";
      sendBtn.disabled = sending;
      form.append(input, sendBtn);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value;
        if (text.trim()) sendMessage(text);
      });
      widget.appendChild(form);

      rootEl.appendChild(widget);

      // Focus input + scroll to bottom
      list.scrollTop = list.scrollHeight;
      if (!sending) input.focus();
    }

    function renderMessage(m, cfg) {
      const isUser = m.role === "user";
      const row = document.createElement("div");
      row.className = `msg-row ${isUser ? "msg-row-user" : "msg-row-bot"}`;

      if (!isUser) {
        const avatar = document.createElement("div");
        avatar.className = "msg-avatar";
        avatar.innerHTML = avatarHtml("msg-avatar-img");
        row.appendChild(avatar);
      }

      const bubble = document.createElement("div");
      bubble.className = `msg-bubble ${isUser ? "msg-bubble-user" : "msg-bubble-bot"} ${m.isError ? "msg-bubble-error" : ""}`;
      const markdownDiv = document.createElement("div");
      markdownDiv.className = "msg-markdown";
      markdownDiv.innerHTML = isUser ? escapeHtml(m.content) : renderMarkdown(m.content);
      bubble.appendChild(markdownDiv);
      row.appendChild(bubble);

      return row;
    }

    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML.replace(/\n/g, "<br>");
    }

    async function sendMessage(text) {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      messages.push({ id: makeId(), role: "user", content: trimmed });
      sending = true;
      render();

      const history = messages
        .filter((m) => m.id !== "greeting" && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const reply = await callChatApi(history);
        messages.push({ id: makeId(), role: "assistant", content: reply });
      } catch (err) {
        const hotline = cfg.contactInfo.zalo;
        messages.push({
          id: makeId(),
          role: "assistant",
          content: `Xin lỗi, mình đang gặp sự cố: ${err.message}\n\nBạn vui lòng liên hệ hotline/Zalo **${hotline}** để được hỗ trợ nhé.`,
          isError: true,
        });
      } finally {
        sending = false;
        render();
      }
    }

    render();
  }

  function showContactModal(rootEl, cfg) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const zaloDigits = (cfg.contactInfo.zalo || "").replace(/[^0-9]/g, "");

    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>Gặp tư vấn viên</h3>
          <button type="button" class="modal-close" aria-label="Đóng">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-row"><strong>Hotline:</strong> <a href="tel:${cfg.contactInfo.hotline}">${cfg.contactInfo.hotline}</a></p>
          <p class="modal-row"><strong>Zalo:</strong> ${
            zaloDigits
              ? `<a href="https://zalo.me/${zaloDigits}" target="_blank" rel="noopener noreferrer">${cfg.contactInfo.zalo}</a>`
              : cfg.contactInfo.zalo
          }</p>
          <p class="modal-row"><strong>Email:</strong> <a href="mailto:${cfg.contactInfo.email}">${cfg.contactInfo.email}</a></p>
          <p class="modal-row"><strong>Giờ làm việc:</strong> ${cfg.contactInfo.hours}</p>
        </div>
      </div>`;

    function close() {
      overlay.remove();
      window.removeEventListener("keydown", onKey);
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector(".modal-close").addEventListener("click", close);
    window.addEventListener("keydown", onKey);

    rootEl.appendChild(overlay);
  }

  // ---------- Khởi động ----------
  document.addEventListener("DOMContentLoaded", async () => {
    const root = document.getElementById("chat-widget-root");
    if (!root) return;
    const cfg = await fetchBotConfig();
    createChatWidget(root, cfg);
  });
})();
