import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AIDifficulty, GameMode, OpponentProfile, CampaignStage, PuzzleDefinition, DailyQuest } from '../types/game';
import { INITIAL_DAILY_QUESTS } from '../data/questsAndShop';
import { soundManager } from '../engine/audioEngine';

interface GameContextType {
  user: UserProfile;
  activeTab: 'home' | 'campaign' | 'multiplayer' | 'puzzles' | 'shop' | 'profile';
  setActiveTab: (tab: 'home' | 'campaign' | 'multiplayer' | 'puzzles' | 'shop' | 'profile') => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
  deviceViewMode: 'mobile' | 'expanded';
  setDeviceViewMode: (mode: 'mobile' | 'expanded') => void;
  quests: DailyQuest[];
  claimQuestReward: (questId: string) => void;
  recordQuestProgress: (questId: string, amount?: number) => void;
  // Active match launch
  activeGameSession: {
    mode: GameMode;
    difficulty: AIDifficulty;
    opponent: OpponentProfile;
    stage?: CampaignStage;
    puzzle?: PuzzleDefinition;
  } | null;
  startAiMatch: (difficulty: AIDifficulty) => void;
  startCampaignStage: (stage: CampaignStage) => void;
  startPuzzleMatch: (puzzle: PuzzleDefinition) => void;
  startPvPMatch: (timeLimitSec: number) => void;
  exitToHome: () => void;
  // Profile & Currency updates
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addXp: (amount: number) => void;
  recordMatchResult: (won: boolean, isDraw?: boolean, turnsCount?: number) => void;
  completeStage: (stageId: number, stars: number) => void;
  markPuzzleSolved: (puzzleId: string) => void;
  equipTheme: (themeId: string) => void;
  equipSkin: (skinId: string) => void;
  buyTheme: (themeId: string, price: number) => boolean;
  buySkin: (skinId: string, price: number) => boolean;
  updateUserAvatar: (avatarUrl: string, name: string) => void;
  loginUser: (method: 'google' | 'phone' | 'guest', credential?: string) => void;
}

const STORAGE_KEY = 'caro_master_user_v1';
const QUESTS_KEY = 'caro_master_quests_v1';

