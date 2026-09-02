/**
 * PRANA GUIDE AI — Backend Google Apps Script
 * =============================================================================
 * SYSTEM_PROMPT nằm gọn trong MỘT hằng số duy nhất ngay bên dưới đây (yêu cầu
 * F6) — đây là giá trị MẶC ĐỊNH/dự phòng. Trang Admin (Admin.html) cho phép
 * ghi đè giá trị đang chạy thực tế mà KHÔNG cần sửa file này hay redeploy —
 * xem getEffectiveSystemPrompt_() bên dưới để hiểu cơ chế 2 tầng này.
 *
 * Nội dung SYSTEM_PROMPT dưới đây = nguyên văn system prompt đang dùng trong
 * bản Netlify/Supabase trước đó, CỘNG THÊM mục "Giới hạn an toàn bắt buộc"
 * chép nguyên văn từ file Kho-Kien-Thuc-Prana-Guide.xlsx (sheet "Giới hạn an
 * toàn") theo xác nhận của bạn — không diễn giải lại, không rút gọn.
 * =============================================================================
 */
var SYSTEM_PROMPT = `Bạn là "Prana Guide AI" — trợ lý AI về sức khỏe Thân–Tâm–Trí (Yoga & Thiền) của một trung tâm Yoga.

## Vai trò & mục đích
- Chăm sóc khách hàng, hỏi–đáp thông tin, hỗ trợ đặt lịch và thu thập thông tin liên hệ.
- Đối tượng: khách cũ và khách hàng tiềm năng.

## Xưng hô & phong cách
- Xưng hô: "mình" (bot) – "bạn" (người dùng).
- Phong cách: ngắn gọn, chuyên nghiệp, ấm áp, chạm đến cảm xúc người đọc. Tránh dài dòng, lan man.
- Ngôn ngữ: LUÔN trả lời bằng đúng ngôn ngữ mà người dùng đang dùng để hỏi (tiếng Việt hoặc tiếng Anh). Nếu người dùng hỏi bằng tiếng Anh, trả lời hoàn toàn bằng tiếng Anh; nếu hỏi bằng tiếng Việt, trả lời bằng tiếng Việt.
- Định dạng câu trả lời rõ ràng: dùng **in đậm** cho ý chính, xuống dòng hợp lý, và danh sách gạch đầu dòng khi liệt kê nhiều ý (ví dụ các bước, các tư thế, thực đơn...). Dùng markdown chuẩn (không dùng HTML).

## Phạm vi trả lời
Chỉ trả lời trong các chủ đề: yoga, thiền, hơi thở, trị liệu/chữa lành tự nhiên, giảm cân, cải thiện thị lực, sức khỏe cột sống, thư giãn & phục hồi năng lượng, dinh dưỡng lành mạnh, phát triển bản thân/sống an lạc.
Nếu câu hỏi nằm ngoài phạm vi này (ví dụ: chính trị, công nghệ không liên quan, chủ đề nhạy cảm khác...), hãy lịch sự từ chối và mời liên hệ tư vấn viên qua hotline/Zalo 0976188870 hoặc email nguyenhuongk21@gmail.com.

## Kiến thức tham khảo về tư thế Yoga
Phần "KIẾN THỨC THAM KHẢO — TÀI LIỆU KỸ THUẬT TƯ THẾ YOGA" ở cuối system prompt này là tài liệu nội bộ của trung tâm, liệt kê chi tiết tác dụng, cách thực hiện từng bước, yêu cầu và lưu ý/chống chỉ định của từng tư thế yoga.
- Khi người dùng hỏi về MỘT tư thế yoga cụ thể có trong tài liệu (ví dụ: tư thế con thỏ, mèo bò, cánh cung, chiến binh I/II/III, cái ghế, bánh xe, tam giác...), PHẢI dựa theo đúng nội dung (tác dụng, các bước B1-B2-..., yêu cầu, lưu ý) trong tài liệu để trả lời — không tự thêm bước hoặc tác dụng không có trong tài liệu.
- Trình bày lại tự nhiên, súc tích (không nhất thiết liệt kê nguyên văn từng chữ), luôn giữ đúng thứ tự các bước và đầy đủ phần lưu ý/chống chỉ định quan trọng nếu tài liệu có nêu.
- Nếu người dùng hỏi về một tư thế yoga CỤ THỂ (có tên rõ ràng) mà KHÔNG có trong tài liệu, hãy dùng công cụ tìm kiếm Google để tra cứu thông tin về tư thế đó từ các trang web uy tín, có thương hiệu về yoga/sức khỏe (ví dụ: Yoga Journal, Verywell Fit, các trang yoga chuyên nghiệp...). Trả lời dựa trên thông tin tra cứu được, nói rõ đây là thông tin tham khảo chung (không phải tài liệu riêng của trung tâm), và luôn mời liên hệ huấn luyện viên để được hướng dẫn trực tiếp, đảm bảo đúng kỹ thuật và an toàn.
- CHỈ dùng công cụ tìm kiếm Google trong đúng trường hợp trên (tên tư thế yoga cụ thể, chưa có trong tài liệu). TUYỆT ĐỐI KHÔNG dùng tìm kiếm cho bất kỳ nội dung nào khác — kể cả các câu hỏi chung về yoga/thiền/hơi thở/dinh dưỡng/phát triển bản thân đã có thể trả lời bằng kiến thức sẵn có, câu hỏi đặt lịch, câu hỏi liên hệ, hay bất kỳ chủ đề nào ngoài phạm vi yoga. Nếu không chắc có cần tìm kiếm hay không, ưu tiên KHÔNG tìm kiếm.
- Nếu tài liệu kiến thức có kèm đường link hình ảnh minh họa liên quan đến câu hỏi, hãy đưa link đó vào câu trả lời bằng đúng cú pháp ảnh markdown, dạng ![mô tả ngắn](URL) — với URL là link ảnh thật lấy từ tài liệu, để ảnh hiển thị trực tiếp trong khung chat thay vì chỉ dán URL trần hoặc mô tả suông.
- Nếu tài liệu kiến thức có kèm link video YouTube (youtube.com hoặc youtu.be) hướng dẫn liên quan đến câu hỏi, hãy đưa nguyên link đó (dạng URL đầy đủ, không cần cú pháp đặc biệt) vào câu trả lời — hệ thống sẽ tự động hiển thị thành video xem trực tiếp trong khung chat.

## An toàn thông tin & y tế
- KHÔNG bịa đặt thông tin. Với các chủ đề khác ngoài tư thế yoga cụ thể (thiền, hơi thở, dinh dưỡng, phát triển bản thân...), chỉ trả lời dựa trên kiến thức chung mà bạn chắc chắn; nếu không chắc, nói rõ là chưa có đủ thông tin và mời liên hệ tư vấn viên.
- KHÔNG được sử dụng hoặc tiết lộ thông tin của bất kỳ khách hàng nào khác để trả lời.
- Với các câu hỏi liên quan đến bệnh lý, chấn thương, hoặc tình trạng sức khỏe đặc biệt (ví dụ: bệnh tim, mang thai, chấn thương cột sống nặng...): nhắc người dùng rằng bạn không thay thế tư vấn y tế chuyên nghiệp, và khuyên họ tham khảo ý kiến bác sĩ/chuyên gia y tế trước khi tập luyện, đồng thời vẫn có thể đưa ra gợi ý chung mang tính tham khảo một cách thận trọng.

## Giới hạn an toàn bắt buộc (chép nguyên văn từ Kho-Kien-Thuc-Prana-Guide.xlsx, sheet "Giới hạn an toàn")
Các quy tắc dưới đây có hiệu lực CAO HƠN mọi hướng dẫn khác ở trên nếu có xung đột — luôn ưu tiên tuân theo các quy tắc này với các chủ đề sức khỏe nhạy cảm:
1. Khách hỏi yoga có chữa khỏi bệnh không → Không khẳng định yoga chữa khỏi bất kỳ bệnh nào. Chỉ nói yoga HỖ TRỢ cải thiện, giảm triệu chứng, nâng cao thể trạng. Không dùng từ "trị liệu bệnh", "chữa khỏi", "hết bệnh".
2. Khách mô tả bệnh và hỏi nên tập gì → Không chẩn đoán. Đưa thông tin chung trong kho, kèm khuyến nghị trao đổi với bác sĩ hoặc giảng viên trước khi tập.
3. Người cao tuổi, có bệnh nền, cao huyết áp, tim mạch, thoát vị đĩa đệm, từng chấn thương → Không đưa bài tập cụ thể. Khẳng định vẫn có lựa chọn phù hợp, khuyên hỏi bác sĩ và đăng ký buổi tư vấn 1-1 với giảng viên. Chuyển hotline.
4. Phụ nữ mang thai → Không hướng dẫn bài tập. Chuyển hotline để giảng viên tư vấn trực tiếp.
5. Khách có dấu hiệu trầm cảm, tuyệt vọng, mất phương hướng kéo dài, ý nghĩ làm hại bản thân → DỪNG tư vấn yoga và thiền. Đáp lại bằng sự lắng nghe, nói rõ đây là điều nên được hỗ trợ bởi người thật, khuyến khích chia sẻ với người thân và chuyên gia tâm lý, đưa hotline 0976188870. TUYỆT ĐỐI không thay thế bằng bài thiền 10 phút.
6. Người dùng là trẻ vị thành niên (dưới 18 tuổi) → Trả lời nhẹ nhàng, khuyến khích trao đổi với bố mẹ hoặc thầy cô. Không tư vấn tâm lý chuyên sâu, không tư vấn giảm cân, không tư vấn ăn kiêng.
7. Khách hỏi về giảm cân, ăn kiêng, số cân, lượng calo → Không đưa chỉ tiêu cân nặng, không lập thực đơn theo con số, không cổ vũ nhịn ăn. Chỉ nói nguyên tắc ăn uống lành mạnh chung.
8. Khách hỏi về thuốc, thực phẩm chức năng, liều dùng → Từ chối. Chuyển sang bác sĩ hoặc dược sĩ.
9. Câu hỏi về một tư thế yoga cụ thể (có tên rõ ràng) mà kho kiến thức chưa có → ĐƯỢC PHÉP dùng công cụ tìm kiếm Google, tra cứu từ nguồn uy tín, có thương hiệu rồi trả lời — nêu rõ đây là thông tin tham khảo chung, không phải tài liệu riêng của trung tâm. Câu hỏi HOÀN TOÀN ngoài phạm vi yoga/thiền/sức khỏe (chính trị, công nghệ không liên quan, chủ đề khác...) → Xin lỗi và chuyển hotline 0976188870. Tuyệt đối không tự suy đoán với các chủ đề ngoài phạm vi này.
10. Khách so sánh Prana với trung tâm khác, hỏi giá bên kia → Không so sánh, không bình luận về đơn vị khác. Chỉ nói về Prana.
11. Khách hỏi thông tin cá nhân của học viên khác → Từ chối tuyệt đối.
12. Khách muốn gặp người thật → Đưa ngay hotline 0976188870, Zalo cùng số, email nguyenhuongk21@gmail.com, giờ làm việc 8h–12h và 14h–21h.

## Đặt lịch
Khi người dùng muốn đặt lịch (học thử, tư vấn, buổi tập...):
1. Hỏi lần lượt (hoặc cùng lúc nếu người dùng cung cấp sẵn): **Họ tên**, **Số điện thoại**, **Thời gian mong muốn**.
2. Khi đã có ĐỦ CẢ BA thông tin trên, PHẢI tóm tắt lại đúng theo định dạng sau (giữ nguyên nhãn, mỗi thông tin 1 dòng, để hệ thống tự động lưu lại):
**Họ tên:** <tên khách>
**Số điện thoại:** <số điện thoại>
**Thời gian mong muốn:** <thời gian>
3. Sau đó mời người dùng liên hệ trực tiếp Hotline/Zalo **0976188870** để xác nhận lịch chính thức (vì bot chưa tự động đặt lịch được).
4. Nếu người dùng mới cung cấp MỘT PHẦN thông tin (chưa đủ cả ba), tuyệt đối KHÔNG dùng định dạng tóm tắt ở bước 2 — chỉ hỏi tiếp phần còn thiếu bằng câu văn bình thường.

## Gặp tư vấn viên
Nếu người dùng muốn nói chuyện với người thật, hoặc bot không thể giúp được, hãy cung cấp:
- Hotline/Zalo: 0976188870
- Email: nguyenhuongk21@gmail.com
- Giờ làm việc: 8h–12h và 14h–21h

## Lời chào
Nếu là tin nhắn đầu tiên của cuộc trò chuyện và người dùng chỉ chào hỏi xã giao, hãy giới thiệu ngắn gọn bản thân và các chủ đề bạn có thể hỗ trợ (yoga, thiền & hơi thở, giảm stress, dinh dưỡng, phục hồi năng lượng, phát triển bản thân).`;

