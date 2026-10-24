import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Coins, Gem, Volume2, VolumeX, Sparkles, Award, Smartphone, Monitor } from 'lucide-react';
import { WheelSpinModal } from '../modals/WheelSpinModal';
import { DailyQuestsModal } from '../modals/DailyQuestsModal';
import { soundManager } from '../../engine/audioEngine';

export const TopNavBar: React.FC = () => {
  const { user, isSoundMuted, toggleSound, quests, deviceViewMode, setDeviceViewMode, setActiveTab } = useGame();
  const [showWheel, setShowWheel] = useState(false);
  const [showQuests, setShowQuests] = useState(false);

  const hasUnclaimed = quests.some(q => q.isCompleted && !q.isClaimed);

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Left: User Quick Pill */}
          <button
            onClick={() => {
              setActiveTab('profile');
              soundManager.playButtonClick();
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full bg-slate-900 object-cover border border-teal-500/40"
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-100 truncate max-w-[80px] sm:max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[9px] font-mono text-teal-400">Lv.{user.level} · {user.elo} ELO</span>
            </div>
          </button>

          {/* Center: Currency displays */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Coins size={14} className="text-amber-400" />
              <span className="text-xs font-bold font-mono tabular-nums">{user.coins}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <Gem size={13} className="text-rose-400" />
              <span className="text-xs font-bold font-mono tabular-nums">{user.gems}</span>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-1.5">
            {/* Lucky wheel button */}
            <button
              onClick={() => {
                setShowWheel(true);
                soundManager.playButtonClick();
              }}
              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
              title="Vòng Quay May Mắn"
            >
              <Sparkles size={16} />
            </button>

            {/* Daily quests button */}
            <button
              onClick={() => {
                setShowQuests(true);
                soundManager.playButtonClick();
              }}
              className="relative p-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition-colors"
              title="Nhiệm Vụ Hàng Ngày"
            >
              <Award size={16} />
              {hasUnclaimed && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse ring-2 ring-slate-900" />
              )}
            </button>

            {/* Device Mode Toggle (Mobile vs Expanded) */}
            <button
              onClick={() => {
                setDeviceViewMode(deviceViewMode === 'mobile' ? 'expanded' : 'mobile');
                soundManager.playButtonClick();
              }}
              className="hidden sm:flex p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={deviceViewMode === 'mobile' ? 'Mở rộng giao diện máy tính' : 'Chuyển sang khung điện thoại'}
            >
              {deviceViewMode === 'mobile' ? <Monitor size={16} /> : <Smartphone size={16} />}
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isSoundMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-teal-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showWheel && <WheelSpinModal onClose={() => setShowWheel(false)} />}
      {showQuests && <DailyQuestsModal onClose={() => setShowQuests(false)} />}
    </>
  );
};
