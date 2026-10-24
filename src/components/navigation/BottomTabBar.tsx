import React from 'react';
import { Home, Compass, Swords, BrainCircuit, ShoppingBag, User } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, quests, activeGameSession } = useGame();

  // If in an active game match, don't show the bottom tab bar to maximize board real-estate
  if (activeGameSession) return null;

  const hasUnclaimedQuest = quests.some(q => q.isCompleted && !q.isClaimed);

  const tabs = [
    { id: 'home', label: 'Trang Chủ', icon: Home },
    { id: 'campaign', label: 'Chiến Dịch', icon: Compass },
    { id: 'multiplayer', label: 'Đấu ELO', icon: Swords },
    { id: 'puzzles', label: 'Giải Đố', icon: BrainCircuit },
    { id: 'shop', label: 'Cửa Hàng', icon: ShoppingBag },
    { id: 'profile', label: 'Cá Nhân', icon: User, badge: hasUnclaimedQuest },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                soundManager.playButtonClick();
              }}
              className={`relative flex flex-col items-center justify-center py-1 transition-all group ${
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
                {'badge' in tab && tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-900" />
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 truncate ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