// =============================================================================
// CẤU HÌNH BOT MẶC ĐỊNH (dùng khi chưa có bản ghi đè lưu qua trang Admin)
// =============================================================================
var DEFAULT_BOT_CONFIG = {
  botName: 'Prana Guide AI',
  botSubtitle: 'Yoga · Thiền · Sức khỏe Thân–Tâm–Trí',
  logoUrl: 'https://nguyenhuongk21-netizen.github.io/ChatbotAI/logo.png',
  primaryColor: '#4f7a6b',
  greeting:
    'Xin chào! Mình là Prana Guide AI – trợ lý sức khỏe thân - tâm - trí của bạn. Hãy trò chuyện với mình nếu bạn cần:\n' +
    '🧘 Hướng dẫn Yoga · 🌿 Thiền & Hơi thở · 😌 Giảm stress · 🍎 Dinh dưỡng lành mạnh · 🌞 Phục hồi năng lượng · 💖 Phát triển bản thân',
  suggestedQuestions: [
    { label: '🧘 Hướng dẫn Yoga', prompt: 'Bạn hướng dẫn cho mình về Yoga được không?' },
    { label: '🌿 Thiền & Hơi thở', prompt: 'Bạn hướng dẫn mình một bài thiền hoặc bài tập thở để thư giãn được không?' },
    { label: '😌 Giảm stress', prompt: 'Mình đang căng thẳng, bạn có thể giúp mình giảm stress không?' },
    { label: '🍎 Dinh dưỡng lành mạnh', prompt: 'Bạn tư vấn giúp mình về dinh dưỡng lành mạnh cho người tập yoga được không?' },
    { label: '🌞 Phục hồi năng lượng', prompt: 'Mình muốn phục hồi năng lượng, bạn có gợi ý gì không?' },
    { label: '💖 Phát triển bản thân', prompt: 'Bạn có thể giúp mình phát triển bản thân, sống bình an hơn không?' },
  ],
  contactInfo: {
    hotline: '0976188870',
    zalo: '0976188870',
    email: 'nguyenhuongk21@gmail.com',
    hours: '8h–12h và 14h–21h',
  },
  marqueeEnabled: false,
  marqueeText: '',
};

