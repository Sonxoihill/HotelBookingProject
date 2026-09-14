import React, { useState } from 'react';
import { formatVND, formatDate } from '../../utils/formatters';
import { BOOKING_STATUS } from '../../utils/constants';
import ExtraServiceModal from '../../components/receptionist/ExtraServiceModal';
import Button from '../../components/common/Button';
import { Search, PlusCircle, CheckCircle, LogOut, UtensilsCrossed } from 'lucide-react';

export const ReceptionistBookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingForExtra, setSelectedBookingForExtra] = useState(null);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);

  const [bookings, setBookings] = useState([
    {
      id: 'BK-1082',
      customerName: 'Nguyễn Văn An',
      phone: '0912345678',
      roomNumber: '102',
      checkIn: '2026-09-15',
      checkOut: '2026-09-18',
      totalAmount: 3750000,
      status: 'CHECKED_IN',
      extraFee: 90000,
    },
    {
      id: 'BK-1083',
      customerName: 'Trần Thị Bình',
      phone: '0987654321',
      roomNumber: '104',
      checkIn: '2026-09-15',
      checkOut: '2026-09-16',
      totalAmount: 1450000,
      status: 'CONFIRMED',
      extraFee: 0,
    },
    {
      id: 'BK-1084',
      customerName: 'Phạm Minh Đức',
      phone: '0905123456',
      roomNumber: '201',
      checkIn: '2026-09-14',
      checkOut: '2026-09-17',
      totalAmount: 5100000,
      status: 'CHECKED_IN',
      extraFee: 250000,
    },
  ]);

  const handleCheckIn = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CHECKED_IN' } : b))
    );
  };

  const handleCheckOut = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CHECKED_OUT' } : b))
    );
  };

  const handleOpenExtraServices = (bk) => {
    setSelectedBookingForExtra(bk);
    setIsExtraModalOpen(true);
  };

  const handleSaveExtraServices = ({ bookingId, totalExtra }) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, extraFee: totalExtra, totalAmount: b.totalAmount + totalExtra }
          : b
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Quản Lý Đơn Đặt Phòng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xử lý thủ tục Nhận phòng (Check-in), Trả phòng (Check-out) và Dịch vụ phát sinh
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Mã đơn</th>
                <th className="px-4 py-3.5">Khách lưu trú</th>
                <th className="px-4 py-3.5">Phòng</th>
                <th className="px-4 py-3.5">Thời gian lưu trú</th>
                <th className="px-4 py-3.5">Phụ thu DV</th>
                <th className="px-4 py-3.5">Tổng tiền</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Hành động quầy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((bk) => {
                const statusMeta = BOOKING_STATUS[bk.status] || BOOKING_STATUS.PENDING;
                return (
                  <tr key={bk.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">#{bk.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{bk.customerName}</p>
                      <span className="text-[11px] text-slate-400">{bk.phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        P.{bk.roomNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(bk.checkIn)} ➔ {formatDate(bk.checkOut)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenExtraServices(bk)}
                        className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <UtensilsCrossed size={13} />
                        <span>{formatVND(bk.extraFee)}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatVND(bk.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {bk.status === 'CONFIRMED' && (
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleCheckIn(bk.id)}
                            className="gap-1 text-xs"
                          >
                            <CheckCircle size={13} />
                            <span>Check-in</span>
                          </Button>
                        )}
                        {bk.status === 'CHECKED_IN' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCheckOut(bk.id)}
                            className="gap-1 text-xs"
                          >
                            <LogOut size={13} />
                            <span>Check-out</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenExtraServices(bk)}
                          className="text-xs"
                        >
                          + DV phát sinh
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extra Service Modal ( extend ) */}
      <ExtraServiceModal
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
        booking={selectedBookingForExtra}
        onSave={handleSaveExtraServices}
      />
    </div>
  );
};

export default ReceptionistBookingsPage;
