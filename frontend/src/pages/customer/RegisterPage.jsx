import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Hotel, Mail, Lock, User, UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-600/20">
            <Hotel size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Đăng Ký Tài Khoản</h2>
          <p className="text-xs text-slate-500">
            Tạo tài khoản thành viên nhận ưu đãi đặt phòng
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Họ và tên *"
            icon={User}
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            label="Địa chỉ Email *"
            type="email"
            icon={Mail}
            placeholder="example@domain.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Mật khẩu *"
            type="password"
            icon={Lock}
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Input
            label="Xác nhận mật khẩu *"
            type="password"
            icon={Lock}
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-2.5 text-sm font-bold gap-2 mt-2"
          >
            <UserPlus size={16} />
            <span>Tạo Tài Khoản</span>
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Đã có tài khoản thành viên?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