var GEMINI_MODEL = 'gemini-3.6-flash'; // gemini-2.5-flash đã ngừng phục vụ người dùng mới (thông báo từ Google)
var MAX_MESSAGES = 40; // tối đa số tin nhắn giữ lại trong 1 lượt gọi (chống lạm dụng)
var MAX_MESSAGE_LENGTH = 4000; // tối đa ký tự mỗi tin nhắn
var KNOWLEDGE_DRIVE_FILENAME = 'PranaGuide_KnowledgeBase_Override.txt';
var ACCESS_CODES_PROP = 'ACCESS_CODES'; // JSON: [{ code, label, deviceIds:[], createdAt, lastUsedAt }]
var MAX_DEVICES_PER_CODE = 2; // mỗi mã tối đa dùng trên 2 thiết bị — quá số này thì từ chối

// =============================================================================
// ĐIỂM VÀO WEB APP
// =============================================================================

/**
 * 3 công dụng tùy theo tham số:
 *  - ?page=admin&key=<ADMIN_SECRET>  → phục vụ trang quản trị (Admin.html)
 *  - ?action=config                  → trả JSON cấu hình công khai cho chat.js
 *  - (không tham số)                 → JSON trạng thái, dùng để test nhanh
 */
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.page === 'admin') {
    var secret = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET');
    if (!secret || params.key !== secret) {
      // Không tiết lộ là có trang admin — trả về như 1 route không tồn tại.
      return jsonResponse_({ error: 'Not found' });
    }
    return HtmlService.createTemplateFromFile('Admin')
      .evaluate()
      .setTitle('Prana Guide AI — Admin')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  if (params.action === 'config') {
    return jsonResponse_(getPublicBotConfig_());
  }

  return jsonResponse_({
    status: 'ok',
    bot: DEFAULT_BOT_CONFIG.botName,
    message: 'Prana Guide AI Apps Script backend đang chạy. Gửi POST tới URL này với { "messages": [...] } để chat.',
  });
}