const DEFAULT_USER: UserProfile = {
  id: 'usr_guest_' + Math.floor(Math.random() * 10000),
  name: 'Kỳ Thủ Mới',
  title: 'Tập Sự Nhập Môn',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CaroPlayerMaster&backgroundColor=0ea5e9',
  elo: 1000,
  coins: 350,
  gems: 10,
  stars: 0,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  unlockedStages: [1],
  stageStars: {},
  equippedTheme: 'theme_neon',
  equippedSkin: 'skin_neon',
  unlockedThemes: ['theme_neon'],
  unlockedSkins: ['skin_neon'],
  solvedPuzzles: [],
  isGuest: true,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  const [quests, setQuests] = useState<DailyQuest[]>(() => {
    try {
      const saved = localStorage.getItem(QUESTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DAILY_QUESTS;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'campaign' | 'multiplayer' | 'puzzles' | 'shop' | 'profile'>('home');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [deviceViewMode, setDeviceViewMode] = useState<'mobile' | 'expanded'>('expanded');

  const [activeGameSession, setActiveGameSession] = useState<GameContextType['activeGameSession']>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
    } catch {}
  }, [quests]);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    soundManager.setMuted(next);
  };

  const addCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
    soundManager.playRewardSound();
  };

  const addGems = (amount: number) => {
    setUser(prev => ({ ...prev, gems: prev.gems + amount }));
    soundManager.playRewardSound();
  };

  const addXp = (amount: number) => {
    setUser(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNext = prev.xpToNextLevel;

      while (newXp >= newNext) {
        newXp -= newNext;
        newLevel++;
        newNext = Math.round(newNext * 1.35);
      }

      // Title progression based on level
      let title = prev.title;
      if (newLevel >= 20) title = 'Đại Sư Kỳ Thánh';
      else if (newLevel >= 15) title = 'Kỳ Vương Bất Bại';
      else if (newLevel >= 10) title = 'Đại Cao Thủ';
      else if (newLevel >= 6) title = 'Kỳ Thủ Xuất Chúng';
      else if (newLevel >= 3) title = 'Chiến Binh Bàn Cờ';

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newNext,
        title,
      };
    });
  };

  const recordMatchResult = (won: boolean, isDraw = false, turnsCount = 0) => {
    setUser(prev => {
      const eloDelta = isDraw ? 0 : won ? 25 : -18;
      const newElo = Math.max(500, prev.elo + eloDelta);
      const newWins = won ? prev.wins + 1 : prev.wins;
      const newLosses = (!won && !isDraw) ? prev.losses + 1 : prev.losses;
      const newDraws = isDraw ? prev.draws + 1 : prev.draws;
      const newStreak = won ? prev.winStreak + 1 : 0;

      return {
        ...prev,
        elo: newElo,
        wins: newWins,
        losses: newLosses,
        draws: newDraws,
        winStreak: newStreak,
      };
    });

    if (won) {
      recordQuestProgress('quest_win_match', 1);
    }
  };

  const completeStage = (stageId: number, stars: number) => {
    setUser(prev => {
      const currentStars = prev.stageStars[stageId] || 0;
      const updatedStarsMap = {
        ...prev.stageStars,
        [stageId]: Math.max(currentStars, stars),
      };

      const totalStars = Object.values(updatedStarsMap).reduce((a, b) => a + b, 0);
      const nextStage = stageId + 1;
      const unlocked = [...prev.unlockedStages];
      if (nextStage <= 50 && !unlocked.includes(nextStage)) {
        unlocked.push(nextStage);
      }

      return {
        ...prev,
        stageStars: updatedStarsMap,
        stars: totalStars,
        unlockedStages: unlocked,
      };
    });

    recordQuestProgress('quest_campaign', 1);
  };

  const markPuzzleSolved = (puzzleId: string) => {
    setUser(prev => {
      if (prev.solvedPuzzles.includes(puzzleId)) return prev;
      return {
        ...prev,
        solvedPuzzles: [...prev.solvedPuzzles, puzzleId],
      };
    });
    recordQuestProgress('quest_solve_puzzle', 1);
  };

  const equipTheme = (themeId: string) => {
    if (user.unlockedThemes.includes(themeId)) {
      setUser(prev => ({ ...prev, equippedTheme: themeId }));
      soundManager.playButtonClick();
    }
  };

  const equipSkin = (skinId: string) => {
    if (user.unlockedSkins.includes(skinId)) {
      setUser(prev => ({ ...prev, equippedSkin: skinId }));
      soundManager.playButtonClick();
    }
  };

  const buyTheme = (themeId: string, price: number): boolean => {
    if (user.coins >= price && !user.unlockedThemes.includes(themeId)) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins - price,
        unlockedThemes: [...prev.unlockedThemes, themeId],
        equippedTheme: themeId,
      }));
      soundManager.playRewardSound();
      return true;
    }
    return false;
  };

  const buySkin = (skinId: string, price: number): boolean => {
    if (user.coins >= price && !user.unlockedSkins.includes(skinId)) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins - price,
        unlockedSkins: [...prev.unlockedSkins, skinId],
        equippedSkin: skinId,
      }));
      soundManager.playRewardSound();
      return true;
    }
    return false;
  };

  const updateUserAvatar = (avatarUrl: string, name: string) => {
    setUser(prev => ({ ...prev, avatar: avatarUrl, name }));
  };

  const loginUser = (method: 'google' | 'phone' | 'guest', credential?: string) => {
    setUser(prev => ({
      ...prev,
      isGuest: method === 'guest',
      name: method === 'google' ? 'Kỳ Thủ Google' : method === 'phone' ? 'Kỳ Thủ ' + (credential?.slice(-4) || '8888') : prev.name,
    }));
  };

  const recordQuestProgress = (questId: string, amount = 1) => {
    setQuests(prev =>
      prev.map(q => {
        if (q.id === questId) {
          const nextProg = Math.min(q.maxProgress, q.progress + amount);
          return {
            ...q,
            progress: nextProg,
            isCompleted: nextProg >= q.maxProgress,
          };
        }
        return q;
      })
    );
  };

  const claimQuestReward = (questId: string) => {
    const q = quests.find(item => item.id === questId);
    if (q && q.isCompleted && !q.isClaimed) {
      addCoins(q.rewardCoins);
      setQuests(prev =>
        prev.map(item => (item.id === questId ? { ...item, isClaimed: true } : item))
      );
    }
  };

  // Launch matches
  const startAiMatch = (difficulty: AIDifficulty) => {
    const diffNames: Record<AIDifficulty, { name: string; title: string; elo: number }> = {
      easy: { name: 'AI Tập Sự', title: 'Thuật toán Minimax cơ bản', elo: 900 },
      medium: { name: 'AI Kỳ Thủ', title: 'Chặn 3-4 và tạo bẫy kép', elo: 1450 },
      hard: { name: 'AI Cao Thủ', title: 'Alpha-Beta Pruning 5 nước', elo: 1950 },
      grandmaster: { name: 'AI Thần Sầu', title: 'Quiescence Search & Bất Bại', elo: 2600 },
    };
    const info = diffNames[difficulty];
    setActiveGameSession({
      mode: 'ai',
      difficulty,
      opponent: {
        id: `ai_${difficulty}`,
        name: info.name,
        title: info.title,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=CaroAI_${difficulty}&backgroundColor=1e293b`,
        elo: info.elo,
        difficulty,
        isAi: true,
      },
    });
    recordQuestProgress('quest_ai_match', 1);
  };

  const startCampaignStage = (stage: CampaignStage) => {
    setActiveGameSession({
      mode: 'campaign',
      difficulty: stage.difficulty,
      opponent: stage.opponent,
      stage,
    });
  };

  const startPuzzleMatch = (puzzle: PuzzleDefinition) => {
    setActiveGameSession({
      mode: 'puzzle',
      difficulty: puzzle.difficulty === 'hard' ? 'hard' : 'medium',
      opponent: {
        id: `puzzle_ai_${puzzle.id}`,
        name: 'Trọng Tài Thế Cờ',
        title: 'Giám Khảo Gomoku',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CaroReferee&backgroundColor=0f172a',
        elo: 2200,
        difficulty: 'hard',
        isAi: true,
      },
      puzzle,
    });
  };

  const startPvPMatch = (timeLimitSec: number) => {
    // Simulated live online player matching
    const randomOpponents = [
      { name: 'KỳVương99', title: 'Chiến tướng Hà Nội', elo: user.elo + Math.floor(Math.random() * 80) - 40, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KỳVương99' },
      { name: 'SơnTùngCaro', title: 'Bất bại Sài Gòn', elo: user.elo + Math.floor(Math.random() * 60) - 30, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SonTungCaro' },
      { name: 'LinhĐan_07', title: 'Tia chớp Đà Nẵng', elo: user.elo + Math.floor(Math.random() * 50) - 20, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LinhDan' },
      { name: 'DragonMaster', title: 'Top 100 Toàn Quốc', elo: user.elo + Math.floor(Math.random() * 90) - 30, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DragonMaster' },
    ];
    const picked = randomOpponents[Math.floor(Math.random() * randomOpponents.length)];

    setActiveGameSession({
      mode: 'pvp',
      difficulty: 'hard',
      opponent: {
        id: 'pvp_' + Math.floor(Math.random() * 99999),
        name: picked.name,
        title: picked.title,
        avatar: picked.avatar,
        elo: picked.elo,
        difficulty: 'hard',
        isAi: false,
        country: 'VN',
      },
    });
  };

  const exitToHome = () => {
    setActiveGameSession(null);
  };

  return (
    <GameContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        isSoundMuted,
        toggleSound,
        deviceViewMode,
        setDeviceViewMode,
        quests,
        claimQuestReward,
        recordQuestProgress,
        activeGameSession,
        startAiMatch,
        startCampaignStage,
        startPuzzleMatch,
        startPvPMatch,
        exitToHome,
        addCoins,
        addGems,
        addXp,
        recordMatchResult,
        completeStage,
        markPuzzleSolved,
        equipTheme,
        equipSkin,
        buyTheme,
        buySkin,
        updateUserAvatar,
        loginUser,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
