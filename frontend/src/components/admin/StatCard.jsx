import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  isIncrease = true,
  icon: Icon,
  description = 'so với tháng trước',
  color = 'amber',
}) => {
  const colorMap = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.amber}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {change && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={`flex items-center font-bold ${
                isIncrease ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {change}
            </span>
            <span className="text-slate-400">{description}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
