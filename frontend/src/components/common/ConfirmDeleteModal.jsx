import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa dữ liệu',
  message = 'Bạn có chắc chắn muốn xóa mục này không? Thao tác này sẽ không thể khôi phục.',
  itemName = '',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200 animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Trash2 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-rose-700 uppercase block">
                CẢNH BÁO THAO TÁC XÓA
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full hover:bg-stone-200/80 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-stone-600 leading-relaxed">
            {message}
          </p>

          {itemName && (
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-xs font-mono font-bold text-stone-800 break-all">
              {itemName}
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
            <AlertTriangle size={15} className="shrink-0 text-amber-600" />
            <span>Lưu ý: Nếu dữ liệu đang được sử dụng ở các đơn đặt phòng, hệ thống có thể từ chối hoặc chuyển sang trạng thái ngừng hoạt động.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-white cursor-pointer transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Xác nhận xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
