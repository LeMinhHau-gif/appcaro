import React, { useState } from 'react';
import { X, Phone, User, ShieldCheck } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { loginUser, user } = useGame();
  const [tab, setTab] = useState<'options' | 'phone'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogleLogin = () => {
    soundManager.playButtonClick();
    loginUser('google');
    onClose();
  };

  const handleGuestLogin = () => {
    soundManager.playButtonClick();
    loginUser('guest');
    onClose();
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 9) {
      setOtpSent(true);
      soundManager.playButtonClick();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length >= 4) {
      loginUser('phone', phoneNumber);
      soundManager.playRewardSound();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2 border border-teal-500/30">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-100">Đăng Nhập Tài Khoản</h3>
          <p className="text-xs text-slate-400">Lưu tiến trình ván cờ, ELO xếp hạng và vật phẩm trên đám mây</p>
        </div>

        {tab === 'options' ? (
          <div className="flex flex-col gap-2.5">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            {/* Phone OTP Login */}
            <button
              onClick={() => setTab('phone')}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
            >
              <Phone size={15} className="text-teal-400" />
              <span>Đăng nhập Số Điện Thoại (OTP)</span>
            </button>

            {/* Guest play */}
            <button
              onClick={handleGuestLogin}
              className="w-full h-11 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800 active:scale-95 transition-all"
            >
              <User size={15} />
              <span>Chơi Ngay Không Cần Đăng Nhập (Khách)</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Nhập số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Gửi Mã Xác Thực OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Nhập mã OTP (Mặc định: 123456)
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-mono text-sm tracking-widest focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Xác Nhận & Đăng Nhập
                </button>
              </form>
            )}

            <button
              onClick={() => setTab('options')}
              className="text-xs text-slate-400 hover:text-white text-center pt-1"
            >
              ← Quay lại các phương thức khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