/** Endpoint chính cho chat — nhận { messages: [{role,content}] }, trả { reply: "..." }. */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ error: 'Thiếu dữ liệu gửi lên.' });
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse_({ error: 'Body không hợp lệ (không phải JSON).' });
    }

    if (body.type === 'verify-access') {
      return jsonResponse_(verifyAndBindAccessCode_(body.code, body.deviceId));
    }

    if (!checkAccessCode_(body.code, body.deviceId)) {
      return jsonResponse_({
        error: 'Bạn cần nhập mã truy cập hợp lệ để dùng chat.',
        needAccessCode: true,
      });
    }

    var messages = sanitizeMessages_(body.messages);
    if (!messages) {
      return jsonResponse_({ error: 'Thiếu tin nhắn hợp lệ.' });
    }

    var reply = callGemini_(messages);
    return jsonResponse_({ reply: reply });
  } catch (err) {
    Logger.log('doPost lỗi: ' + err);
    var hotline = getPublicBotConfig_().contactInfo.zalo;
    return jsonResponse_({
      error: 'Xin lỗi, mình đang gặp sự cố kỹ thuật. Bạn vui lòng liên hệ hotline/Zalo ' + hotline + ' để được hỗ trợ nhé.',
    });
  }
}

/** Cho phép Admin.html include AdminJS.html (mẫu HtmlService chuẩn của Google). */
function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =============================================================================
// KHỞI TẠO — chạy TAY 1 lần sau khi đặt Script Properties (xem hướng dẫn)
// =============================================================================
function khoiTao() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error(
      'CHƯA đặt GEMINI_API_KEY trong Script Properties. Vào biểu tượng bánh răng (Project Settings) > Script Properties > Add script property, đặt tên "GEMINI_API_KEY" và dán key Gemini thật vào, rồi chạy lại khoiTao().',
    );
  }
  if (!props.getProperty('ADMIN_SECRET')) {
    Logger.log(
      '⚠️ Chưa đặt ADMIN_SECRET trong Script Properties — trang Admin sẽ không mở được. ' +
        'Vào Project Settings > Script Properties, thêm ADMIN_SECRET = một mật khẩu bạn tự chọn.',
    );
  }
  Logger.log('Đã tìm thấy GEMINI_API_KEY. Đang gọi thử Gemini để kiểm tra kết nối...');
  var reply = callGemini_([
    { role: 'user', content: 'Xin chào, bạn hãy trả lời đúng 1 câu ngắn xác nhận bạn đã sẵn sàng hoạt động.' },
  ]);
  Logger.log('✅ KHỞI TẠO THÀNH CÔNG! Gemini phản hồi: ' + reply);
  Logger.log('Bước tiếp theo: Deploy > New deployment > Web app để lấy URL, dán vào PROXY_URL trong chat.js.');
}

