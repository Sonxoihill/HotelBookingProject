import React, { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatVND } from '../../utils/formatters';
import { paymentService } from '../../services/paymentService';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Home,
  FileText,
  Mail,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Calendar,
} from 'lucide-react';

// Từ điển giải nghĩa mã phản hồi VNPay chuẩn (vnp_ResponseCode)
const VNPAY_RESPONSE_MESSAGES = {
  '00': 'Giao dịch thanh toán thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Thẻ / Tài khoản của quý khách chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Khách hàng xác thực thông tin thẻ / tài khoản không đúng quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ / Tài khoản của quý khách hiện đang bị khóa.',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thử lại.',
  '24': 'Khách hàng đã hủy giao dịch thanh toán trên cổng VNPay.',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang trong thời gian bảo trì.',
  '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Giao dịch không thành công do lỗi hệ thống VNPay hoặc thông tin không hợp lệ.',
};

/**
 * Trang nhận kết quả thanh toán trả về từ cổng VNPay
 * Route: /booking/vnpay-return
 */
export const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Đọc các tham số phản hồi từ URL trả về của VNPay
  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef') || '';
  const transactionNo = searchParams.get('vnp_TransactionNo') || '';
  const bankCode = searchParams.get('vnp_BankCode') || '';
  const rawAmount = searchParams.get('vnp_Amount') || '';
  const orderInfo = searchParams.get('vnp_OrderInfo') || '';
  const payDate = searchParams.get('vnp_PayDate') || '';

  // Đồng bộ kết quả thanh toán với Backend để cập nhật Database và gửi Email xác nhận
  useEffect(() => {
    const hasVNPayParams = searchParams.get('vnp_ResponseCode') && searchParams.get('vnp_SecureHash');
    if (hasVNPayParams) {
      const allParams = {};
      searchParams.forEach((value, key) => {
        allParams[key] = value;
      });
      paymentService.verifyVNPayReturn(allParams).catch((err) => {
        console.warn('Lỗi khi gửi xác thực thanh toán về Backend:', err);
      });
    }
  }, [searchParams]);

  // VNPay truyền số tiền nhân với 100 (Ví dụ: 100000000 = 1.000.000 VNĐ)
  const amount = useMemo(() => {
    if (!rawAmount || isNaN(Number(rawAmount))) return null;
    return Math.round(Number(rawAmount) / 100);
  }, [rawAmount]);

  // Định dạng ngày giờ VNPay (yyyyMMddHHmmss -> DD/MM/YYYY HH:mm:ss)
  const formattedPayDate = useMemo(() => {
    if (!payDate || payDate.length !== 14) return null;
    const year = payDate.slice(0, 4);
    const month = payDate.slice(4, 6);
    const day = payDate.slice(6, 8);
    const hour = payDate.slice(8, 10);
    const min = payDate.slice(10, 12);
    const sec = payDate.slice(12, 14);
    return `${day}/${month}/${year} ${hour}:${min}:${sec}`;
  }, [payDate]);

  // Kiểm tra trạng thái thành công tuyệt đối: vnp_ResponseCode === '00'
  const isSuccess = responseCode === '00';

  // Lấy thông điệp chi tiết theo mã lỗi
  const responseMessage = useMemo(() => {
    if (!responseCode) {
      return 'Không tìm thấy thông tin mã phản hồi (vnp_ResponseCode) từ cổng thanh toán.';
    }
    return VNPAY_RESPONSE_MESSAGES[responseCode] || `Mã phản hồi từ cổng thanh toán: ${responseCode}`;
  }, [responseCode]);

  // Xử lý nút "Quay lại thử lại": sử dụng route hiện có /booking-payment
  const handleRetryPayment = () => {
    try {
      const lastAttemptStr = sessionStorage.getItem('last_booking_attempt');
      if (lastAttemptStr) {
        const lastAttempt = JSON.parse(lastAttemptStr);
        if (lastAttempt?.roomId) {
          const query = new URLSearchParams();
          query.set('roomId', lastAttempt.roomId);
          if (lastAttempt.checkIn) query.set('checkIn', lastAttempt.checkIn);
          if (lastAttempt.checkOut) query.set('checkOut', lastAttempt.checkOut);
          if (lastAttempt.phone) query.set('phone', lastAttempt.phone);
          navigate(`/booking-payment?${query.toString()}`);
          return;
        }
      }
    } catch (_) {}

    // Fallback: quay về trang đặt phòng hoặc trang danh sách phòng
    navigate('/booking-payment');
  };

  return (
    <div className="min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* =================================================================== */}
        {/* KHỐI KẾT QUẢ THANH TOÁN (THÀNH CÔNG HOẶC THẤT BẠI)                   */}
        {/* =================================================================== */}
        <div
          className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm text-center space-y-6 transition-all ${
            isSuccess
              ? 'border-emerald-200/80 shadow-emerald-500/5'
              : 'border-rose-200/80 shadow-rose-500/5'
          }`}
        >
          {/* ICON & TIÊU ĐỀ TRẠNG THÁI */}
          <div className="space-y-3">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-transform ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50'
                  : 'bg-rose-100 text-rose-600 ring-8 ring-rose-50'
              }`}
            >
              {isSuccess ? <CheckCircle2 size={44} /> : <XCircle size={44} />}
            </div>

            <div className="space-y-1">
              <span
                className={`text-xs font-bold tracking-widest uppercase block ${
                  isSuccess ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isSuccess ? 'Giao dịch hoàn tất' : 'Giao dịch chưa hoàn tất'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Thất Bại'}
              </h1>
            </div>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isSuccess ? (
                <>
                  Đơn đặt phòng của quý khách đã được xác nhận thanh toán qua cổng <strong>VNPay</strong>.
                </>
              ) : (
                responseMessage
              )}
            </p>
          </div>

          {/* NHẮC NHỞ KIỂM TRA EMAIL (KHI THÀNH CÔNG) */}
          {isSuccess && (
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-start gap-3 text-left">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <strong className="block font-semibold mb-0.5">Vui lòng kiểm tra email của bạn:</strong>
                Chúng tôi đã gửi thư xác nhận đặt phòng kèm hóa đơn điện tử và mã nhận phòng chi tiết về hòm thư của bạn.
              </div>
            </div>
          )}

          {/* CẢNH BÁO / HƯỚNG DẪN (KHI THẤT BẠI) */}
          {!isSuccess && (
            <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 flex items-start gap-3 text-left">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed">
                <strong className="block font-semibold mb-0.5">Giao dịch chưa được trừ tiền:</strong>
                Quý khách có thể bấm <strong>"Quay lại thử lại"</strong> để chọn lại phương thức thanh toán hoặc thử lại giao dịch với thẻ/ngân hàng khác.
              </div>
            </div>
          )}

          {/* BẢNG CHI TIẾT GIAO DỊCH VNPAY (NẾU CÓ DỮ LIỆU TỪ URL) */}
          {(txnRef || amount || bankCode || transactionNo || responseCode) && (
            <div className="bg-slate-50/70 rounded-2xl p-4.5 text-xs space-y-2.5 border border-slate-100 text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200/60 pb-2">
                Thông tin giao dịch VNPay
              </span>

              {txnRef && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-slate-800">#{txnRef}</span>
                </div>
              )}

              {amount !== null && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Số tiền thanh toán:</span>
                  <span className={`font-bold ${isSuccess ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {formatVND(amount)}
                  </span>
                </div>
              )}

              {bankCode && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Ngân hàng thanh toán:</span>
                  <span className="font-semibold text-slate-800 uppercase">{bankCode}</span>
                </div>
              )}

              {transactionNo && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Mã giao dịch VNPay:</span>
                  <span className="font-mono text-slate-700">{transactionNo}</span>
                </div>
              )}

              {responseCode && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Mã phản hồi (Response Code):</span>
                  <Badge variant={isSuccess ? 'emerald' : 'rose'} size="sm">
                    {responseCode}
                  </Badge>
                </div>
              )}

              {formattedPayDate && (
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Thời gian giao dịch:</span>
                  <span className="text-slate-700">{formattedPayDate}</span>
                </div>
              )}

              {orderInfo && (
                <div className="pt-2 border-t border-slate-200/60 text-slate-500">
                  <span className="block text-[11px] text-slate-400 mb-0.5">Nội dung:</span>
                  <span className="text-slate-700 break-words">{decodeURIComponent(orderInfo)}</span>
                </div>
              )}
            </div>
          )}

          {/* CÁC NÚT ĐIỀU HƯỚNG */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isSuccess ? (
              <>
                <Button
                  id="btn-view-bookings"
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/my-bookings')}
                  className="w-full sm:w-auto shadow-md shadow-amber-600/20 bg-[#C59D5F] hover:bg-[#b08b50] text-white"
                >
                  <FileText size={16} className="mr-1.5" />
                  Xem Đặt Phòng Của Tôi
                </Button>
                <Button
                  id="btn-back-home"
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto"
                >
                  <Home size={16} className="mr-1.5" />
                  Về Trang Chủ
                </Button>
              </>
            ) : (
              <>
                <Button
                  id="btn-retry-payment"
                  variant="primary"
                  size="md"
                  onClick={handleRetryPayment}
                  className="w-full sm:w-auto shadow-md shadow-rose-600/20 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <RotateCcw size={16} className="mr-1.5" />
                  Quay lại thử lại
                </Button>
                <Button
                  id="btn-back-home-fail"
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto"
                >
                  <Home size={16} className="mr-1.5" />
                  Về Trang Chủ
                </Button>
              </>
            )}
          </div>
        </div>

        {/* BẢO MẬT & BẢN QUYỀN */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Xác thực bởi Cổng thanh toán VNPay • Kết nối an toàn 256-bit SSL</span>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
