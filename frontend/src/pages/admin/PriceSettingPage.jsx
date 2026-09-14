import React, { useState } from 'react';
import { formatVND, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Plus, BadgePercent, Trash2, Calendar, TrendingUp } from 'lucide-react';

export const PriceSettingPage = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Phụ thu Cuối tuần (Thứ 6, Thứ 7, CN)',
      type: 'PERCENT',
      adjustmentValue: 20, // +20%
      targetRooms: 'Tất cả các phòng',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isActive: true,
    },
    {
      id: 2,
      name: 'Mùa Cao Điểm Du Lịch Hè',
      type: 'PERCENT',
      adjustmentValue: 30, // +30%
      targetRooms: 'Deluxe & Suite',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      isActive: true,
    },
    {
      id: 3,
      name: 'Khuyến mãi Kích cầu Mùa thấp điểm',
      type: 'PERCENT',
      adjustmentValue: -15, // -15%
      targetRooms: 'Standard & Superior',
      startDate: '2026-10-01',
      endDate: '2026-11-30',
      isActive: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    adjustmentValue: '',
    targetRooms: 'Tất cả các phòng',
    startDate: '',
    endDate: '',
  });

  const handleAddRule = (e) => {
    e.preventDefault();
    setRules([
      ...rules,
      {
        id: Date.now(),
        name: newRule.name,
        type: 'PERCENT',
        adjustmentValue: Number(newRule.adjustmentValue),
        targetRooms: newRule.targetRooms,
        startDate: newRule.startDate || '2026-09-01',
        endDate: newRule.endDate || '2026-09-30',
        isActive: true,
      },
    ]);
    setIsModalOpen(false);
    setNewRule({ name: '', adjustmentValue: '', targetRooms: 'Tất cả các phòng', startDate: '', endDate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Cài Đặt Giá Linh Hoạt
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập biểu giá thông minh theo ngày lễ tết, cuối tuần, và mùa vụ cao/thấp điểm
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus size={16} />
          <span>Tạo Quy Tắc Giá Mới</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Tên quy tắc giá</th>
              <th className="px-5 py-3.5">Mức điều chỉnh</th>
              <th className="px-5 py-3.5">Phạm vi áp dụng</th>
              <th className="px-5 py-3.5">Thời gian hiệu lực</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">{r.name}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      r.adjustmentValue > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {r.adjustmentValue > 0 ? `+${r.adjustmentValue}%` : `${r.adjustmentValue}%`}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-700">{r.targetRooms}</td>
                <td className="px-5 py-3.5 text-slate-500">
                  {formatDate(r.startDate)} ➔ {formatDate(r.endDate)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {r.isActive ? 'Đang kích hoạt' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => setRules(rules.filter((item) => item.id !== r.id))}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Quy Tắc Giá */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo quy tắc giá linh hoạt mới"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddRule}>
              Áp dụng quy tắc
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          <Input
            label="Tên chính sách giá *"
            placeholder="Ví dụ: Phụ thu Quốc Khánh 2/9"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            required
          />

          <Input
            label="Phần trăm điều chỉnh giá (+/- %) *"
            type="number"
            placeholder="Ví dụ: 25 cho tăng 25%, hoặc -10 cho giảm 10%"
            value={newRule.adjustmentValue}
            onChange={(e) => setNewRule({ ...newRule, adjustmentValue: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Từ ngày *"
              type="date"
              value={newRule.startDate}
              onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
            />
            <Input
              label="Đến ngày *"
              type="date"
              value={newRule.endDate}
              onChange={(e) => setNewRule({ ...newRule, endDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PriceSettingPage;