// =============================================================================
// CẤU HÌNH ĐỘNG — đọc/ghi qua Script Properties (System Prompt + Bot Config)
// và Google Drive (Kho kiến thức, vì vượt quá giới hạn 9KB/property).
// Cơ chế 2 tầng: có bản ghi đè (Admin đã lưu) → dùng bản ghi đè; chưa có →
// dùng hằng số mặc định trong Code.gs/KhoKienThuc.gs. Ghi đè có hiệu lực NGAY,
// không cần Deploy lại.
// =============================================================================

function getEffectiveSystemPrompt_() {
  var override = PropertiesService.getScriptProperties().getProperty('SYSTEM_PROMPT_OVERRIDE');
  return override || SYSTEM_PROMPT;
}

function getEffectiveKnowledgeBase_() {
  var fileId = PropertiesService.getScriptProperties().getProperty('KNOWLEDGE_FILE_ID');
  if (fileId) {
    try {
      return DriveApp.getFileById(fileId).getBlob().getDataAsString('UTF-8');
    } catch (err) {
      Logger.log('Không đọc được file kiến thức override, dùng mặc định: ' + err);
    }
  }
  return typeof KNOWLEDGE_BASE !== 'undefined' ? KNOWLEDGE_BASE : '';
}

function getPublicBotConfig_() {
  var override = PropertiesService.getScriptProperties().getProperty('BOT_CONFIG_OVERRIDE');
  if (override) {
    try {
      return JSON.parse(override);
    } catch (err) {
      Logger.log('BOT_CONFIG_OVERRIDE lỗi JSON, dùng mặc định: ' + err);
    }
  }
  return DEFAULT_BOT_CONFIG;
}

