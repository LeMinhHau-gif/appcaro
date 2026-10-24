import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CAMPAIGN_REALMS, ALL_CAMPAIGN_STAGES } from '../../data/campaignStages';
import { CampaignStage } from '../../types/game';
import { Star, Lock, Play, Compass, Award, Coins, Gem, ArrowLeft, ChevronRight } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

export const CampaignScreen: React.FC = () => {
  const { user, startCampaignStage, setActiveTab } = useGame();
  const [activeRealmId, setActiveRealmId] = useState<number>(() => {
    const highestUnlocked = Math.max(...user.unlockedStages, 1);
    return Math.min(5, Math.floor((highestUnlocked - 1) / 10) + 1);
  });
  const [selectedStage, setSelectedStage] = useState<CampaignStage | null>(null);

  const currentRealm = CAMPAIGN_REALMS.find(r => r.id === activeRealmId) || CAMPAIGN_REALMS[0];
  const realmStages = ALL_CAMPAIGN_STAGES.filter(
    s => s.stageNumber >= currentRealm.stageRange[0] && s.stageNumber <= currentRealm.stageRange[1]
  );

  const handleStageClick = (stage: CampaignStage) => {
    const isUnlocked = user.unlockedStages.includes(stage.id);
    if (!isUnlocked) return;
    soundManager.playButtonClick();
    setSelectedStage(stage);
  };

  const handleLaunchStage = () => {
    if (!selectedStage) return;
    soundManager.playButtonClick();
    startCampaignStage(selectedStage);
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 max-w-4xl mx-auto pb-24">
      {/* Realm Map Header */}
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
              <Compass size={20} className="text-teal-400" />
              <span>Bản Đồ Kỳ Đạo (50 Ải)</span>
            </h2>
            <p className="text-xs text-slate-400">Vượt qua các kỳ thủ huyền thoại để thống nhất kỳ đạo</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-2xl text-amber-300">
          <Star size={15} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold font-mono tabular-nums">{user.stars} / 150</span>
        </div>
      </div>

      {/* Realm Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CAMPAIGN_REALMS.map((realm) => {
          const isSelected = realm.id === activeRealmId;
          const isRealmUnlocked = user.unlockedStages.some(
            s => s >= realm.stageRange[0] && s <= realm.stageRange[1]
          );

          return (
            <button
              key={realm.id}
              onClick={() => {
                setActiveRealmId(realm.id);
                soundManager.playButtonClick();
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20'
                  : isRealmUnlocked
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <span>{realm.id}. {realm.name}</span>
              {!isRealmUnlocked && <Lock size={12} className="text-slate-600" />}
            </button>
          );
        })}
      </div>

      {/* Realm Banner Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 p-4 sm:p-5 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            Cõi Thứ {currentRealm.id}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{currentRealm.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Ải {currentRealm.stageRange[0]} đến ải {currentRealm.stageRange[1]}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Award size={24} />
        </div>
      </div>

      {/* Stages Grid (Saga Map layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {realmStages.map((stage) => {
          const isUnlocked = user.unlockedStages.includes(stage.id);
          const stars = user.stageStars[stage.id] || 0;
          const isHighestUnlocked = stage.id === Math.max(...user.unlockedStages);
          const isBoss = stage.stageNumber % 10 === 0;

          return (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage)}
              disabled={!isUnlocked}
              className={`relative rounded-3xl p-3.5 border transition-all text-left flex flex-col justify-between min-h-[125px] ${
                !isUnlocked
                  ? 'bg-slate-950/50 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                  : isHighestUnlocked
                  ? 'bg-gradient-to-b from-teal-950/60 to-slate-900 border-teal-400/80 shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/40 animate-pulse'
                  : isBoss
                  ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-850'
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                  #{stage.stageNumber}
                </span>

                {!isUnlocked ? (
                  <Lock size={14} className="text-slate-600" />
                ) : (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={11}
                        className={
                          starIdx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Opponent Info */}
              <div className="my-2">
                <div className="text-xs font-bold text-white truncate">{stage.opponent.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{stage.opponent.title}</div>
              </div>

              {/* Difficulty pill */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80">
                <span className="capitalize">{stage.difficulty}</span>
                <span className="text-amber-400">+{stage.rewardCoins} Xu</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Dialog Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedStage.opponent.avatar}
                alt={selectedStage.opponent.name}
                className="w-14 h-14 rounded-2xl bg-slate-800 border border-teal-500/40 object-cover"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                  Ải {selectedStage.stageNumber} · {selectedStage.realmName}
                </span>
                <h3 className="text-base font-bold text-white truncate">
                  {selectedStage.opponent.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedStage.opponent.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              {selectedStage.description}
            </p>

            {/* Target Star Conditions */}
            <div className="mb-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Điều Kiện Đoạt 3 Sao
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>Chiến thắng dưới {selectedStage.targetStars.threeStarsTurns} nước</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>Chiến thắng dưới {selectedStage.targetStars.twoStarsTurns} nước</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-around bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mb-5">
              <div className="flex items-center gap-1.5">
                <Coins size={16} className="text-amber-400" />
                <span className="text-xs font-bold font-mono text-amber-300">
                  +{selectedStage.rewardCoins} Xu
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award size={16} className="text-cyan-400" />
                <span className="text-xs font-bold font-mono text-cyan-300">
                  +{selectedStage.rewardXp} XP
                </span>
              </div>
              {selectedStage.rewardGems && (
                <div className="flex items-center gap-1.5">
                  <Gem size={15} className="text-rose-400" />
                  <span className="text-xs font-bold font-mono text-rose-300">
                    +{selectedStage.rewardGems} Ngọc
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedStage(null)}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLaunchStage}
                className="h-11 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
              >
                <Play size={15} className="fill-slate-950" />
                <span>Khiêu Chiến</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
