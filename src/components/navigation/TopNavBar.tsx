import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  Coins,
  Gem,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Smartphone,
  Monitor,
  Bell,
  Users,
  Crown,
} from 'lucide-react';
import { WheelSpinModal } from '../modals/WheelSpinModal';
import { DailyQuestsModal } from '../modals/DailyQuestsModal';
import { AuthModal } from '../modals/AuthModal';
import { NotificationModal } from '../modals/NotificationModal';
import { FriendMatchModal } from '../modals/FriendMatchModal';
import { AdminDashboardModal } from '../modals/AdminDashboardModal';
import { soundManager } from '../../engine/audioEngine';

export const TopNavBar: React.FC = () => {
  const {
    user,
    isSoundMuted,
    toggleSound,
    quests,
    deviceViewMode,
    setDeviceViewMode,
    setActiveTab,
    showAuthModal,
    setShowAuthModal,
    showAdminModal,
    setShowAdminModal,
    adminTab,
    adminTargetPlayer,
    showNotificationModal,
    setShowNotificationModal,
    showFriendModal,
    setShowFriendModal,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    claimNotificationReward,
    broadcastNotification,
    startFriendRoomMatch,
    startPassAndPlayMatch,
    isAdmin,
  } = useGame();

  const [showWheel, setShowWheel] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  const hasUnclaimedQuests = quests.some(q => q.isCompleted && !q.isClaimed);

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-2.5 sm:px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: User Profile Pill */}
          <button
            onClick={() => {
              setActiveTab('profile');
              soundManager.playButtonClick();
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left shrink-0"
            title="Xem hồ sơ kỳ thủ"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full bg-slate-900 object-cover border border-teal-500/40"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-100 truncate max-w-[70px] sm:max-w-[105px]">
                {user.name}
              </span>
              <span className="text-[9px] font-mono text-teal-400">Lv.{user.level} · {user.elo} ELO</span>
            </div>
          </button>

          {/* Center: Currency Displays */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Coins */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Coins size={13} className="text-amber-400" />
              <span className="text-xs font-bold font-mono tabular-nums">{user.coins}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <Gem size={12} className="text-rose-400" />
              <span className="text-xs font-bold font-mono tabular-nums">{user.gems}</span>
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Admin Console Button (Exclusive to Admin) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setShowAdminModal(true);
                  soundManager.playButtonClick();
                }}
                className="h-8 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
                title="Bảng điều khiển Quản trị viên (Chỉ Admin)"
              >
                <Crown size={14} className="fill-slate-950" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Friend Match Button */}
            <button
              onClick={() => {
                setShowFriendModal(true);
                soundManager.playButtonClick();
              }}
              className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
              title="Đấu Với Bạn Bè (Mã phòng / Cùng máy)"
              aria-label="Đấu bạn bè"
            >
              <Users size={15} />
            </button>

            {/* Notification Bell Button */}
            <button
              onClick={() => {
                setShowNotificationModal(true);
                soundManager.playButtonClick();
              }}
              className="relative p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Thông báo cập nhật & sự kiện"
              aria-label="Thông báo"
            >
              <Bell size={15} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-400 text-slate-950 text-[9px] font-black font-mono flex items-center justify-center ring-2 ring-slate-900">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Google Sign In Button if Guest */}
            {user.isGuest ? (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  soundManager.playButtonClick();
                }}
                className="h-8 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                title="Đăng ký / Đăng nhập tài khoản Google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">Đăng Nhập</span>
              </button>
            ) : null}

            {/* Lucky wheel button */}
            <button
              onClick={() => {
                setShowWheel(true);
                soundManager.playButtonClick();
              }}
              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
              title="Vòng Quay May Mắn"
              aria-label="Vòng quay may mắn"
            >
              <Sparkles size={15} />
            </button>

            {/* Daily quests button */}
            <button
              onClick={() => {
                setShowQuests(true);
                soundManager.playButtonClick();
              }}
              className="relative p-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition-colors"
              title="Nhiệm Vụ Hàng Ngày"
              aria-label="Nhiệm vụ hàng ngày"
            >
              <Award size={15} />
              {hasUnclaimedQuests && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-pulse ring-2 ring-slate-900" />
              )}
            </button>

            {/* Device Mode Toggle */}
            <button
              onClick={() => {
                setDeviceViewMode(deviceViewMode === 'mobile' ? 'expanded' : 'mobile');
                soundManager.playButtonClick();
              }}
              className="hidden sm:flex p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={deviceViewMode === 'mobile' ? 'Mở rộng giao diện máy tính' : 'Chuyển sang khung điện thoại'}
              aria-label="Đổi chế độ xem"
            >
              {deviceViewMode === 'mobile' ? <Monitor size={15} /> : <Smartphone size={15} />}
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-label="Bật tắt âm thanh"
            >
              {isSoundMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-teal-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showWheel && <WheelSpinModal onClose={() => setShowWheel(false)} />}
      {showQuests && <DailyQuestsModal onClose={() => setShowQuests(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showNotificationModal && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotificationModal(false)}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
          onClaimReward={claimNotificationReward}
        />
      )}
      {showFriendModal && (
        <FriendMatchModal
          onClose={() => setShowFriendModal(false)}
          onStartRoomMatch={startFriendRoomMatch}
          onStartPassAndPlay={startPassAndPlayMatch}
        />
      )}
      {showAdminModal && (
        <AdminDashboardModal
          onClose={() => setShowAdminModal(false)}
          onBroadcastNotification={broadcastNotification}
          initialTab={adminTab}
          initialPlayerForRole={adminTargetPlayer}
        />
      )}
    </>
  );
};
