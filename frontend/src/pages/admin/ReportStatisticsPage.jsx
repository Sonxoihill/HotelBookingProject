import React from 'react';
import StatCard from '../../components/admin/StatCard';
import { formatVND } from '../../utils/formatters';
import { DollarSign, DoorOpen, Users, CalendarCheck, TrendingUp, Download } from 'lucide-react';
import Button from '../../components/common/Button';

export const ReportStatisticsPage = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Báo Cáo Doanh Thu & Thống Kê Hoạt Động
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu doanh thu, công suất phòng và hiệu suất đặt phòng toàn khách sạn
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Download size={14} />
          <span>Xuất báo cáo Excel</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng doanh thu tháng này"
          value={formatVND(185420000)}
          change="+14.2%"
          isIncrease={true}
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Tỷ lệ lấp đầy phòng"
          value="82.5%"
          change="+6.8%"
          isIncrease={true}
          icon={DoorOpen}
          color="blue"
        />
        <StatCard
          title="Lượt khách lưu trú"
          value="348 khách"
          change="+18.4%"
          isIncrease={true}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Đơn đặt phòng mới"
          value="126 đơn"
          change="-2.1%"
          isIncrease={false}
          icon={CalendarCheck}
          color="purple"
        />
      </div>

      {/* Revenue Breakdown & Occupancy Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo hạng phòng */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Cơ cấu doanh thu theo Hạng phòng
          </h3>
          <div className="space-y-3">
            {[
              { type: 'Presidential Royal Suite', revenue: 68500000, percentage: 37, color: 'bg-amber-500' },
              { type: 'Deluxe Ocean View', revenue: 54200000, percentage: 29, color: 'bg-blue-500' },
              { type: 'Superior Double King', revenue: 38700000, percentage: 21, color: 'bg-emerald-500' },
              { type: 'Standard Twin Room', revenue: 24020000, percentage: 13, color: 'bg-slate-400' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{item.type}</span>
                  <span className="font-bold text-slate-900">{formatVND(item.revenue)} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nguồn đặt phòng */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">
            Nguồn đặt phòng trực tuyến & tại quầy
          </h3>
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Trực tiếp Website khách hàng</span>
              <strong className="text-amber-600 font-bold">58%</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Tại quầy Lễ tân (Receptionist )</span>
              <strong className="text-blue-600 font-bold">27%</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Đại lý du lịch & OTA đối tác</span>
              <strong className="text-emerald-600 font-bold">15%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStatisticsPage;
