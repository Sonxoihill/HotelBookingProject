/**
 * Tiện ích bảo mật: Thoát ký tự HTML (Escape), làm sạch dữ liệu (Sanitize)
 * và phát hiện mã độc (XSS / Script Injection / Popup Trigger)
 */

/**
 * Danh sách các pattern mã độc / XSS / Script injection phổ biến
 */
const MALICIOUS_PATTERNS = [
  // 1. Thẻ script hoặc HTML đóng mở
  { regex: /<\s*script\b[^>]*>/i, reason: 'Thẻ <script> thực thi mã' },
  { regex: /<\s*\/\s*script\s*>/i, reason: 'Thẻ đóng </script>' },
  { regex: /<\s*[a-z!/][^>]*>/i, reason: 'Thẻ HTML không được phép' },

  // 2. Giao thức nguy hiểm (pseudo-protocols)
  { regex: /javascript\s*:/i, reason: 'Giao thức javascript:' },
  { regex: /vbscript\s*:/i, reason: 'Giao thức vbscript:' },
  { regex: /data\s*:\s*text\/html/i, reason: 'Giao thức data: text/html' },

  // 3. Thuộc tính sự kiện inline (onerror, onload, onclick, onmouseover,...)
  { regex: /\bon[a-z]{3,15}\s*=/i, reason: 'Thuộc tính sự kiện DOM inline (on...)' },

  // 4. Các hàm kích hoạt popup và thực thi mã JavaScript nguy hiểm
  { regex: /\balert\s*\(/i, reason: 'Hàm kích hoạt popup alert()' },
  { regex: /\bprompt\s*\(/i, reason: 'Hàm kích hoạt popup prompt()' },
  { regex: /\bconfirm\s*\(/i, reason: 'Hàm kích hoạt popup confirm()' },
  { regex: /\beval\s*\(/i, reason: 'Hàm thực thi mã eval()' },
  { regex: /\bFunction\s*\(/i, reason: 'Hàm khởi tạo Function()' },
  { regex: /\bsetTimeout\s*\(/i, reason: 'Hàm setTimeout()' },
  { regex: /\bsetInterval\s*\(/i, reason: 'Hàm setInterval()' },

  // 5. Truy cập đối tượng nhạy cảm trong trình duyệt
  { regex: /\bdocument\s*\.\s*(cookie|write|writeln|location|domain)/i, reason: 'Truy cập tài nguyên nhạy cảm document' },
  { regex: /\bwindow\s*\.\s*(location|open|navigate)/i, reason: 'Điều hướng trình duyệt window' },
  { regex: /\b(localStorage|sessionStorage)\b/i, reason: 'Truy cập storage trình duyệt' },

  // 6. Ký tự thẻ góc đóng mở đơn lẻ có nguy cơ injection
  { regex: /[<>]/, reason: 'Ký tự đóng mở thẻ nhúng HTML (< hoặc >)' },

  // 7. Mã hóa ký tự HTML Entity hoặc URI encoding nhằm vượt tường lửa
  { regex: /&#[xX]?[0-9a-fA-F]+;?/, reason: 'Mã hóa HTML Entity (bypass vector)' },
  { regex: /%3C|%3E|%22|%27/i, reason: 'Mã hóa URL Entity (%3C, %3E)' },
];

/**
 * Kiểm tra xem chuỗi có chứa mã độc hại, script injection, hoặc popup triggers hay không
 * @param {string} text
 * @returns {{ hasMalware: boolean, reason: string | null }}
 */
export const detectMaliciousCode = (text) => {
  if (!text || typeof text !== 'string') {
    return { hasMalware: false, reason: null };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { hasMalware: false, reason: null };
  }

  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.regex.test(trimmed)) {
      return {
        hasMalware: true,
        reason: pattern.reason,
      };
    }
  }

  return { hasMalware: false, reason: null };
};

/**
 * Thoát các ký tự đặc biệt HTML (HTML Entity Encoding)
 * Đảm bảo trình duyệt xem text thuần túy, tuyệt đối không render thành thẻ hay chạy script popup
 * @param {string} text
 * @returns {string}
 */
export const escapeHtml = (text) => {
  if (text === null || text === undefined) return '';
  const str = String(text);

  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`/=\\]/g, (char) => entityMap[char] || char);
};

/**
 * Làm sạch chuỗi (Sanitize) hoàn toàn trước khi view lại đơn
 * Loại bỏ tag HTML, script, popup, và mã hóa HTML an toàn 100%
 * @param {string} text
 * @returns {string}
 */
export const sanitizeText = (text) => {
  if (text === null || text === undefined) return '';
  let str = String(text).trim();

  if (!str) return '';

  // 1. Loại bỏ các thẻ script và nội dung bên trong
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Loại bỏ toàn bộ các thẻ HTML khác
  str = str.replace(/<[^>]*>/g, '');

  // 3. Loại bỏ pseudo-protocols
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/vbscript\s*:/gi, '');
  str = str.replace(/data\s*:/gi, '');

  // 4. Loại bỏ các lệnh gọi popup nguy hiểm
  str = str.replace(/\b(alert|prompt|confirm|eval)\s*\([^)]*\)/gi, '');

  // 5. Thoát ký tự HTML Entity
  return escapeHtml(str);
};

/**
 * Kiểm tra tính hợp lệ của phần ghi chú thêm đặt phòng
 * Yêu cầu:
 * - Giới hạn tối đa 100 ký tự
 * - Tuyệt đối không chứa mã độc hại, XSS, hoặc script popup
 * @param {string} note
 * @returns {{
 *   isValid: boolean,
 *   error: string,
 *   charCount: number,
 *   hasMalware: boolean,
 *   isOverLimit: boolean
 * }}
 */
export const validateBookingNotes = (note) => {
  const rawText = note || '';
  const charCount = rawText.length;

  // 1. Kiểm tra giới hạn 100 ký tự (theo độ dài chuỗi nhập vào)
  const isOverLimit = charCount > 100;

  // 2. Kiểm tra mã độc
  const malwareResult = detectMaliciousCode(rawText);

  if (isOverLimit && malwareResult.hasMalware) {
    return {
      isValid: false,
      error: `Cảnh báo: Ghi chú đã vượt quá 100 ký tự và phát hiện mã độc (${malwareResult.reason})!`,
      charCount,
      hasMalware: true,
      isOverLimit: true,
    };
  }

  if (isOverLimit) {
    return {
      isValid: false,
      error: 'Cảnh báo: Ghi chú đã vượt quá 100 ký tự',
      charCount,
      hasMalware: false,
      isOverLimit: true,
    };
  }

  if (malwareResult.hasMalware) {
    return {
      isValid: false,
      error: `Phát hiện mã độc trong phần ghi chú (${malwareResult.reason}). Không được phép đặt phòng!`,
      charCount,
      hasMalware: true,
      isOverLimit: false,
    };
  }

  return {
    isValid: true,
    error: '',
    charCount,
    hasMalware: false,
    isOverLimit: false,
  };
};

export default {
  detectMaliciousCode,
  escapeHtml,
  sanitizeText,
  validateBookingNotes,
};
