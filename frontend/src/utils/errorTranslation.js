/**
 * Tiện ích chuẩn hóa và dịch thông báo lỗi Validation sang Tiếng Việt 100%
 * Đảm bảo giao diện quản trị không bao giờ lọt message tiếng Anh mặc định của Spring Boot
 * như "must not be blank", "must be greater than 0", "must be a well-formed email address",...
 */

export const FIELD_LABELS = {
  // 1. Dịch vụ (Service)
  name: 'Tên',
  price: 'Đơn giá',
  basePrice: 'Giá phòng',
  unit: 'Đơn vị tính',
  sku: 'Mã định danh (SKU)',
  category: 'Nhóm danh mục',
  department: 'Bộ phận',
  slaTime: 'Thời gian phục vụ',
  status: 'Trạng thái',
  description: 'Mô tả',

  // 2. Loại phòng & Phòng vật lý (Room Category & Room)
  roomNumber: 'Số phòng',
  roomTypeId: 'Loại phòng',
  categoryId: 'Loại phòng',
  floor: 'Tầng',
  rfidCode: 'Mã thẻ từ (RFID)',
  capacity: 'Sức chứa',
  maxGuests: 'Sức chứa tối đa',
  maxChildren: 'Số trẻ em tối đa',
  bedCount: 'Số lượng giường',
  numberOfBeds: 'Số lượng giường',
  bedType: 'Quy cách giường',
  area: 'Diện tích',
  imageUrl: 'Hình ảnh',
  notes: 'Ghi chú',
  code: 'Mã loại phòng',
  badge: 'Huy hiệu nhận diện',

  // 3. Quy tắc giá linh hoạt (Pricing Rule)
  ruleType: 'Loại quy tắc',
  startDate: 'Từ ngày (Ngày bắt đầu)',
  endDate: 'Đến ngày (Ngày kết thúc)',
  adjustmentPercent: 'Phần trăm điều chỉnh',
  percentage: 'Tỷ lệ điều chỉnh',
  isActive: 'Trạng thái kích hoạt',

  // 4. Nhân sự & Tài khoản (Staff & User)
  fullName: 'Họ và tên',
  email: 'Địa chỉ email',
  phone: 'Số điện thoại',
  phoneNumber: 'Số điện thoại',
  password: 'Mật khẩu',
  role: 'Vai trò tài khoản',
  dateOfBirth: 'Ngày sinh',
  citizenId: 'CCCD/CMND',
  address: 'Địa chỉ',
  gender: 'Giới tính',
  shift: 'Ca trực',
};

/**
 * Lấy nhãn tiếng Việt tương ứng cho tên trường
 * Hỗ trợ các dạng lồng nhau: request.price, service.name, errors[0].field
 */
export const getFieldLabel = (rawField) => {
  if (!rawField || typeof rawField !== 'string') return '';
  const cleanField = rawField.split('.').pop().replace(/\[\d+\]/g, '').trim();
  return FIELD_LABELS[cleanField] || cleanField;
};

/**
 * Dịch một câu thông báo lỗi bất kỳ sang Tiếng Việt chuẩn mực
 * @param {string} rawMessage Thông báo lỗi từ Backend hoặc Spring Boot
 * @param {string} fieldKey Tên trường lỗi (nếu có)
 * @returns {string} Thông báo lỗi Tiếng Việt
 */
