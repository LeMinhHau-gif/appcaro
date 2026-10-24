import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import {
  User,
  Trophy,
  Shield,
  Star,
  Sparkles,
  Award,
  ArrowLeft,
  LogOut,
  Crown,
  Database,
  History,
  Users,
  CheckCircle2,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Lock,
} from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';
import { INITIAL_DEMO_ACTION_LOGS } from '../../data/demoActionLogs';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { PlayerActionLog } from '../../types/game';

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
  const { user, updateUserAvatar, setActiveTab, logout, isAdmin, openAdminDashboard } = useGame();
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [nameInput, setNameInput] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);

  // Admin audit log preview state (only used by admin)
  const [recentLogs, setRecentLogs] = useState<PlayerActionLog[]>(INITIAL_DEMO_ACTION_LOGS);
  const [logFilter, setLogFilter] = useState<'all' | 'role_granted' | 'login' | 'match_played'>('all');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      // Fetch latest audit logs from Firestore
      const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
          const snap = await getDocs(collection(db, 'player_action_logs'));
          if (!snap.empty) {
            const list: PlayerActionLog[] = [];
            snap.forEach(d => {
              const data = d.data();
              list.push({
                id: d.id,
                userId: data.userId || 'system',
                userName: data.userName || 'Kỳ Thủ',
                userEmail: data.userEmail,
                action: data.action || 'login',
                actionLabel: data.actionLabel || data.action || 'Thao tác',
                details: data.details || '',
                timestamp: data.timestamp || new Date().toISOString(),
                metadata: data.metadata,
              });
            });
            if (list.length > 0) {
              setRecentLogs([...list, ...INITIAL_DEMO_ACTION_LOGS.filter(l => !list.some(x => x.id === l.id))]);
            }
          }
        } catch (e) {
          console.warn('Profile admin fetch logs:', e);
        } finally {
          setIsLoadingLogs(false);
        }
      };
      fetchLogs();
    }
  }, [isAdmin]);

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

      {/* EXCLUSIVE ADMIN DATABASE MANAGEMENT & AUDIT LOGS SECTION (ONLY FOR ADMIN) */}
      {isAdmin && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500/50 p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner shrink-0">
                <Crown size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                    Trung Tâm Quản Lý Database & Phân Quyền
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                    Chỉ Quản Trị Viên
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đặc quyền tài khoản: <strong className="text-amber-400 font-mono">leminhhaukrb16@gmail.com</strong> · Kiểm soát toàn bộ người chơi và lịch sử thao tác
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                openAdminDashboard('overview');
                soundManager.playButtonClick();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
            >
              <Database size={15} />
              <span>Mở Bảng Điều Khiển Database</span>
            </button>
          </div>

          {/* 4 Feature Action Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => {
                openAdminDashboard('roles');
                soundManager.playButtonClick();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-amber-500/30 hover:border-amber-400 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-2 group-hover:scale-105 transition-transform">
                  <Shield size={16} />
                </div>
                <div className="text-xs font-bold text-white">Phân Quyền & Cấp Hạn</div>
                <div className="text-[10px] text-slate-400 mt-0.5">1, 3, 6, 12 tháng, vĩnh viễn</div>
              </div>
              <div className="text-[10px] font-bold text-amber-400 flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                <span>Cấp Đặc Quyền</span>
                <span>→</span>
              </div>
            </button>

            <button
              onClick={() => {
                openAdminDashboard('audit_logs');
                soundManager.playButtonClick();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-teal-500/30 hover:border-teal-400 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 mb-2 group-hover:scale-105 transition-transform">
                  <History size={16} />
                </div>
                <div className="text-xs font-bold text-white">Lịch Sử Thao Tác</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Theo dõi từng hành vi</div>
              </div>
              <div className="text-[10px] font-bold text-teal-400 flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                <span>Xem Toàn Bộ Log</span>
                <span>→</span>
              </div>
            </button>

            <button
              onClick={() => {
                openAdminDashboard('players');
                soundManager.playButtonClick();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 mb-2 group-hover:scale-105 transition-transform">
                  <Users size={16} />
                </div>
                <div className="text-xs font-bold text-white">Quản Lý Người Chơi</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sửa ELO, ban/unban, xu</div>
              </div>
              <div className="text-[10px] font-bold text-cyan-400 flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                <span>Tra Cứu & Xử Lý</span>
                <span>→</span>
              </div>
            </button>

            <button
              onClick={() => {
                openAdminDashboard('broadcast');
                soundManager.playButtonClick();
              }}
              className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-yellow-500/30 hover:border-yellow-400 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30 mb-2 group-hover:scale-105 transition-transform">
                  <Sparkles size={16} />
                </div>
                <div className="text-xs font-bold text-white">Phát Sóng Thông Báo</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bản vá & quà toàn server</div>
              </div>
              <div className="text-[10px] font-bold text-yellow-400 flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                <span>Gửi Thông Báo</span>
                <span>→</span>
              </div>
            </button>
          </div>

          {/* Embedded Live Audit Trail Feed */}
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-teal-400" />
                <span>Nhật Ký Thao Tác Người Chơi Trực Tiếp (Live Audit Feed)</span>
              </h4>

              {/* Filter chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'role_granted', label: 'Cấp quyền' },
                  { id: 'login', label: 'Đăng nhập' },
                  { id: 'match_played', label: 'Trận đấu' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setLogFilter(f.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      logFilter === f.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto no-scrollbar">
              {recentLogs
                .filter(l => logFilter === 'all' || l.action === logFilter)
                .slice(0, 6)
                .map(log => {
                  const isRole = log.action === 'role_granted' || log.action === 'role_revoked';
                  return (
                    <div key={log.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                              isRole
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : log.action === 'login'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {log.actionLabel}
                          </span>
                          <strong className="text-white truncate">{log.userName}</strong>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {log.details}
                        </p>
                      </div>

                      <button
                        onClick={() => openAdminDashboard('audit_logs')}
                        className="text-[10px] font-semibold text-amber-400 hover:underline shrink-0 pt-0.5"
                      >
                        Chi tiết
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

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
