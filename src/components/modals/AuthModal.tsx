import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, User, Sparkles, AlertCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { loginWithGoogle, user } = useGame();
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const success = await loginWithGoogle();
      if (success) {
        onClose();
      } else {
        setAuthError('Đăng nhập bị hủy hoặc gặp sự cố cửa sổ popup. Vui lòng thử lại.');
      }
    } catch (e) {
      setAuthError('Đã xảy ra lỗi khi kết nối với tài khoản Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    soundManager.playButtonClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Ambient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 text-teal-400 flex items-center justify-center mb-2 border border-teal-500/40 shadow-inner">
            <ShieldCheck size={26} />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {activeTab === 'register' ? 'Đăng Ký Tài Khoản Kỳ Thủ' : 'Đăng Nhập Tài Khoản'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mt-0.5">
            Xác minh danh tính an toàn với Google để lưu trữ tiến trình thi đấu
          </p>
        </div>

        {/* Tab switch between Register & Login */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
          <button
            onClick={() => {
              setActiveTab('register');
              setAuthError(null);
              soundManager.playButtonClick();
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Ký Mới
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setAuthError(null);
              soundManager.playButtonClick();
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Nhập
          </button>
        </div>

        {/* Benefits List (For Register) */}
        {activeTab === 'register' ? (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-4 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
              Quyền Lợi Kỳ Thủ Đăng Ký
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
              <span>Xác minh danh tính nhanh chóng qua Google</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
              <span>Lưu vĩnh viễn điểm ELO, thứ hạng và sao vượt ải</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
              <span>Đồng bộ tiến trình và vật phẩm trên mọi thiết bị</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 mb-4 text-xs text-slate-300 leading-relaxed">
            Đăng nhập để tiếp tục hành trình cờ Caro, khôi phục điểm ELO và các gói bàn cờ, quân cờ đã mở khóa.
          </div>
        )}

        {/* Error message if any */}
        {authError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-3">
            <AlertCircle size={15} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Main Google Verification Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full h-12 rounded-2xl bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition-all border border-slate-200 cursor-pointer disabled:opacity-60"
        >
          {/* Authentic Google G SVG logo */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span>
            {isLoading
              ? 'Đang kết nối Google...'
              : activeTab === 'register'
              ? 'Đăng Ký & Xác Minh Với Google'
              : 'Đăng Nhập Với Google'}
          </span>
        </button>

        {/* Guest continue link */}
        <div className="pt-4 text-center">
          <button
            onClick={handleGuestContinue}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-800/60"
          >
            <User size={13} />
            <span>Tiếp tục với tài khoản Khách</span>
          </button>
        </div>
      </div>
    </div>
  );
};