export const translateErrorMessage = (rawMessage, fieldKey = null) => {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return 'Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại.';
  }

  let text = rawMessage.trim();
  let label = fieldKey ? getFieldLabel(fieldKey) : '';

  // Nếu chưa có label, thử trích xuất tên field từ cú pháp lỗi Spring Boot: "on field 'name'"
  if (!label) {
    const fieldMatch = text.match(/on field ['"]?([a-zA-Z0-9_]+)['"]?/i);
    if (fieldMatch && fieldMatch[1]) {
      label = getFieldLabel(fieldMatch[1]);
    }
  }

  // Phát hiện nếu lỗi chứa cú pháp bọc của Spring MethodArgumentNotValidException:
  // Ví dụ: "...default message [must not be blank]..."
  const springDefaultMatch = text.match(/default message \[(.*?)\]/i);
  if (springDefaultMatch && springDefaultMatch[1]) {
    text = springDefaultMatch[1].trim();
  }

  // 1. Phân tích các mẫu lỗi phổ biến của Jakarta Validation / Hibernate Validator
  if (/must not be blank/i.test(text) || /must not be empty/i.test(text) || /must not be null/i.test(text)) {
    return label ? `${label} không được để trống.` : 'Trường này không được để trống.';
  }

  if (/must be greater than or equal to 0\.01/i.test(text)) {
    return label ? `${label} phải lớn hơn 0.` : 'Giá trị phải lớn hơn 0.';
  }

  if (/must be greater than 0/i.test(text)) {
    return label ? `${label} phải lớn hơn 0.` : 'Giá trị phải lớn hơn 0.';
  }

  const greaterOrEqualMatch = text.match(/must be greater than or equal to\s*([0-9.,]+)/i);
  if (greaterOrEqualMatch) {
    const val = greaterOrEqualMatch[1];
    return label ? `${label} phải lớn hơn hoặc bằng ${val}.` : `Giá trị phải lớn hơn hoặc bằng ${val}.`;
  }

  const greaterThanMatch = text.match(/must be greater than\s*([0-9.,]+)/i);
  if (greaterThanMatch) {
    const val = greaterThanMatch[1];
    return label ? `${label} phải lớn hơn ${val}.` : `Giá trị phải lớn hơn ${val}.`;
  }

  const lessOrEqualMatch = text.match(/must be less than or equal to\s*([0-9.,]+)/i);
  if (lessOrEqualMatch) {
    const val = lessOrEqualMatch[1];
    return label ? `${label} phải nhỏ hơn hoặc bằng ${val}.` : `Giá trị phải nhỏ hơn hoặc bằng ${val}.`;
  }

  const lessThanMatch = text.match(/must be less than\s*([0-9.,]+)/i);
  if (lessThanMatch) {
    const val = lessThanMatch[1];
    return label ? `${label} phải nhỏ hơn ${val}.` : `Giá trị phải nhỏ hơn ${val}.`;
  }

  if (/must be a well-formed email address/i.test(text)) {
    return 'Địa chỉ email không đúng định dạng.';
  }

  const sizeMatch = text.match(/(?:size|length) must be between\s*(\d+)\s*and\s*(\d+)/i);
  if (sizeMatch) {
    const min = sizeMatch[1];
    const max = sizeMatch[2];
    return label
      ? `${label} phải có độ dài từ ${min} đến ${max} ký tự.`
      : `Độ dài phải từ ${min} đến ${max} ký tự.`;
  }

  if (/numeric value out of bounds/i.test(text)) {
    return label ? `${label} có giá trị số vượt quá giới hạn cho phép.` : 'Giá trị số vượt quá giới hạn cho phép.';
  }

  if (/must be a future date/i.test(text)) {
    return label ? `${label} phải là ngày trong tương lai.` : 'Ngày chọn phải ở trong tương lai.';
  }

  if (/must be a date in the present or in the future/i.test(text)) {
    return label ? `${label} phải là ngày hiện tại hoặc tương lai.` : 'Ngày chọn phải là hiện tại hoặc tương lai.';
  }

  if (/must be a date in the past or in the present/i.test(text)) {
    return label ? `${label} phải là ngày trong quá khứ hoặc hiện tại.` : 'Ngày chọn phải là quá khứ hoặc hiện tại.';
  }

  if (/required request body is missing/i.test(text)) {
    return 'Dữ liệu gửi lên không được để trống.';
  }

  if (/json parse error/i.test(text) || /cannot deserialize/i.test(text) || /failed to convert/i.test(text)) {
    return 'Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
  }

  if (/validation failed/i.test(text) || /methodargumentnotvalidexception/i.test(text)) {
    return 'Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.';
  }

  if (/is required/i.test(text)) {
    return label ? `${label} là bắt buộc.` : 'Trường này là bắt buộc.';
  }

  if (/is invalid/i.test(text) || /invalid value/i.test(text)) {
    return label ? `${label} không hợp lệ.` : 'Giá trị không hợp lệ.';
  }

  // 2. Nếu thông báo đã là tiếng Việt thì giữ nguyên
  const hasVietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(text);
  if (hasVietnameseChars) {
    return text;
  }

  // 3. Dự phòng cho các mã lỗi HTTP thông dụng
  if (text === 'Bad Request' || text === 'BAD_REQUEST') {
    return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
  }
  if (text === 'Internal Server Error') {
    return 'Lỗi hệ thống máy chủ. Vui lòng thử lại sau.';
  }
  if (text === 'Conflict' || text === 'CONFLICT') {
    return 'Dữ liệu đã tồn tại hoặc xảy ra xung đột trong hệ thống.';
  }
  if (text === 'Not Found' || text === 'NOT_FOUND') {
    return 'Không tìm thấy dữ liệu yêu cầu.';
  }

  return label ? `${label}: ${text}` : text;
};

/**
 * Chuẩn hóa đối tượng lỗi dạng { [field]: rawErrorMsg } sang Tiếng Việt
 */
export const translateErrorsMap = (errorsObj) => {
  if (!errorsObj || typeof errorsObj !== 'object') return {};

  const result = {};
  for (const [key, val] of Object.entries(errorsObj)) {
    result[key] = translateErrorMessage(val, key);
  }
  return result;
};

/**
 * Gom các thông báo lỗi trường thành một chuỗi thông báo tổng quan rõ ràng
 */
export const formatValidationErrorsSummary = (errorsObj, fallbackMessage = '') => {
  if (!errorsObj || typeof errorsObj !== 'object') {
    return translateErrorMessage(fallbackMessage || 'Dữ liệu đầu vào không hợp lệ.');
  }

  const translated = translateErrorsMap(errorsObj);
  const messages = Object.values(translated).filter(Boolean);

  if (messages.length === 0) {
    return translateErrorMessage(fallbackMessage || 'Dữ liệu đầu vào không hợp lệ.');
  }

  // Gom các thông báo duy nhất
  const uniqueMessages = Array.from(new Set(messages));
  return uniqueMessages.join(' ');
};

export default {
  FIELD_LABELS,
  getFieldLabel,
  translateErrorMessage,
  translateErrorsMap,
  formatValidationErrorsSummary,
};
