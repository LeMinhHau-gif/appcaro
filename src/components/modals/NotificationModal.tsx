import React, { useState } from 'react';
import { GameNotification } from '../../types/game';
import { X, Bell, Sparkles, Gift, Check, ArrowRight, ShieldAlert, Calendar, CheckCheck } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';

interface NotificationModalProps {
  notifications: GameNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClaimReward: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClaimReward,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'update' | 'event' | 'reward' | 'system'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(notifications[0]?.id || null);

  const filtered = notifications.filter(
    n => filterType === 'all' || n.type === filterType
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeBadge = (type: GameNotification['type']) => {
    switch (type) {
      case 'update':
        return { label: 'Cập Nhật Game', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'event':
        return { label: 'Sự Kiện', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'reward':
        return { label: 'Quà Tặng', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'system':
      default:
        return { label: 'Hệ Thống', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Bell size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Thông Báo & Cập Nhật</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 text-[10px] font-black font-mono">
                    {unreadCount} Mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Tin tức phiên bản mới, quà tặng và sự kiện mùa giải</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  onMarkAllRead();
                  soundManager.playButtonClick();
                }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-teal-400 text-xs flex items-center gap-1 transition-colors"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter categories tabs */}
        <div className="flex items-center gap-1.5 p-2 px-4 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'update', label: 'Cập Nhật (Update)' },
            { id: 'event', label: 'Sự Kiện' },
            { id: 'reward', label: 'Quà Tặng' },
            { id: 'system', label: 'Hệ Thống' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id as any);
                soundManager.playButtonClick();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Không có thông báo nào trong danh mục này.
            </div>
          ) : (
            filtered.map(item => {
              const badge = getTypeBadge(item.type);
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setExpandedId(isExpanded ? null : item.id);
                    if (!item.isRead) onMarkRead(item.id);
                    soundManager.playButtonClick();
                  }}
                  className={`rounded-2xl border transition-all p-3.5 cursor-pointer ${
                    !item.isRead
                      ? 'bg-slate-950/90 border-teal-500/40 shadow-sm shadow-teal-500/5'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-950/70'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {item.version && (
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                          {item.version}
                        </span>
                      )}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 mb-1 leading-snug">
                    {item.title}
                  </h4>

                  {/* Body Content */}
                  <p
                    className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line ${
                      isExpanded ? '' : 'line-clamp-2'
                    }`}
                  >
                    {item.content}
                  </p>

                  {/* Reward Action if present */}
                  {item.rewardCoins && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold font-mono">
                        <Gift size={14} className="text-amber-400" />
                        <span>Phần Thưởng: +{item.rewardCoins} Xu</span>
                      </div>

                      {item.claimed ? (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Check size={12} />
                          Đã Nhận
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClaimReward(item.id);
                          }}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          Nhận Ngay
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Caro Master AI · Bản quyền 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
