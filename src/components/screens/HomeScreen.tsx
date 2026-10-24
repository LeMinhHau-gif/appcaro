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
} from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

export const HomeScreen: React.FC = () => {
  const { user, startAiMatch, setActiveTab } = useGame();
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
    <div className="flex flex-col gap-5 p-3 sm:p-5 max-w-4xl mx-auto pb-24">
      {/* Hero AI Battle Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[#131b2e] to-[#0a1122] border border-cyan-500/30 p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Visual background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot size={18} />
              </span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Chế Độ Chính
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Minimax + Alpha-Beta AI</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
            Đấu Cờ Với AI Thông Minh
          </h2>
          <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
            Rèn luyện tư duy không gian và phản xạ chiến thuật với thuật toán dự đoán nước đi tiên tiến.
          </p>

          {/* Difficulty selector tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => {
                    setSelectedDifficulty(diff.id);
                    soundManager.playButtonClick();
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? `bg-slate-800 ${diff.color} shadow-md`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
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
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={18} className="fill-slate-950" />
            <span>Vào Trận Ngay</span>
          </button>
        </div>
      </div>

      {/* 3 Quick Game Modes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Campaign Map Card */}
        <button
          onClick={() => {
            setActiveTab('campaign');
            soundManager.playButtonClick();
          }}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 mb-3 group-hover:scale-105 transition-transform">
              <Compass size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Vượt Ải Chiến Dịch</h3>
            <p className="text-xs text-slate-400 mb-3">50 ải trải qua 5 cõi võ lâm cờ vây từ Dễ đến Bất Bại.</p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-teal-400 pt-2 border-t border-slate-800/80">
            <span>Đã mở: {user.unlockedStages.length}/50 ải</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Real-Time PvP Online Card */}
        <button
          onClick={() => {
            setActiveTab('multiplayer');
            soundManager.playButtonClick();
          }}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 mb-3 group-hover:scale-105 transition-transform">
              <Swords size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Xếp Hạng ELO Online</h3>
            <p className="text-xs text-slate-400 mb-3">Ghép trận thời gian thực, leo bảng tổng sắp kỳ thủ Việt Nam.</p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-400 pt-2 border-t border-slate-800/80">
            <span>Hiện tại: {user.elo} ELO</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Daily Tactical Puzzles Card */}
        <button
          onClick={() => {
            setActiveTab('puzzles');
            soundManager.playButtonClick();
          }}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-3 group-hover:scale-105 transition-transform">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Giải Đố Hàng Ngày</h3>
            <p className="text-xs text-slate-400 mb-3">Tìm nước cờ sát thủ "Mate in 2/3" nhận thưởng xu.</p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800/80">
            <span>Đã giải: {user.solvedPuzzles.length} thế</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* User Stats Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <Award size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tỷ Lệ Thắng</div>
            <div className="text-sm font-bold font-mono text-white tabular-nums">{winRate}%</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chuỗi Thắng</div>
            <div className="text-sm font-bold font-mono text-white tabular-nums">{user.winStreak} trận</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng Sao</div>
            <div className="text-sm font-bold font-mono text-white tabular-nums">{user.stars} ★</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cấp Độ</div>
            <div className="text-sm font-bold font-mono text-white tabular-nums">Cấp {user.level}</div>
          </div>
        </div>
      </div>

      {/* Strategic Tactical Tip Banner */}
      <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5 flex items-start gap-3">
        <Zap size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">Bí kíp Kỳ Đạo Caro: </strong>
          Để giành ưu thế tuyệt đối, hãy chủ động giăng bẫy <strong>Tứ Tam (1 nước tạo 4 cờ và 3 cờ)</strong> hoặc <strong>Song Tam (2 đường 3 cờ mở)</strong>. Khi gặp đối thủ có chuỗi 3 cờ mở, phải lập tức chặn một đầu!
        </div>
      </div>
    </div>
  );
};
