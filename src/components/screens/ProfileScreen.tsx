import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { User, Trophy, Shield, Star, Sparkles, Award, ArrowLeft, LogOut } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=CaroPlayerMaster&backgroundColor=0ea5e9',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberCaroGamer&backgroundColor=14b8a6',
  'https://api.dicebear.com/7.x/bottts/svg?seed=GrandmasterAI&backgroundColor=8b5cf6',
  'https://api.dicebear.com/7.x/bottts/svg?seed=NeonDragon&backgroundColor=f43f5e',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=ZenMasterKỳ&backgroundColor=f59e0b',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=HeroCaroVN&backgroundColor=06b6d4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=KỳThủĐạiSư&backgroundColor=10b981',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=ThầnToánCaro&backgroundColor=6366f1',
];

export const ProfileScreen: React.FC = () => {
  const { user, updateUserAvatar, setActiveTab, logout } = useGame();
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [nameInput, setNameInput] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);

  const totalMatches = user.wins + user.losses + user.draws;
  const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0;

  const handleSelectAvatar = (url: string) => {
    setSelectedAvatar(url);
    updateUserAvatar(url, user.name);
    soundManager.playButtonClick();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateUserAvatar(user.avatar, nameInput.trim());
      setIsEditing(false);
      soundManager.playButtonClick();
    }
  };

  const achievements = [
    { id: 'a1', title: 'Nhập Môn Kỳ Đạo', desc: 'Đấu ván đầu tiên', unlocked: totalMatches >= 1, icon: Trophy },
    { id: 'a2', title: 'Cao Thủ Chiến Đấu', desc: 'Thắng 5 ván cờ', unlocked: user.wins >= 5, icon: Award },
    { id: 'a3', title: 'Nhà Chiến Thuật', desc: 'Giải 3 thế cờ', unlocked: user.solvedPuzzles.length >= 3, icon: Sparkles },
    { id: 'a4', title: 'Bất Bại Thần Binh', desc: 'Chuỗi 3 trận thắng liên tiếp', unlocked: user.winStreak >= 3, icon: Shield },
    { id: 'a5', title: 'Nhà Thám Hiểm', desc: 'Mở khóa 10 ải chiến dịch', unlocked: user.unlockedStages.length >= 10, icon: Star },
    { id: 'a6', title: 'Kỳ Thánh Xuất Trần', desc: 'Đạt mốc 1500 ELO', unlocked: user.elo >= 1500, icon: Trophy },
  ];

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('home');
              soundManager.playButtonClick();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Quay lại"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <User size={20} className="text-teal-400" />
              <span>Hồ Sơ Kỳ Thủ</span>
            </h2>
            <p className="text-xs text-slate-400">Thông tin cá nhân & chỉ số thành tích thi đấu</p>
          </div>
        </div>

        {/* Subtle Sign out button if user is authenticated with Google */}
        {!user.isGuest && (
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/80 transition-colors"
            title="Đăng xuất khỏi tài khoản"
          >
            <LogOut size={13} />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>

      {/* Main Profile Card (Clean & Compact) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4">
        <div className="relative shrink-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-slate-800 border-2 border-teal-500/50 object-cover shadow-lg"
          />
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-black font-mono text-[10px] shadow">
            Lv.{user.level}
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center sm:justify-start">
            {isEditing ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-teal-500 text-sm font-bold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold"
                >
                  Lưu
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">{user.name}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-teal-400 hover:underline"
                >
                  Đổi tên
                </button>
              </div>
            )}
            <span className="text-xs text-amber-400 font-semibold">{user.title}</span>
          </div>

          {/* Quick stats inline */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 mb-3">
            <span className="font-mono text-cyan-400 font-bold">{user.elo} ELO</span>
            <span>·</span>
            <span className="text-amber-400">{user.coins} Xu</span>
            <span>·</span>
            <span className="text-rose-400">{user.gems} Ngọc</span>
            {user.email && (
              <>
                <span>·</span>
                <span className="text-slate-400 truncate max-w-[140px] font-mono text-[11px]">{user.email}</span>
              </>
            )}
          </div>

          {/* Level XP Progress Bar */}
          <div className="w-full max-w-sm mx-auto sm:mx-0">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Kinh nghiệm cấp độ</span>
              <span className="font-mono tabular-nums">{user.xp} / {user.xpToNextLevel} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (user.xp / user.xpToNextLevel) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Strip */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
          Chọn Avatar Đại Diện
        </h4>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {AVATAR_OPTIONS.map((url, idx) => {
            const isSelected = user.avatar === url;
            return (
              <button
                key={idx}
                onClick={() => handleSelectAvatar(url)}
                className={`relative w-11 h-11 rounded-2xl p-0.5 border transition-all shrink-0 ${
                  isSelected
                    ? 'border-teal-400 ring-2 ring-teal-400/50 shadow-md'
                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                }`}
                aria-label={`Chọn avatar ${idx + 1}`}
              >
                <img src={url} alt={`Avatar ${idx}`} className="w-full h-full rounded-xl object-cover" />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tổng Số Trận</div>
          <div className="text-base font-bold font-mono text-white tabular-nums mt-0.5">
            {totalMatches} trận
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Thắng / Thua / Hòa</div>
          <div className="text-base font-bold font-mono text-teal-400 tabular-nums mt-0.5">
            {user.wins} <span className="text-slate-600">/</span> <span className="text-rose-400">{user.losses}</span> <span className="text-slate-600">/</span> <span className="text-slate-400">{user.draws}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tỷ Lệ Thắng</div>
          <div className="text-base font-bold font-mono text-cyan-400 tabular-nums mt-0.5">
            {winRate}%
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chuỗi Thắng Dài Nhất</div>
          <div className="text-base font-bold font-mono text-amber-400 tabular-nums mt-0.5">
            {user.winStreak} trận
          </div>
        </div>
      </div>

      {/* Achievements Badges */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          <span>Huy Hiệu & Danh Hiệu Thành Tích</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                  item.unlocked
                    ? 'bg-slate-950/70 border-amber-500/30'
                    : 'bg-slate-950/30 border-slate-900 opacity-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.unlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    {item.unlocked && (
                      <span className="text-[10px] font-mono font-bold text-amber-400">Đạt ✓</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
