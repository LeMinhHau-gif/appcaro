import React from 'react';
import { Player, OpponentProfile, GameMode } from '../../types/game';
import { Volume2, VolumeX, ArrowLeft, Shield, Clock } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface GameHeaderProps {
  opponent: OpponentProfile;
  gameMode: GameMode;
  activePlayer: Player;
  userPlayer: Player;
  timeLeft: number;
  maxTime: number;
  onExit: () => void;
  xStonesCount: number;
  oStonesCount: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  opponent,
  gameMode,
  activePlayer,
  userPlayer,
  timeLeft,
  maxTime,
  onExit,
  xStonesCount,
  oStonesCount,
}) => {
  const { user, isSoundMuted, toggleSound } = useGame();

  const isUserTurn = activePlayer === userPlayer;
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const isUrgent = timeLeft <= 5 && timeLeft > 0;

  const modeBadgeText = {
    ai: `Đấu với AI (${opponent.difficulty.toUpperCase()})`,
    pvp: 'Xếp Hạng Trực Tuyến ELO',
    campaign: `Vượt Ải: ${opponent.name}`,
    puzzle: 'Thế Cờ Chiến Thuật',
    practice: 'Tự Luyện Tập',
  }[gameMode];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 py-2.5">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Thoát</span>
        </button>

        <div className="text-center truncate">
          <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
            {modeBadgeText}
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label="Chuyển đổi âm thanh"
        >
          {isSoundMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-teal-400" />}
        </button>
      </div>

      {/* Players matchup bar */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1">
        {/* User Card (Left) */}
        <div
          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
            isUserTurn
              ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-950/40 border-slate-800/80'
          }`}
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-cyan-400/40 bg-slate-800 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black font-mono flex items-center justify-center shadow">
              {userPlayer}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-100 truncate">{user.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-mono tabular-nums text-cyan-400">{user.elo} ELO</span>
              <span>·</span>
              <span className="text-[10px] font-mono">{userPlayer === 'X' ? xStonesCount : oStonesCount} cờ</span>
            </div>
          </div>
        </div>

        {/* Center Countdown & Turn Status */}
        <div className="flex flex-col items-center justify-center px-1">
          <div className="relative flex items-center justify-center">
            {/* Circular Timer Ring */}
            <svg className="w-11 h-11 transform -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                stroke="currentColor"
                strokeWidth="3"
                className={`${
                  isUrgent ? 'text-rose-500 animate-pulse' : isUserTurn ? 'text-teal-400' : 'text-amber-400'
                } transition-all duration-300`}
                fill="transparent"
                strokeDasharray={113.1}
                strokeDashoffset={113.1 - (113.1 * timerPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  isUrgent ? 'text-rose-400 animate-bounce' : 'text-slate-200'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-medium tracking-tight mt-0.5 ${
              isUserTurn ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            {isUserTurn ? 'Lượt bạn' : 'Đối thủ...'}
          </span>
        </div>

        {/* Opponent Card (Right) */}
        <div
          className={`flex items-center justify-end gap-2 p-2 rounded-xl border transition-all ${
            !isUserTurn
              ? 'bg-rose-950/40 border-rose-500/50 shadow-sm shadow-rose-500/10'
              : 'bg-slate-950/40 border-slate-800/80'
          }`}
        >
          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="text-xs font-bold text-slate-100 truncate">{opponent.name}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400">
              <span className="text-[10px] font-mono">{userPlayer === 'X' ? oStonesCount : xStonesCount} cờ</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-rose-400">{opponent.elo} ELO</span>
            </div>
          </div>

          <div className="relative">
            <img
              src={opponent.avatar}
              alt={opponent.name}
              className="w-10 h-10 rounded-full border border-rose-400/40 bg-slate-800 object-cover"
            />
            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-rose-500 text-slate-950 text-[10px] font-black font-mono flex items-center justify-center shadow">
              {userPlayer === 'X' ? 'O' : 'X'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
