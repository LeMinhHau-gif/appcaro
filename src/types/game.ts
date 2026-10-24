export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardGrid = CellValue[][]; // 15x15

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'grandmaster';

export type GameMode = 'ai' | 'pvp' | 'campaign' | 'puzzle' | 'practice' | 'friend' | 'pass_and_play';

export interface Move {
  row: number;
  col: number;
  player: Player;
  timestamp?: number;
  evalScore?: number;
  comment?: string;
}

export interface WinningLine {
  cells: [number, number][];
  player: Player;
  direction: 'horizontal' | 'vertical' | 'diagonal-main' | 'diagonal-anti';
}

export interface OpponentProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  elo: number;
  difficulty: AIDifficulty;
  isAi: boolean;
  country?: string;
  isFriend?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  elo: number;
  coins: number;
  gems: number;
  stars: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  unlockedStages: number[];
  stageStars: Record<number, number>; // stageId -> 1..3
  equippedTheme: string;
  equippedSkin: string;
  unlockedThemes: string[];
  unlockedSkins: string[];
  solvedPuzzles: string[];
  lastSpinDate?: string;
  isGuest: boolean;
  email?: string;
  isAdmin?: boolean;
  lastActiveAt?: string;
}

export interface CampaignStage {
  id: number;
  realmId: number;
  realmName: string;
  stageNumber: number;
  title: string;
  description: string;
  opponent: OpponentProfile;
  difficulty: AIDifficulty;
  timeLimitSec: number;
  targetStars: {
    threeStarsTurns: number;
    twoStarsTurns: number;
  };
  rewardCoins: number;
  rewardXp: number;
  rewardGems?: number;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  playerColor: Player;
  objective: string; // e.g. "Thắng trong 2 nước", "Bẻ gãy bẫy 4 cờ đối thủ"
  initialBoard: { row: number; col: number; player: Player }[];
  winningSolution: { row: number; col: number }[]; // sequence of winning moves
  aiResponses?: { row: number; col: number }[]; // AI moves between player moves
  explanation: string;
  rewardCoins: number;
}

export interface BoardTheme {
  id: string;
  name: string;
  description: string;
  boardBg: string;
  gridLineColor: string;
  starPointColor: string;
  borderColor: string;
  previewColor: string;
  price: number;
  requiredStars?: number;
}

export interface StoneSkin {
  id: string;
  name: string;
  xColor: string;
  xGlow: string;
  oColor: string;
  oGlow: string;
  styleClass: string;
  price: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface BlunderAnalysisItem {
  moveNumber: number;
  move: Move;
  severity: 'blunder' | 'mistake' | 'inaccuracy' | 'brilliant' | 'good';
  evalDelta: number;
  description: string;
  betterMove?: { row: number; col: number };
}

export interface GameNotification {
  id: string;
  title: string;
  content: string;
  type: 'update' | 'event' | 'reward' | 'system';
  version?: string;
  isPinned?: boolean;
  timestamp: string;
  isRead?: boolean;
  rewardCoins?: number;
  claimed?: boolean;
}

export interface PlayerLogEntry {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  elo: number;
  level: number;
  coins: number;
  gems: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  status: 'active' | 'banned';
  createdAt: string;
  lastActiveAt: string;
}

export interface AdminMatchLog {
  id: string;
  playerXId: string;
  playerXName: string;
  playerOId: string;
  playerOName: string;
  winner: 'X' | 'O' | 'draw';
  turnsCount: number;
  gameMode: string;
  roomCode?: string;
  createdAt: string;
}
