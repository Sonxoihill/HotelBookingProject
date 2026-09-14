/**
 * Định dạng số tiền sang định dạng tiền Việt Nam (VNĐ)
 * @param {number|string} amount
 * @returns {string} ví dụ: 1.500.000 ₫
 */
export const formatVND = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount));
};

/**
 * Định dạng ngày theo chuẩn VN (DD/MM/YYYY)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

/**
 * Định dạng ngày giờ theo chuẩn VN (HH:mm - DD/MM/YYYY)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};
