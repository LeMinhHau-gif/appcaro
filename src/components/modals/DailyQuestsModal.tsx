import React from 'react';
import { X, Check, Award, Coins } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';

interface DailyQuestsModalProps {
  onClose: () => void;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({ onClose }) => {
  const { quests, claimQuestReward, user } = useGame();

  const completedCount = quests.filter(q => q.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 shadow-2xl flex flex-col relative max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Nhiệm Vụ Hàng Ngày</h3>
              <p className="text-xs text-slate-400">Hoàn thành để nhận thêm nhiều xu nâng cấp</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Overall progress indicator */}
        <div className="py-3">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span>Tiến độ hôm nay</span>
            <span className="font-mono font-bold text-teal-400">
              {completedCount} / {quests.length} Đạt
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${(completedCount / quests.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quests list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 my-2">
          {quests.map((quest) => {
            const isDone = quest.isCompleted;
            const isClaimed = quest.isClaimed;

            return (
              <div
                key={quest.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200">{quest.title}</span>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold flex items-center gap-0.5">
                      <Coins size={11} />
                      +{quest.rewardCoins}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{quest.description}</p>

                  {/* Progress bar inside row */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-teal-400"
                        style={{ width: `${Math.min(100, (quest.progress / quest.maxProgress) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                      {quest.progress}/{quest.maxProgress}
                    </span>
                  </div>
                </div>

                {/* Claim or Status button */}
                <div>
                  {isClaimed ? (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Check size={12} />
                      Đã nhận
                    </span>
                  ) : isDone ? (
                    <button
                      onClick={() => {
                        claimQuestReward(quest.id);
                        soundManager.playRewardSound();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all"
                    >
                      Nhận Xu
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
                      Chưa xong
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Số dư: <strong className="text-amber-400 font-mono">{user.coins} Xu</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