// =============================================================================
// HÀM GỌI TỪ Admin.html / AdminJS.html QUA google.script.run
// =============================================================================

/** Trả toàn bộ dữ liệu Admin cần để hiển thị form (gọi 1 lần khi tải trang). */
function adminGetData() {
  return {
    systemPrompt: getEffectiveSystemPrompt_(),
    knowledgeBase: getEffectiveKnowledgeBase_(),
    botConfig: getPublicBotConfig_(),
  };
}

function adminSaveSystemPrompt(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('System Prompt không được để trống.');
  }
  PropertiesService.getScriptProperties().setProperty('SYSTEM_PROMPT_OVERRIDE', text);
  return { ok: true };
}

function adminSaveKnowledgeBase(text) {
  if (typeof text !== 'string') {
    throw new Error('Nội dung kiến thức không hợp lệ.');
  }
  var props = PropertiesService.getScriptProperties();
  var fileId = props.getProperty('KNOWLEDGE_FILE_ID');
  var file = null;
  if (fileId) {
    try {
      file = DriveApp.getFileById(fileId);
      file.setContent(text);
    } catch (err) {
      file = null; // file cũ bị xóa/mất quyền — tạo file mới bên dưới
    }
  }
  if (!file) {
    file = DriveApp.createFile(KNOWLEDGE_DRIVE_FILENAME, text, MimeType.PLAIN_TEXT);
    props.setProperty('KNOWLEDGE_FILE_ID', file.getId());
  }
  return { ok: true };
}

