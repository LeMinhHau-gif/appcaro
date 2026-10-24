import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AIDifficulty } from '../../types/game';
import {
  Bot,
  Swords,
  Compass,
  BrainCircuit,
  Flame,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Play,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

export const HomeScreen: React.FC = () => {
  const { user, startAiMatch, setActiveTab, setShowAuthModal, setShowFriendModal } = useGame();
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');

  const difficulties: { id: AIDifficulty; label: string; desc: string; color: string; badge: string }[] = [
    { id: 'easy', label: 'Tập Sự', desc: 'Dễ chơi, AI thân thiện', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30', badge: 'Dễ' },
    { id: 'medium', label: 'Kỳ Thủ', desc: 'Chặn 3-4 cờ, nhạy bén', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30', badge: 'Vừa' },
    { id: 'hard', label: 'Cao Thủ', desc: 'Minimax 5 nước, tạo bẫy', color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', badge: 'Khó' },
    { id: 'grandmaster', label: 'Thần Sầu', desc: 'Alpha-Beta bất bại', color: 'from-rose-500/20 to-purple-500/20 text-rose-400 border-rose-500/30', badge: 'Cực Khó' },
  ];

  const handleStartAi = () => {
    soundManager.playButtonClick();
    startAiMatch(selectedDifficulty);
  };

  const winRate = user.wins + user.losses > 0
    ? Math.round((user.wins / (user.wins + user.losses)) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 max-w-4xl mx-auto pb-24">
      {/* Guest Google Verification Banner (if guest) */}
      {user.isGuest && (
        <div className="rounded-2xl bg-gradient-to-r from-teal-950/40 via-cyan-950/30 to-slate-900 border border-teal-500/30 p-3 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-100 truncate">
                Đăng ký xác minh bằng Google
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                Lưu giữ điểm ELO và các ải đã vượt lên đám mây vĩnh viễn
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowAuthModal(true);
              soundManager.playButtonClick();
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 shadow-sm transition-all"
          >
            Đăng Ký Ngay
          </button>
        </div>
      )}

      {/* Hero AI Battle Card (Optimized & Compact) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[#131b2e] to-[#0a1122] border border-cyan-500/30 p-4 sm:p-5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot size={16} />
              </span>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Đấu Cờ AI
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Minimax + Alpha-Beta Pruning</span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1">
            Thử Thách Kỳ Trí Gomoku
          </h2>
          <p className="text-xs text-slate-300 max-w-md mb-3 leading-relaxed">
            Chọn cấp độ thử thách để kiểm tra phản xạ chiến thuật và năng lực đọc thế trận.
          </p>

          {/* Difficulty selector tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => {
                    setSelectedDifficulty(diff.id);
                    soundManager.playButtonClick();
                  }}
                  className={`p-2 sm:p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? `bg-slate-800 ${diff.color} shadow-md`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-100">{diff.label}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {diff.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{diff.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Launch Play Button */}
          <button
            onClick={handleStartAi}
            className="w-full sm:w-auto h-11 px-7 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={16} className="fill-slate-950" />
            <span>Bắt Đầu Ván Đấu</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Game Modes Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Campaign Map Card */}
        <button
          onClick={() => {
            setActiveTab('campaign');
            soundManager.playButtonClick();
          }}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 mb-2 group-hover:scale-105 transition-transform">
              <Compass size={17} />
            </div>
            <h3 className="text-xs font-bold text-white mb-0.5">Vượt Ải Cờ</h3>
            <p className="text-[10px] text-slate-400 mb-2">50 ải 5 cõi võ lâm.</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-teal-400 pt-1.5 border-t border-slate-800/80">
            <span>{user.unlockedStages.length}/50 ải</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Real-Time PvP Online Card */}
        <button
          onClick={() => {
            setActiveTab('multiplayer');
            soundManager.playButtonClick();
          }}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 mb-2 group-hover:scale-105 transition-transform">
              <Swords size={17} />
            </div>
            <h3 className="text-xs font-bold text-white mb-0.5">Đấu Xếp Hạng</h3>
            <p className="text-[10px] text-slate-400 mb-2">Ghép trận nhanh ELO.</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-400 pt-1.5 border-t border-slate-800/80">
            <span>{user.elo} ELO</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Play with Friends Card */}
        <button
          onClick={() => {
            setShowFriendModal(true);
            soundManager.playButtonClick();
          }}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2 group-hover:scale-105 transition-transform">
              <Users size={17} />
            </div>
            <h3 className="text-xs font-bold text-white mb-0.5">Đấu Bạn Bè</h3>
            <p className="text-[10px] text-slate-400 mb-2">Mã phòng & cùng máy.</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 pt-1.5 border-t border-slate-800/80">
            <span>2 Người Chơi</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Daily Tactical Puzzles Card */}
        <button
          onClick={() => {
            setActiveTab('puzzles');
            soundManager.playButtonClick();
          }}
          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-2 group-hover:scale-105 transition-transform">
              <BrainCircuit size={17} />
            </div>
            <h3 className="text-xs font-bold text-white mb-0.5">Giải Đố Thế Cờ</h3>
            <p className="text-[10px] text-slate-400 mb-2">Sát thủ Mate in 2/3.</p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 pt-1.5 border-t border-slate-800/80">
            <span>{user.solvedPuzzles.length} Đã giải</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* User Stats Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <Award size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tỷ Lệ Thắng</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">{winRate}%</div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Flame size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chuỗi Thắng</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">{user.winStreak} trận</div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng Sao</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">{user.stars} ★</div>
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cấp Độ</div>
            <div className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">Cấp {user.level}</div>
          </div>
        </div>
      </div>

      {/* Strategic Tactical Tip Banner */}
      <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3 flex items-start gap-2.5">
        <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">Bí kíp Kỳ Đạo: </strong>
          Để tạo ưu thế tuyệt đối, hãy chủ động giăng bẫy <strong>Tứ Tam (1 nước tạo 4 cờ và 3 cờ)</strong> hoặc <strong>Song Tam (2 đường 3 cờ mở)</strong>. Khi đối thủ mở 3 cờ, hãy lập tức chặn ngay một đầu!
        </div>
      </div>
    </div>
  );
};
