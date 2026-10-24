import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Swords, Trophy, Clock, Users, ArrowLeft, Zap, Shield, Flame } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  elo: number;
  winRate: number;
  title: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'KỳThánh_HàNội', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KyThanhHN', elo: 2840, winRate: 88, title: 'Đại Sư Tối Cao' },
  { rank: 2, name: 'SơnTùngCaro', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SonTungCaro', elo: 2790, winRate: 85, title: 'Kỳ Vương Sài Gòn' },
  { rank: 3, name: 'BấtBại_LongAn', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=BatBaiLA', elo: 2715, winRate: 82, title: 'Vô Địch Miền Tây' },
  { rank: 4, name: 'TiaChớp_ĐàNẵng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TiaChopDN', elo: 2650, winRate: 79, title: 'Kiếm Sư Blitz' },
  { rank: 5, name: 'BạchHổ_CầnThơ', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=BachHoCT', elo: 2580, winRate: 77, title: 'Đại Cao Thủ' },
  { rank: 6, name: 'HuyềnThoại_HảiPhòng', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HuyenThoaiHP', elo: 2520, winRate: 75, title: 'Đại Cao Thủ' },
  { rank: 7, name: 'TrúcLâm_BìnhDương', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TrucLamBD', elo: 2470, winRate: 73, title: 'Cao Thủ' },
  { rank: 8, name: 'ChiếnBinh_NghệAn', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChienBinhNA', elo: 2420, winRate: 71, title: 'Cao Thủ' },
];

export const MultiplayerScreen: React.FC = () => {
  const { user, startPvPMatch, setActiveTab } = useGame();
  const [blitzTime, setBlitzTime] = useState<number>(30);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);

  // Matchmaking queue timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchSeconds(prev => {
          if (prev >= 2) {
            // Found a match!
            setIsSearching(false);
            soundManager.playWinFanfare();
            startPvPMatch(blitzTime);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching, blitzTime, startPvPMatch]);

  const handleStartSearch = () => {
    soundManager.playButtonClick();
    setIsSearching(true);
    setSearchSeconds(0);
  };

  const handleCancelSearch = () => {
    soundManager.playButtonClick();
    setIsSearching(false);
  };

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
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Swords size={20} className="text-cyan-400" />
              <span>Đấu Trực Tuyến & Xếp Hạng ELO</span>
            </h2>
            <p className="text-xs text-slate-400">Ghép trận ngẫu nhiên dựa trên điểm ELO tương đương</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-2xl text-cyan-300">
          <Shield size={15} />
          <span className="text-xs font-bold font-mono tabular-nums">{user.elo} ELO</span>
        </div>
      </div>

      {/* Matchmaking Launcher Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#101b2b] to-[#091522] border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Matchmaking visual state */}
          {isSearching ? (
            <div className="py-6 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60" />
                <div className="absolute inset-2 rounded-full border border-teal-400 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Swords size={24} className="animate-spin" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Đang Tìm Đối Thủ...</h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">
                Tìm kiếm trong khoảng ELO {user.elo - 40} ~ {user.elo + 40} ({searchSeconds}s)
              </p>
              <button
                onClick={handleCancelSearch}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs border border-slate-700"
              >
                Hủy Tìm Kiếm
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 mb-3">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ghép Trận Nhanh (PvP)</h3>
              <p className="text-xs text-slate-300 max-w-sm mb-4">
                Chọn thời gian cho mỗi lượt đi và bấm bắt đầu để ghép đối thủ trực tuyến.
              </p>

              {/* Blitz Time Selectors */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-5">
                {[
                  { sec: 15, label: '15 Giây', desc: 'Siêu Tốc' },
                  { sec: 30, label: '30 Giây', desc: 'Tiêu Chuẩn' },
                  { sec: 60, label: '60 Giây', desc: 'Chiến Thuật' },
                ].map((item) => (
                  <button
                    key={item.sec}
                    onClick={() => {
                      setBlitzTime(item.sec);
                      soundManager.playButtonClick();
                    }}
                    className={`p-2.5 rounded-2xl border transition-all text-center ${
                      blitzTime === item.sec
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Start search CTA */}
              <button
                onClick={handleStartSearch}
                className="w-full sm:w-auto h-12 px-10 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Swords size={18} />
                <span>Tìm Trận Ngay ({blitzTime}s)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Bảng Xếp Hạng Cao Thủ Toàn Quốc</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Users size={13} />
            <span>Mùa Giải 2026</span>
          </span>
        </div>

        {/* Current user's standing banner */}
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded-lg">
              #42
            </span>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-cyan-400/50 bg-slate-800"
            />
            <div>
              <div className="text-xs font-bold text-white">{user.name} (Bạn)</div>
              <div className="text-[10px] text-slate-400">{user.title}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-cyan-400 tabular-nums">{user.elo} ELO</div>
            <div className="text-[10px] text-slate-400">{user.wins} Thắng</div>
          </div>
        </div>

        {/* Top 8 entries */}
        <div className="flex flex-col gap-1.5">
          {MOCK_LEADERBOARD.map((item) => {
            const isTop3 = item.rank <= 3;
            const rankBadgeColor =
              item.rank === 1
                ? 'text-amber-400 bg-amber-500/20 border-amber-500/40'
                : item.rank === 2
                ? 'text-slate-300 bg-slate-500/20 border-slate-500/40'
                : item.rank === 3
                ? 'text-amber-600 bg-amber-700/20 border-amber-700/40'
                : 'text-slate-400 bg-slate-800 border-slate-700';

            return (
              <div
                key={item.rank}
                className="p-2.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:bg-slate-950/80 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center border ${rankBadgeColor}`}
                  >
                    {item.rank}
                  </span>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.title}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                    {item.elo} ELO
                  </div>
                  <div className="text-[10px] font-mono text-teal-400">{item.winRate}% Thắng</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