function adminSaveBotConfig(configObj) {
  if (!configObj || typeof configObj !== 'object') {
    throw new Error('Cấu hình không hợp lệ.');
  }
  PropertiesService.getScriptProperties().setProperty('BOT_CONFIG_OVERRIDE', JSON.stringify(configObj));
  return { ok: true };
}

/** Danh sách mã truy cập cho trang Admin — KHÔNG trả deviceIds thật, chỉ trả số lượng. */
function adminListAccessCodes() {
  return getAccessCodes_().map(function (item) {
    return {
      code: item.code,
      label: item.label,
      deviceCount: item.deviceIds.length,
      maxDevices: MAX_DEVICES_PER_CODE,
      createdAt: item.createdAt,
      lastUsedAt: item.lastUsedAt,
    };
  });
}

function adminCreateAccessCode(label) {
  if (typeof label !== 'string' || !label.trim()) {
    throw new Error('Cần nhập tên/nhãn cho người được cấp mã.');
  }
  var list = getAccessCodes_();
  var code;
  do {
    code = generateAccessCode_();
  } while (list.some(function (item) { return item.code === code; }));

  list.push({
    code: code,
    label: label.trim(),
    deviceIds: [],
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  });
  saveAccessCodes_(list);
  return { code: code, label: label.trim() };
}

function adminResetAccessCodeDevices(code) {
  var list = getAccessCodes_();
  var entry = list.filter(function (item) { return item.code === code; })[0];
  if (!entry) throw new Error('Không tìm thấy mã này.');
  entry.deviceIds = [];
  saveAccessCodes_(list);
  return { ok: true };
}

function adminDeleteAccessCode(code) {
  var list = getAccessCodes_().filter(function (item) { return item.code !== code; });
  saveAccessCodes_(list);
  return { ok: true };
}

// =============================================================================
// KIỂM SOÁT MÃ TRUY CẬP — mỗi người dùng được cấp 1 mã riêng (tạo/quản lý qua trang
// Admin). Mã tự khoá vào thiết bị đầu tiên dùng nó, tối đa MAX_DEVICES_PER_CODE thiết
// bị/mã — nếu người được cấp mã đưa mã cho người khác gõ trên thiết bị thứ 3+, người đó
// sẽ bị từ chối. Đây KHÔNG phải cơ chế chống chia sẻ tuyệt đối (ai cũng có thể chép mã
// gửi đi), nhưng đủ để hạn chế lan truyền ngoài ý muốn và cho phép thu hồi từng người.
// =============================================================================

function getAccessCodes_() {
  var raw = PropertiesService.getScriptProperties().getProperty(ACCESS_CODES_PROP);
  if (!raw) return [];
  try {
    var list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    Logger.log('ACCESS_CODES lỗi JSON, coi như rỗng: ' + err);
    return [];
  }
}

function saveAccessCodes_(list) {
  PropertiesService.getScriptProperties().setProperty(ACCESS_CODES_PROP, JSON.stringify(list));
}

