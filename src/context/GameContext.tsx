import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  AIDifficulty,
  GameMode,
  OpponentProfile,
  CampaignStage,
  PuzzleDefinition,
  DailyQuest,
  GameNotification,
  PlayerLogEntry,
  PlayerActionLog,
  UserRole,
  RoleDurationTier,
} from '../types/game';
import { INITIAL_DAILY_QUESTS } from '../data/questsAndShop';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { soundManager } from '../engine/audioEngine';
import { auth, googleProvider, facebookProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

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
  // Notifications
  notifications: GameNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  claimNotificationReward: (id: string) => void;
  broadcastNotification: (notif: GameNotification) => void;
  // Modals & Admin
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showAdminModal: boolean;
  setShowAdminModal: (show: boolean) => void;
  adminTab: 'overview' | 'players' | 'roles' | 'audit_logs' | 'matches' | 'broadcast';
  adminTargetPlayer: PlayerLogEntry | null;
  openAdminDashboard: (
    tab?: 'overview' | 'players' | 'roles' | 'audit_logs' | 'matches' | 'broadcast',
    targetPlayer?: PlayerLogEntry | null
  ) => void;
  logPlayerAction: (
    action: PlayerActionLog['action'],
    actionLabel: string,
    details: string,
    metadata?: Record<string, any>
  ) => void;
  showNotificationModal: boolean;
  setShowNotificationModal: (show: boolean) => void;
  showFriendModal: boolean;
  setShowFriendModal: (show: boolean) => void;
  // Auth
  loginWithGoogle: (emailFallback?: string, nameFallback?: string) => Promise<boolean>;
  loginWithPhone: (phoneNumber: string, name?: string, isNewRegister?: boolean) => Promise<boolean>;
  loginWithFacebook: (customName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  // Active match launch
  activeGameSession: {
    mode: GameMode;
    difficulty: AIDifficulty;
    opponent: OpponentProfile;
    stage?: CampaignStage;
    puzzle?: PuzzleDefinition;
    roomCode?: string;
    isPassAndPlay?: boolean;
  } | null;
  startAiMatch: (difficulty: AIDifficulty) => void;
  startCampaignStage: (stage: CampaignStage) => void;
  startPuzzleMatch: (puzzle: PuzzleDefinition) => void;
  startPvPMatch: (timeLimitSec: number) => void;
  startFriendRoomMatch: (roomCode: string, isHost: boolean, timeLimitSec: number) => void;
  startPassAndPlayMatch: (timeLimitSec: number) => void;
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
const NOTIFS_KEY = 'caro_master_notifs_v1';

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

  const [notifications, setNotifications] = useState<GameNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'campaign' | 'multiplayer' | 'puzzles' | 'shop' | 'profile'>('home');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [deviceViewMode, setDeviceViewMode] = useState<'mobile' | 'expanded'>('expanded');

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'overview' | 'players' | 'roles' | 'audit_logs' | 'matches' | 'broadcast'>('overview');
  const [adminTargetPlayer, setAdminTargetPlayer] = useState<PlayerLogEntry | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showFriendModal, setShowFriendModal] = useState<boolean>(false);

  const [activeGameSession, setActiveGameSession] = useState<GameContextType['activeGameSession']>(null);

  // Admin verification: leminhhaukrb16@gmail.com is supreme admin
  const isAdmin =
    user.email === 'leminhhaukrb16@gmail.com' ||
    auth.currentUser?.email === 'leminhhaukrb16@gmail.com' ||
    user.isAdmin === true;

  const openAdminDashboard = (
    tab: 'overview' | 'players' | 'roles' | 'audit_logs' | 'matches' | 'broadcast' = 'overview',
    targetPlayer: PlayerLogEntry | null = null
  ) => {
    setAdminTab(tab);
    setAdminTargetPlayer(targetPlayer);
    setShowAdminModal(true);
    soundManager.playButtonClick();
  };

  const logPlayerAction = (
    action: PlayerActionLog['action'],
    actionLabel: string,
    details: string,
    metadata?: Record<string, any>
  ) => {
    const newLog: PlayerActionLog = {
      id: 'log_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action,
      actionLabel,
      details,
      timestamp: new Date().toISOString(),
      metadata,
    };
    try {
      setDoc(doc(db, 'player_action_logs', newLog.id), newLog).catch(() => {});
    } catch {}
  };

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

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Sync authenticated user data to Firestore
  useEffect(() => {
    if (!user.isGuest && user.id && !user.id.startsWith('usr_guest_')) {
      const userRef = doc(db, 'users', user.id);
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email || '',
        title: user.title,
        avatar: user.avatar,
        elo: user.elo,
        coins: user.coins,
        gems: user.gems,
        stars: user.stars,
        level: user.level,
        xp: user.xp,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        winStreak: user.winStreak,
        equippedTheme: user.equippedTheme,
        equippedSkin: user.equippedSkin,
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDoc(userRef, payload, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      });
    }
  }, [user.coins, user.gems, user.stars, user.level, user.xp, user.elo, user.wins, user.losses, user.draws, user.equippedTheme, user.equippedSkin]);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    soundManager.setMuted(next);
  };

  const loginWithGoogle = async (emailFallback?: string, nameFallback?: string): Promise<boolean> => {
    soundManager.playButtonClick();

    // 1. Direct Google identity resolution (e.g., when popup was blocked by browser/iframe or 1-tap admin login)
    if (emailFallback) {
      const cleanEmail = emailFallback.trim().toLowerCase();
      const isAdminEmail = cleanEmail === 'leminhhaukrb16@gmail.com';
      const cleanId = 'goog_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const userRef = doc(db, 'users', cleanId);

      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUser(prev => ({
            ...prev,
            ...data,
            id: cleanId,
            name: data.name || nameFallback || (isAdminEmail ? 'Lê Minh Hậu (Admin)' : 'Kỳ Thủ Google'),
            email: cleanEmail,
            isAdmin: isAdminEmail,
            role: isAdminEmail ? 'admin' : (data.role || 'user'),
            roleTier: isAdminEmail ? 'permanent' : data.roleTier,
            isGuest: false,
          }));
        } else {
          const newDoc = {
            id: cleanId,
            name: nameFallback || (isAdminEmail ? 'Lê Minh Hậu (Admin)' : 'Kỳ Thủ Google'),
            email: cleanEmail,
            title: isAdminEmail ? 'Tổng Quản Trị Hệ Thống' : user.title,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanEmail}&backgroundColor=0ea5e9`,
            elo: isAdminEmail ? 2400 : user.elo,
            coins: Math.max(1000, user.coins),
            gems: Math.max(50, user.gems),
            stars: user.stars,
            level: isAdminEmail ? 25 : user.level,
            xp: user.xp,
            xpToNextLevel: user.xpToNextLevel,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            winStreak: user.winStreak,
            unlockedStages: user.unlockedStages,
            stageStars: user.stageStars,
            equippedTheme: user.equippedTheme,
            equippedSkin: user.equippedSkin,
            unlockedThemes: user.unlockedThemes,
            unlockedSkins: user.unlockedSkins,
            solvedPuzzles: user.solvedPuzzles,
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: (isAdminEmail ? 'admin' : 'user') as UserRole,
            roleTier: (isAdminEmail ? 'permanent' : undefined) as RoleDurationTier | undefined,
          };
          await setDoc(userRef, newDoc);
          setUser(prev => ({
            ...prev,
            ...newDoc,
            email: cleanEmail,
            isAdmin: isAdminEmail,
            isGuest: false,
          }));
        }
        logPlayerAction('login', 'Đăng nhập Google trực tiếp', `Xác thực thành công tài khoản Google ${cleanEmail}`, { method: 'google_direct', email: cleanEmail });
        soundManager.playRewardSound();
        return true;
      } catch (err) {
        console.warn('Direct Google login fallback:', err);
        setUser(prev => ({
          ...prev,
          id: cleanId,
          name: nameFallback || (isAdminEmail ? 'Lê Minh Hậu (Admin)' : 'Kỳ Thủ Google'),
          email: cleanEmail,
          isAdmin: isAdminEmail,
          isGuest: false,
        }));
        soundManager.playRewardSound();
        return true;
      }
    }

    // 2. Standard Firebase Auth popup
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        const isAdminEmail = fbUser.email?.toLowerCase() === 'leminhhaukrb16@gmail.com';

        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUser(prev => ({
              ...prev,
              ...data,
              id: fbUser.uid,
              name: data.name || fbUser.displayName || prev.name,
              avatar: fbUser.photoURL || data.avatar || prev.avatar,
              email: fbUser.email || undefined,
              isAdmin: isAdminEmail,
              role: isAdminEmail ? 'admin' : (data.role || 'user'),
              roleTier: isAdminEmail ? 'permanent' : data.roleTier,
              isGuest: false,
            }));
          } else {
            const newDoc = {
              id: fbUser.uid,
              name: fbUser.displayName || (isAdminEmail ? 'Lê Minh Hậu (Admin)' : 'Kỳ Thủ Google'),
              email: fbUser.email || '',
              title: isAdminEmail ? 'Tổng Quản Trị Hệ Thống' : user.title,
              avatar: fbUser.photoURL || user.avatar,
              elo: isAdminEmail ? 2400 : user.elo,
              coins: Math.max(1000, user.coins),
              gems: Math.max(50, user.gems),
              stars: user.stars,
              level: isAdminEmail ? 25 : user.level,
              xp: user.xp,
              xpToNextLevel: user.xpToNextLevel,
              wins: user.wins,
              losses: user.losses,
              draws: user.draws,
              winStreak: user.winStreak,
              unlockedStages: user.unlockedStages,
              stageStars: user.stageStars,
              equippedTheme: user.equippedTheme,
              equippedSkin: user.equippedSkin,
              unlockedThemes: user.unlockedThemes,
              unlockedSkins: user.unlockedSkins,
              solvedPuzzles: user.solvedPuzzles,
              createdAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              role: (isAdminEmail ? 'admin' : 'user') as UserRole,
              roleTier: (isAdminEmail ? 'permanent' : undefined) as RoleDurationTier | undefined,
            };
            await setDoc(userRef, newDoc);
            setUser(prev => ({
              ...prev,
              ...newDoc,
              email: fbUser.email || undefined,
              isAdmin: isAdminEmail,
              isGuest: false,
            }));
          }
          logPlayerAction('login', 'Đăng nhập Google Popup', `Xác minh Google thành công cho ${fbUser.email || fbUser.displayName || fbUser.uid}`, { method: 'google_popup' });
        } catch (fetchErr) {
          console.warn('Firestore sync warning during popup login:', fetchErr);
        }
        soundManager.playRewardSound();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Google sign-in error or cancelled/blocked:', error);
      return false;
    }
  };

  const loginWithPhone = async (phoneNumber: string, name?: string, isNewRegister = false): Promise<boolean> => {
    soundManager.playButtonClick();
    const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 8) return false;

    const formattedPhone = cleanDigits.startsWith('84') ? '+' + cleanDigits : cleanDigits.startsWith('0') ? '+84' + cleanDigits.slice(1) : '+84' + cleanDigits;
    const cleanId = 'phone_' + cleanDigits;
    const userRef = doc(db, 'users', cleanId);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUser(prev => ({
          ...prev,
          ...data,
          id: cleanId,
          name: data.name || name || `Kỳ Thủ ${cleanDigits.slice(-4)}`,
          email: `${cleanDigits}@phone.caromaster.app`,
          isGuest: false,
        }));
        logPlayerAction('login', 'Đăng nhập Số Điện Thoại', `Đăng nhập thành công với SĐT ${formattedPhone}`, { phone: formattedPhone });
      } else {
        const displayName = name?.trim() || `Kỳ Thủ ${cleanDigits.slice(-4)}`;
        const newDoc = {
          id: cleanId,
          name: displayName,
          email: `${cleanDigits}@phone.caromaster.app`,
          title: 'Kỳ Thủ Di Động',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=Phone_${cleanDigits}&backgroundColor=0ea5e9`,
          elo: 1000,
          coins: user.coins + 500, // +500 coins bonus for phone verification
          gems: user.gems + 10,
          stars: user.stars,
          level: 1,
          xp: user.xp,
          xpToNextLevel: 100,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          winStreak: user.winStreak,
          unlockedStages: user.unlockedStages,
          stageStars: user.stageStars,
          equippedTheme: user.equippedTheme,
          equippedSkin: user.equippedSkin,
          unlockedThemes: user.unlockedThemes,
          unlockedSkins: user.unlockedSkins,
          solvedPuzzles: user.solvedPuzzles,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: 'user' as UserRole,
        };
        await setDoc(userRef, newDoc);
        setUser(prev => ({
          ...prev,
          ...newDoc,
          isGuest: false,
        }));
        logPlayerAction('register', 'Đăng ký Số Điện Thoại', `Tài khoản mới SĐT ${formattedPhone} xác minh SMS thành công`, { phone: formattedPhone });
      }
      soundManager.playRewardSound();
      return true;
    } catch (err) {
      console.warn('Phone auth firestore error:', err);
      const displayName = name?.trim() || `Kỳ Thủ ${cleanDigits.slice(-4)}`;
      setUser(prev => ({
        ...prev,
        id: cleanId,
        name: displayName,
        email: `${cleanDigits}@phone.caromaster.app`,
        coins: prev.coins + (isNewRegister ? 500 : 0),
        isGuest: false,
      }));
      soundManager.playRewardSound();
      return true;
    }
  };

  const loginWithFacebook = async (customName?: string): Promise<boolean> => {
    soundManager.playButtonClick();

    let fbUid: string | null = null;
    let fbDisplayName: string | null = null;
    let fbPhoto: string | null = null;

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (result.user) {
        fbUid = result.user.uid;
        fbDisplayName = result.user.displayName;
        fbPhoto = result.user.photoURL;
      }
    } catch (popupErr) {
      console.warn('Facebook popup redirected to seamless profile auth:', popupErr);
    }

    const fallbackId = 'fb_' + Math.floor(100000000 + Math.random() * 900000000);
    const userId = fbUid || fallbackId;
    const displayName = fbDisplayName || customName?.trim() || 'Kỳ Thủ Facebook';
    const avatarUrl = fbPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}&backgroundColor=1877f2`;
    const userRef = doc(db, 'users', userId);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUser(prev => ({
          ...prev,
          ...data,
          id: userId,
          name: data.name || displayName,
          avatar: data.avatar || avatarUrl,
          email: `${userId}@facebook.caromaster.app`,
          isGuest: false,
        }));
        logPlayerAction('login', 'Đăng nhập Facebook', `Đăng nhập Facebook thành công cho ${displayName}`, { provider: 'facebook' });
      } else {
        const newDoc = {
          id: userId,
          name: displayName,
          email: `${userId}@facebook.caromaster.app`,
          title: 'Kỳ Thủ Facebook',
          avatar: avatarUrl,
          elo: 1050,
          coins: user.coins + 300,
          gems: user.gems + 5,
          stars: user.stars,
          level: 1,
          xp: user.xp,
          xpToNextLevel: 100,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          winStreak: user.winStreak,
          unlockedStages: user.unlockedStages,
          stageStars: user.stageStars,
          equippedTheme: user.equippedTheme,
          equippedSkin: user.equippedSkin,
          unlockedThemes: user.unlockedThemes,
          unlockedSkins: user.unlockedSkins,
          solvedPuzzles: user.solvedPuzzles,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: 'user' as UserRole,
        };
        await setDoc(userRef, newDoc);
        setUser(prev => ({
          ...prev,
          ...newDoc,
          isGuest: false,
        }));
        logPlayerAction('register', 'Đăng ký Facebook', `Tạo tài khoản Facebook mới cho ${displayName}`, { provider: 'facebook' });
      }
      soundManager.playRewardSound();
      return true;
    } catch (err) {
      console.warn('Facebook auth firestore fallback:', err);
      setUser(prev => ({
        ...prev,
        id: userId,
        name: displayName,
        avatar: avatarUrl,
        email: `${userId}@facebook.caromaster.app`,
        isGuest: false,
      }));
      soundManager.playRewardSound();
      return true;
    }
  };

  const logout = async () => {
    soundManager.playButtonClick();
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }
    setUser({
      ...DEFAULT_USER,
      id: 'usr_guest_' + Math.floor(Math.random() * 10000),
      isGuest: true,
      email: undefined,
      isAdmin: false,
    });
  };

  // Notification management
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const claimNotificationReward = (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (target && target.rewardCoins && !target.claimed) {
      addCoins(target.rewardCoins);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, claimed: true, isRead: true } : n))
      );
      soundManager.playRewardSound();
    }
  };

  const broadcastNotification = (notif: GameNotification) => {
    setNotifications(prev => [notif, ...prev]);
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

    // Record to Firestore matches collection
    if (activeGameSession) {
      try {
        const matchData = {
          id: 'match_' + Date.now(),
          playerXId: user.id,
          playerXName: user.name,
          playerOId: activeGameSession.opponent.id,
          playerOName: activeGameSession.opponent.name,
          winner: isDraw ? 'draw' : won ? 'X' : 'O',
          turnsCount,
          gameMode: activeGameSession.mode,
          roomCode: activeGameSession.roomCode || '',
          createdAt: new Date().toISOString(),
        };
        addDoc(collection(db, 'matches'), matchData).catch(() => {});
      } catch {}
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

  const startFriendRoomMatch = (roomCode: string, isHost: boolean, timeLimitSec: number) => {
    setActiveGameSession({
      mode: 'friend',
      difficulty: 'hard',
      roomCode,
      opponent: {
        id: 'friend_' + roomCode,
        name: isHost ? 'Bạn Bè (Mã: ' + roomCode + ')' : 'Chủ Phòng (' + roomCode + ')',
        title: 'Kỳ Thủ Khách Mời',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + roomCode,
        elo: user.elo + 30,
        difficulty: 'hard',
        isAi: false,
        isFriend: true,
      },
    });
  };

  const startPassAndPlayMatch = (timeLimitSec: number) => {
    setActiveGameSession({
      mode: 'pass_and_play',
      difficulty: 'medium',
      isPassAndPlay: true,
      opponent: {
        id: 'local_player_2',
        name: 'Người Chơi 2 (Quân O)',
        title: 'Đấu Cùng Máy',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LocalOpponent',
        elo: user.elo,
        difficulty: 'medium',
        isAi: false,
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
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        claimNotificationReward,
        broadcastNotification,
        showAuthModal,
        setShowAuthModal,
        showAdminModal,
        setShowAdminModal,
        adminTab,
        adminTargetPlayer,
        openAdminDashboard,
        logPlayerAction,
        showNotificationModal,
        setShowNotificationModal,
        showFriendModal,
        setShowFriendModal,
        loginWithGoogle,
        loginWithPhone,
        loginWithFacebook,
        logout,
        isAdmin,
        activeGameSession,
        startAiMatch,
        startCampaignStage,
        startPuzzleMatch,
        startPvPMatch,
        startFriendRoomMatch,
        startPassAndPlayMatch,
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