function generateAccessCode_() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bỏ ký tự dễ nhầm: 0/O, 1/I
  var code = '';
  for (var i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Kiểm tra READ-ONLY — dùng cho mỗi lượt chat, không ghi lại Script Properties. */
function checkAccessCode_(code, deviceId) {
  if (typeof code !== 'string' || !code.trim() || typeof deviceId !== 'string' || !deviceId.trim()) {
    return false;
  }
  var normalized = code.trim().toUpperCase();
  var entry = getAccessCodes_().filter(function (item) { return item.code === normalized; })[0];
  if (!entry) return false;
  return entry.deviceIds.indexOf(deviceId) !== -1;
}

/** Xác thực + gán thiết bị (nếu còn suất) — chỉ gọi lúc người dùng nhập mã lần đầu. */
function verifyAndBindAccessCode_(code, deviceId) {
  if (typeof code !== 'string' || !code.trim()) {
    return { ok: false, error: 'Vui lòng nhập mã truy cập.' };
  }
  if (typeof deviceId !== 'string' || !deviceId.trim()) {
    return { ok: false, error: 'Thiếu thông tin thiết bị, vui lòng tải lại trang.' };
  }
  var normalized = code.trim().toUpperCase();
  var list = getAccessCodes_();
  var entry = list.filter(function (item) { return item.code === normalized; })[0];
  if (!entry) {
    return { ok: false, error: 'Mã truy cập không đúng.' };
  }

  if (entry.deviceIds.indexOf(deviceId) === -1) {
    if (entry.deviceIds.length >= MAX_DEVICES_PER_CODE) {
      return {
        ok: false,
        error: 'Mã này đã được dùng trên đủ ' + MAX_DEVICES_PER_CODE + ' thiết bị. Liên hệ quản trị viên để được cấp lại.',
      };
    }
    entry.deviceIds.push(deviceId);
  }
  entry.lastUsedAt = new Date().toISOString();
  saveAccessCodes_(list);
  return { ok: true, label: entry.label };
}

// =============================================================================
// HÀM NỘI BỘ
// =============================================================================

function sanitizeMessages_(raw) {
  if (!raw || !raw.length) return null;
  var start = Math.max(0, raw.length - MAX_MESSAGES);
  var trimmedArray = raw.slice(start);
  var cleaned = [];
  for (var i = 0; i < trimmedArray.length; i++) {
    var item = trimmedArray[i];
    if (!item) continue;
    var role = item.role;
    var content = item.content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    var trimmedContent = content.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!trimmedContent) continue;
    cleaned.push({ role: role, content: trimmedContent });
  }
  return cleaned.length > 0 ? cleaned : null;
}

function callGemini_(messages) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Thiếu GEMINI_API_KEY trong Script Properties.');
  }

  var knowledge = getEffectiveKnowledgeBase_();
  var fullSystemInstruction = knowledge
    ? getEffectiveSystemPrompt_() + '\n\n## KIẾN THỨC THAM KHẢO\n' + knowledge
    : getEffectiveSystemPrompt_();

  var contents = messages.map(function (m) {
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    };
  });

  var payload = {
    contents: contents,
    systemInstruction: { parts: [{ text: fullSystemInstruction }] },
    // Giảm độ trễ suy luận — model gemini-3.x dùng thinkingLevel (không phải thinkingBudget,
    // field đó dành cho model 2.5 và gây lỗi 400 INVALID_ARGUMENT trên model 3.x). "low" là
    // mức thấp nhất mà mọi biến thể Gemini 3 đều hỗ trợ (một số bản không hỗ trợ "minimal").
    generationConfig: {
      thinkingConfig: { thinkingLevel: 'low' },
    },
    // Cho phép Gemini tự tìm kiếm Google khi gặp tên tư thế cụ thể chưa có trong kho kiến thức
    // (xem hướng dẫn trong SYSTEM_PROMPT, mục "Kiến thức tham khảo" và quy tắc số 9). Model tự
    // quyết định khi nào cần tìm — câu hỏi đã có sẵn trong kho thì không tốn lượt tìm kiếm.
    tools: [{ google_search: {} }],
  };

  var url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    GEMINI_MODEL +
    ':generateContent?key=' +
    apiKey;

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  var status = response.getResponseCode();
  var bodyText = response.getContentText();

  if (status !== 200) {
    Logger.log('Gemini API lỗi ' + status + ': ' + bodyText);
    throw new Error('Gemini API lỗi (' + status + ') [debug]: ' + bodyText);
  }

  var data = JSON.parse(bodyText);
  var candidate = data.candidates && data.candidates[0];
  if (!candidate || !candidate.content || !candidate.content.parts) {
    throw new Error('Gemini không trả về nội dung hợp lệ.');
  }
  return candidate.content.parts
    .map(function (p) {
      return p.text || '';
    })
    .join('');
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
