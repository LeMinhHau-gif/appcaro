import React, { useState, useEffect } from 'react';
import { PlayerLogEntry, AdminMatchLog, GameNotification, PlayerActionLog, UserRole, RoleDurationTier } from '../../types/game';
import {
  X,
  Crown,
  Users,
  Swords,
  Bell,
  BarChart3,
  Search,
  Shield,
  ShieldAlert,
  Coins,
  Gem,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Send,
  Calendar,
  AlertTriangle,
  History,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { INITIAL_DEMO_ACTION_LOGS } from '../../data/demoActionLogs';

interface AdminDashboardModalProps {
  onClose: () => void;
  onBroadcastNotification: (notif: GameNotification) => void;
  initialTab?: 'overview' | 'players' | 'roles' | 'audit_logs' | 'matches' | 'broadcast';
  initialPlayerForRole?: PlayerLogEntry | null;
}

// Seeded real-time player mock list with role delegations and durations
const INITIAL_DEMO_PLAYERS: PlayerLogEntry[] = [
  {
    id: 'usr_leminhhau',
    name: 'Lê Minh Hậu (Admin)',
    email: 'leminhhaukrb16@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminBoss&backgroundColor=eab308',
    elo: 2950,
    level: 35,
    coins: 15000,
    gems: 250,
    wins: 142,
    losses: 8,
    draws: 3,
    winStreak: 19,
    status: 'active',
    role: 'admin',
    roleTier: 'permanent',
    roleExpiresAt: 'lifetime',
    roleGrantedAt: '2026-10-01T08:00:00Z',
    roleGrantedBy: 'Hệ thống Quản Trị Tối Cao',
    createdAt: '2026-10-01T08:00:00Z',
    lastActiveAt: '2026-10-23T22:30:00Z',
  },
  {
    id: 'usr_kythanh_hn',
    name: 'Trần Văn Long (KỳThánh_HàNội)',
    email: 'longtran.caro@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KyThanhHN',
    elo: 2840,
    level: 28,
    coins: 8400,
    gems: 80,
    wins: 95,
    losses: 14,
    draws: 5,
    winStreak: 8,
    status: 'active',
    role: 'vip',
    roleTier: '6_months',
    roleExpiresAt: '2027-04-23T22:35:00Z',
    roleGrantedAt: '2026-10-23T22:35:00Z',
    roleGrantedBy: 'leminhhaukrb16@gmail.com',
    createdAt: '2026-10-05T10:00:00Z',
    lastActiveAt: '2026-10-23T22:15:00Z',
  },
  {
    id: 'usr_sontung_sg',
    name: 'Nguyễn Sơn Tùng',
    email: 'sontung.hcm@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SonTungCaro',
    elo: 2790,
    level: 25,
    coins: 6200,
    gems: 50,
    wins: 82,
    losses: 18,
    draws: 2,
    winStreak: 4,
    status: 'active',
    role: 'pro',
    roleTier: '3_months',
    roleExpiresAt: '2027-01-23T22:25:00Z',
    roleGrantedAt: '2026-10-23T22:25:00Z',
    roleGrantedBy: 'leminhhaukrb16@gmail.com',
    createdAt: '2026-10-08T14:30:00Z',
    lastActiveAt: '2026-10-23T21:40:00Z',
  },
  {
    id: 'usr_tiachop_dn',
    name: 'Hoàng Minh Đan',
    email: 'minhdan.blitz@yahoo.com',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TiaChopDN',
    elo: 2650,
    level: 21,
    coins: 4100,
    gems: 35,
    wins: 68,
    losses: 22,
    draws: 4,
    winStreak: 3,
    status: 'active',
    role: 'moderator',
    roleTier: '1_month',
    roleExpiresAt: '2026-11-23T20:10:00Z',
    roleGrantedAt: '2026-10-23T20:10:00Z',
    roleGrantedBy: 'leminhhaukrb16@gmail.com',
    createdAt: '2026-10-12T09:20:00Z',
    lastActiveAt: '2026-10-23T20:10:00Z',
  },
  {
    id: 'usr_spammer_bot',
    name: 'AutoClick_Hack_99',
    email: 'suspicious_bot@tempmail.com',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=HackerBot',
    elo: 1100,
    level: 2,
    coins: 200,
    gems: 0,
    wins: 2,
    losses: 15,
    draws: 0,
    winStreak: 0,
    status: 'banned',
    role: 'user',
    createdAt: '2026-10-20T11:00:00Z',
    lastActiveAt: '2026-10-21T03:00:00Z',
  },
];

const INITIAL_DEMO_MATCHES: AdminMatchLog[] = [
  {
    id: 'match_901',
    playerXId: 'usr_leminhhau',
    playerXName: 'Lê Minh Hậu',
    playerOId: 'ai_grandmaster',
    playerOName: 'AI Thần Sầu',
    winner: 'X',
    turnsCount: 22,
    gameMode: 'AI Match (Grandmaster)',
    createdAt: '2026-10-23T22:20:00Z',
  },
  {
    id: 'match_902',
    playerXId: 'usr_kythanh_hn',
    playerXName: 'Trần Văn Long',
    playerOId: 'usr_sontung_sg',
    playerOName: 'Nguyễn Sơn Tùng',
    winner: 'X',
    turnsCount: 34,
    gameMode: 'PvP Xếp Hạng ELO',
    createdAt: '2026-10-23T22:10:00Z',
  },
  {
    id: 'match_903',
    playerXId: 'usr_sontung_sg',
    playerXName: 'Nguyễn Sơn Tùng',
    playerOId: 'usr_tiachop_dn',
    playerOName: 'Hoàng Minh Đan',
    winner: 'O',
    turnsCount: 18,
    gameMode: 'Đấu Bạn Bè (CARO-889)',
    roomCode: 'CARO-889',
    createdAt: '2026-10-23T21:35:00Z',
  },
  {
    id: 'match_904',
    playerXId: 'usr_tiachop_dn',
    playerXName: 'Hoàng Minh Đan',
    playerOId: 'ai_hard',
    playerOName: 'AI Cao Thủ',
    winner: 'X',
    turnsCount: 26,
    gameMode: 'Chiến Dịch Ải 38',
    createdAt: '2026-10-23T20:05:00Z',
  },
];

// Helper to calculate expiration date
export const calculateExpirationDate = (tier: RoleDurationTier): { dateString: string; label: string } => {
  if (tier === 'permanent') {
    return { dateString: 'lifetime', label: 'Vĩnh viễn (Trọn đời)' };
  }
  const days = tier === '1_month' ? 30 : tier === '3_months' ? 90 : tier === '6_months' ? 180 : 365;
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return {
    dateString: expiry.toISOString(),
    label: expiry.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  onBroadcastNotification,
  initialTab = 'overview',
  initialPlayerForRole = null,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'roles' | 'audit_logs' | 'matches' | 'broadcast'>(initialTab);
  const [players, setPlayers] = useState<PlayerLogEntry[]>(INITIAL_DEMO_PLAYERS);
  const [matches, setMatches] = useState<AdminMatchLog[]>(INITIAL_DEMO_MATCHES);
  const [actionLogs, setActionLogs] = useState<PlayerActionLog[]>(INITIAL_DEMO_ACTION_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logFilterAction, setLogFilterAction] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Role Delegation Modal State
  const [showRoleModal, setShowRoleModal] = useState<boolean>(Boolean(initialPlayerForRole));
  const [selectedPlayerForRole, setSelectedPlayerForRole] = useState<PlayerLogEntry | null>(initialPlayerForRole || null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('vip');
  const [selectedDurationTier, setSelectedDurationTier] = useState<RoleDurationTier>('3_months');
  const [roleReason, setRoleReason] = useState<string>('');
  const [roleSuccessMessage, setRoleSuccessMessage] = useState<string | null>(null);

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastType, setBroadcastType] = useState<'update' | 'event' | 'reward' | 'system'>('update');
  const [broadcastVersion, setBroadcastVersion] = useState('v2.7.0');
  const [broadcastCoins, setBroadcastCoins] = useState<number>(100);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  useEffect(() => {
    fetchFirestoreData();
  }, []);

  const fetchFirestoreData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      if (!usersSnap.empty) {
        const fetched: PlayerLogEntry[] = [];
        usersSnap.forEach(d => {
          const data = d.data();
          fetched.push({
            id: d.id,
            name: data.name || 'Kỳ Thủ ' + d.id.slice(0, 4),
            email: data.email || 'guest@caromaster.ai',
            avatar: data.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + d.id,
            elo: data.elo || 1000,
            level: data.level || 1,
            coins: data.coins || 0,
            gems: data.gems || 0,
            wins: data.wins || 0,
            losses: data.losses || 0,
            draws: data.draws || 0,
            winStreak: data.winStreak || 0,
            status: data.status === 'banned' ? 'banned' : 'active',
            role: data.role || 'user',
            roleTier: data.roleTier,
            roleExpiresAt: data.roleExpiresAt,
            roleGrantedAt: data.roleGrantedAt,
            roleGrantedBy: data.roleGrantedBy,
            createdAt: data.createdAt || new Date().toISOString(),
            lastActiveAt: data.lastActiveAt || data.updatedAt || new Date().toISOString(),
          });
        });
        if (fetched.length > 0) {
          setPlayers([...fetched, ...INITIAL_DEMO_PLAYERS.filter(p => !fetched.some(f => f.id === p.id))]);
        }
      }

      // 2. Fetch player action audit logs
      try {
        const logsSnap = await getDocs(collection(db, 'player_action_logs'));
        if (!logsSnap.empty) {
          const fetchedLogs: PlayerActionLog[] = [];
          logsSnap.forEach(d => {
            const data = d.data();
            fetchedLogs.push({
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
          if (fetchedLogs.length > 0) {
            setActionLogs([...fetchedLogs, ...INITIAL_DEMO_ACTION_LOGS.filter(l => !fetchedLogs.some(f => f.id === l.id))]);
          }
        }
      } catch (logErr) {
        console.warn('Audit logs fetch notice:', logErr);
      }
    } catch (err) {
      console.warn('Admin fetching Firestore data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (playerId: string) => {
    soundManager.playButtonClick();
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === playerId) {
          const newStatus = p.status === 'active' ? 'banned' : 'active';
          try {
            updateDoc(doc(db, 'users', playerId), { status: newStatus }).catch(() => {});
          } catch {}

          // Create audit log
          const newLog: PlayerActionLog = {
            id: 'log_ban_' + Date.now(),
            userId: p.id,
            userName: p.name,
            userEmail: p.email,
            action: newStatus === 'banned' ? 'account_banned' : 'account_unbanned',
            actionLabel: newStatus === 'banned' ? 'Khóa Tài Khoản' : 'Mở Khóa Tài Khoản',
            details: `Quản trị viên đã ${newStatus === 'banned' ? 'khóa' : 'mở khóa'} tài khoản người chơi`,
            timestamp: new Date().toISOString(),
          };
          setActionLogs(logs => [newLog, ...logs]);
          try {
            setDoc(doc(db, 'player_action_logs', newLog.id), newLog).catch(() => {});
          } catch {}

          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const handleGrantReward = (playerId: string, coinsAdd: number, gemsAdd: number) => {
    soundManager.playRewardSound();
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === playerId) {
          const updated = {
            ...p,
            coins: p.coins + coinsAdd,
            gems: p.gems + gemsAdd,
          };
          try {
            updateDoc(doc(db, 'users', playerId), {
              coins: updated.coins,
              gems: updated.gems,
            }).catch(() => {});
          } catch {}

          // Record action log
          const newLog: PlayerActionLog = {
            id: 'log_coin_' + Date.now(),
            userId: p.id,
            userName: p.name,
            userEmail: p.email,
            action: 'coins_granted',
            actionLabel: 'Thưởng Xu / Ngọc',
            details: `Quản trị viên tặng thưởng +${coinsAdd} Xu & +${gemsAdd} Ngọc`,
            timestamp: new Date().toISOString(),
          };
          setActionLogs(logs => [newLog, ...logs]);
          try {
            setDoc(doc(db, 'player_action_logs', newLog.id), newLog).catch(() => {});
          } catch {}

          return updated;
        }
        return p;
      })
    );
  };

  const handleAdjustElo = (playerId: string, delta: number) => {
    soundManager.playButtonClick();
    setPlayers(prev =>
      prev.map(p => {
        if (p.id === playerId) {
          const updated = { ...p, elo: Math.max(500, p.elo + delta) };
          try {
            updateDoc(doc(db, 'users', playerId), { elo: updated.elo }).catch(() => {});
          } catch {}
          return updated;
        }
        return p;
      })
    );
  };

  // Submit Grant Role / Privilege
  const handleConfirmGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerForRole) return;

    soundManager.playRewardSound();
    const expiryData = calculateExpirationDate(selectedDurationTier);
    const roleNames: Record<UserRole, string> = {
      user: 'Người Chơi Thường',
      vip: 'Kỳ Thủ VIP (Toàn quyền Skin & AI Hint)',
      pro: 'Vé Cao Thủ PRO (Mở khóa 50 ải)',
      moderator: 'Phó Quản Trị (Moderator)',
      admin: 'Quản Trị Viên (Admin)',
    };
    const tierNames: Record<RoleDurationTier, string> = {
      '1_month': '1 Tháng (30 ngày)',
      '3_months': '3 Tháng (90 ngày)',
      '6_months': '6 Tháng (180 ngày)',
      '12_months': '12 Tháng (365 ngày)',
      permanent: 'Vĩnh viễn (Trọn đời)',
    };

    const isRevoke = selectedRole === 'user';
    const rolePayload = {
      role: selectedRole,
      roleTier: isRevoke ? undefined : selectedDurationTier,
      roleExpiresAt: isRevoke ? undefined : expiryData.dateString,
      roleGrantedAt: new Date().toISOString(),
      roleGrantedBy: auth.currentUser?.email || 'leminhhaukrb16@gmail.com',
    };

    // Update local state
    setPlayers(prev =>
      prev.map(p => (p.id === selectedPlayerForRole.id ? { ...p, ...rolePayload } : p))
    );

    // Sync to Firestore
    try {
      await updateDoc(doc(db, 'users', selectedPlayerForRole.id), rolePayload);
    } catch (err) {
      console.warn('Update user role error in Firestore:', err);
    }

    // Write audit log to Firestore
    const newLog: PlayerActionLog = {
      id: 'log_role_' + Date.now(),
      userId: selectedPlayerForRole.id,
      userName: selectedPlayerForRole.name,
      userEmail: selectedPlayerForRole.email,
      action: isRevoke ? 'role_revoked' : 'role_granted',
      actionLabel: isRevoke ? 'Thu Hồi Quyền' : `Cấp Quyền ${selectedRole.toUpperCase()}`,
      details: isRevoke
        ? `Quản trị viên đã thu hồi quyền đặc biệt về Người chơi thường`
        : `Quản trị viên đã cấp quyền: ${roleNames[selectedRole]} · Hạn mức: ${tierNames[selectedDurationTier]}${
            roleReason.trim() ? ` · Lý do: ${roleReason.trim()}` : ''
          }`,
      timestamp: new Date().toISOString(),
      metadata: {
        role: selectedRole,
        tier: selectedDurationTier,
        expiresAt: expiryData.dateString,
        reason: roleReason.trim(),
      },
    };

    setActionLogs(prev => [newLog, ...prev]);
    try {
      await setDoc(doc(db, 'player_action_logs', newLog.id), newLog);
    } catch (err) {
      console.warn('Save action log error:', err);
    }

    setRoleSuccessMessage(
      isRevoke
        ? `Đã thu hồi đặc quyền của ${selectedPlayerForRole.name} thành công!`
        : `Đã cấp quyền ${roleNames[selectedRole]} (${tierNames[selectedDurationTier]}) cho ${selectedPlayerForRole.name} thành công!`
    );

    setTimeout(() => {
      setRoleSuccessMessage(null);
      setShowRoleModal(false);
      setRoleReason('');
    }, 2000);
  };

  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) return;

    soundManager.playRewardSound();
    const newNotif: GameNotification = {
      id: 'notif_' + Date.now(),
      title: broadcastTitle.trim(),
      content: broadcastContent.trim(),
      type: broadcastType,
      version: broadcastVersion.trim() || undefined,
      timestamp: new Date().toISOString(),
      isPinned: true,
      rewardCoins: broadcastCoins > 0 ? broadcastCoins : undefined,
      isRead: false,
      claimed: false,
    };

    try {
      await setDoc(doc(db, 'system_notifications', newNotif.id), newNotif);
    } catch (err) {
      console.warn('Broadcast save Firestore:', err);
    }

    // Also record audit log
    const auditLog: PlayerActionLog = {
      id: 'log_notif_' + Date.now(),
      userId: 'admin_broadcast',
      userName: 'Quản Trị Viên',
      action: 'role_granted',
      actionLabel: 'Phát Thông Báo',
      details: `Đã phát thông báo toàn server: "${broadcastTitle.trim()}" (Tặng ${broadcastCoins} Xu)`,
      timestamp: new Date().toISOString(),
    };
    setActionLogs(logs => [auditLog, ...logs]);

    onBroadcastNotification(newNotif);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastTitle('');
      setBroadcastContent('');
    }, 2500);
  };

  const filteredPlayers = players.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const privilegedPlayers = players.filter(p => p.role && p.role !== 'user');

  const filteredLogs = actionLogs.filter(log => {
    const matchesQuery =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesQuery) return false;
    if (logFilterAction === 'all') return true;
    return log.action === logFilterAction;
  });

  const totalRegistered = players.length;
  const activeToday = players.filter(p => p.status === 'active').length;
  const totalMatchesCount = matches.length + 185;
  const averageElo = Math.round(players.reduce((sum, p) => sum + p.elo, 0) / (players.length || 1));

  // Role Badges renderer
  const renderRoleBadge = (role?: UserRole, expiresAt?: string, tier?: RoleDurationTier) => {
    if (!role || role === 'user') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          Người chơi
        </span>
      );
    }
    const isPermanent = expiresAt === 'lifetime' || tier === 'permanent';
    let label = 'VIP';
    let style = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

    if (role === 'admin') {
      label = '👑 Admin';
      style = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 shadow-sm shadow-yellow-500/20';
    } else if (role === 'moderator') {
      label = '🛡️ Mod';
      style = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    } else if (role === 'pro') {
      label = '⚡ Pro';
      style = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    } else if (role === 'vip') {
      label = '🌟 VIP';
      style = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }

    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style} border`}>
          {label}
        </span>
        <span className="text-[9px] font-mono text-slate-400">
          {isPermanent ? '(Vĩnh viễn)' : tier ? `(${tier.replace('_', ' ')})` : ''}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.18)] overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
              <Crown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Quản Trị Viên & Kiểm Soát Database
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Dành Riêng Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Email quản trị tối cao: <strong className="text-amber-400 font-mono">leminhhaukrb16@gmail.com</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng bảng quản trị"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 bg-slate-950/70 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Tổng Quan Hệ Thống', icon: BarChart3 },
            { id: 'players', label: `Người Chơi (${players.length})`, icon: Users },
            { id: 'roles', label: `Phân Quyền & Cấp Hạn (${privilegedPlayers.length})`, icon: Shield },
            { id: 'audit_logs', label: `Lịch Sử Thao Tác (${actionLogs.length})`, icon: History },
            { id: 'matches', label: `Trận Đấu (${matches.length})`, icon: Swords },
            { id: 'broadcast', label: 'Phát Thông Báo', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  soundManager.playButtonClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-black'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={fetchFirestoreData}
            disabled={isLoading}
            className="ml-auto p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 shrink-0"
            title="Làm mới dữ liệu từ Firestore"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-amber-400' : ''} />
            <span className="hidden sm:inline">Làm Mới</span>
          </button>
        </div>

        {/* Tab 1: System Overview */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Tổng Người Đăng Ký
                </div>
                <div className="text-xl font-black font-mono text-cyan-400 tabular-nums mt-1">
                  {totalRegistered}
                </div>
                <div className="text-[10px] text-teal-400 mt-0.5">Xác minh Google & ID</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Tài Khoản Phân Quyền
                </div>
                <div className="text-xl font-black font-mono text-amber-400 tabular-nums mt-1">
                  {privilegedPlayers.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">VIP, Pro, Mod, Admin</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Thao Tác Đã Ghi Nhận
                </div>
                <div className="text-xl font-black font-mono text-teal-400 tabular-nums mt-1">
                  {actionLogs.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Audit Trail đầy đủ</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  ELO Trung Bình
                </div>
                <div className="text-xl font-black font-mono text-rose-400 tabular-nums mt-1">
                  {averageElo}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Toàn hệ thống</div>
              </div>
            </div>

            {/* Role Distribution Summary */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield size={15} className="text-amber-400" />
                  <span>Phân Phối Cấp Bậc & Hạn Mức Quyền Hạn</span>
                </span>
                <button
                  onClick={() => setActiveTab('roles')}
                  className="text-amber-400 hover:underline text-[11px] normal-case"
                >
                  Xem danh sách chi tiết & cấp quyền →
                </button>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">🌟 Kỳ Thủ VIP</div>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {players.filter(p => p.role === 'vip').length} người
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Free Skin + AI Hint</div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="text-[10px] text-cyan-300 font-semibold uppercase">⚡ Vé Cao Thủ Pro</div>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {players.filter(p => p.role === 'pro').length} người
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mở khóa 50 ải chiến dịch</div>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-[10px] text-purple-300 font-semibold uppercase">🛡️ Phó Quản Trị (Mod)</div>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {players.filter(p => p.role === 'moderator').length} người
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kiểm duyệt ván đấu</div>
                </div>

                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-[10px] text-yellow-300 font-semibold uppercase">👑 Quản Trị Viên</div>
                  <div className="text-lg font-black font-mono text-white mt-0.5">
                    {players.filter(p => p.role === 'admin').length} người
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Toàn quyền Database</div>
                </div>
              </div>
            </div>

            {/* Quick Security & Firestore Status */}
            <div className="rounded-2xl bg-slate-950/50 border border-slate-800 p-4 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-teal-400" />
                <span>Trạng Thái Kết Nối & Bảo Mật Cơ Sở Dữ Liệu</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Database: <code className="text-teal-300 font-mono">ai-studio-caromasteraiccar-a8e9f02e-83f6-48b6-8723-faed29337b6d</code>
                <br />
                Chính sách bảo mật: <strong className="text-amber-400">Zero-Trust ABAC Security Rules</strong> đã triển khai thành công. Chỉ duy nhất email quản trị viên <code className="text-amber-300">leminhhaukrb16@gmail.com</code> có quyền phân quyền, sửa đổi dữ liệu người chơi, và quản lý toàn bộ thao tác lịch sử.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Player Management */}
        {activeTab === 'players' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
            {/* Search filter input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo Tên, Email hoặc Mã Kỳ Thủ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Players Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    <th className="p-3">Kỳ Thủ</th>
                    <th className="p-3">Email Liên Kết</th>
                    <th className="p-3">Cấp Quyền / Hạn</th>
                    <th className="p-3">Cấp & ELO</th>
                    <th className="p-3">Xu / Ngọc</th>
                    <th className="p-3">Vào Chơi Gần Nhất</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Phân Quyền & Xử Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPlayers.map((player) => {
                    const isBanned = player.status === 'banned';

                    return (
                      <tr key={player.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-7 h-7 rounded-full bg-slate-800 object-cover border border-slate-700"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-100 truncate max-w-[120px]">
                                {player.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500 truncate max-w-[90px]">
                                {player.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-slate-300 text-[11px]">
                          {player.email || <span className="text-slate-600">Khách</span>}
                        </td>

                        <td className="p-3">
                          {renderRoleBadge(player.role, player.roleExpiresAt, player.roleTier)}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-cyan-400 font-mono">{player.elo} ELO</div>
                          <div className="text-[10px] text-slate-400 font-mono">Lv.{player.level}</div>
                        </td>

                        <td className="p-3">
                          <div className="font-mono text-amber-400 font-semibold">{player.coins} Xu</div>
                          <div className="text-[10px] font-mono text-rose-400">{player.gems} Ngọc</div>
                        </td>

                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {new Date(player.lastActiveAt).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isBanned
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                            }`}
                          >
                            {isBanned ? 'Bị Khóa' : 'Hoạt Động'}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Role Delegation Button */}
                            <button
                              onClick={() => {
                                setSelectedPlayerForRole(player);
                                setSelectedRole(player.role && player.role !== 'user' ? player.role : 'vip');
                                setSelectedDurationTier(player.roleTier || '3_months');
                                setShowRoleModal(true);
                                soundManager.playButtonClick();
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 shadow-sm"
                              title="Phân quyền & Cấp hạn mức (1/3/6/12 tháng / vĩnh viễn)"
                            >
                              <Shield size={12} />
                              <span>Cấp Quyền</span>
                            </button>

                            {/* Gift Coins */}
                            <button
                              onClick={() => handleGrantReward(player.id, 500, 5)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-mono font-bold"
                              title="Tặng 500 Xu & 5 Ngọc"
                            >
                              +500 Xu
                            </button>

                            {/* Ban / Unban */}
                            <button
                              onClick={() => handleToggleBan(player.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isBanned
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              }`}
                              title={isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {isBanned ? <Unlock size={12} /> : <Lock size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Role Delegation & Tier Management */}
        {activeTab === 'roles' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 p-4 rounded-2xl border border-amber-500/30">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" />
                  <span>Hệ Thống Phân Quyền & Cấp Hạn Mức Kỳ Thủ</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quản trị viên có thể cấp quyền Kỳ Thủ VIP, Vé Cao Thủ Pro, Phó Quản Trị hoặc Admin với hạn mức: <strong>1 tháng, 3 tháng, 6 tháng, 12 tháng hoặc vĩnh viễn</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedPlayerForRole(players[0] || null);
                  setSelectedRole('vip');
                  setSelectedDurationTier('3_months');
                  setShowRoleModal(true);
                  soundManager.playButtonClick();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20 hover:scale-105 transition-transform"
              >
                <Plus size={15} />
                <span>Cấp Quyền Cho Tài Khoản Mới</span>
              </button>
            </div>

            {/* Privileged Accounts Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    <th className="p-3">Tài Khoản</th>
                    <th className="p-3">Chức Vụ / Quyền Hạn</th>
                    <th className="p-3">Hạn Mức Thời Gian</th>
                    <th className="p-3">Ngày Hết Hạn</th>
                    <th className="p-3">Người Cấp & Ngày Cấp</th>
                    <th className="p-3 text-right">Điều Chỉnh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {privilegedPlayers.map(player => {
                    const isPermanent = player.roleExpiresAt === 'lifetime' || player.roleTier === 'permanent';
                    const isExpired = !isPermanent && player.roleExpiresAt && new Date(player.roleExpiresAt).getTime() < Date.now();

                    const daysLeft = !isPermanent && player.roleExpiresAt
                      ? Math.ceil((new Date(player.roleExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <tr key={player.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={player.avatar}
                              alt={player.name}
                              className="w-8 h-8 rounded-xl bg-slate-800 object-cover border border-amber-500/30"
                            />
                            <div>
                              <div className="font-bold text-white">{player.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">{player.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          {renderRoleBadge(player.role, player.roleExpiresAt, player.roleTier)}
                        </td>

                        <td className="p-3">
                          <span className="font-mono text-xs font-semibold text-amber-300">
                            {player.roleTier === '1_month'
                              ? '1 Tháng (30 ngày)'
                              : player.roleTier === '3_months'
                              ? '3 Tháng (90 ngày)'
                              : player.roleTier === '6_months'
                              ? '6 Tháng (180 ngày)'
                              : player.roleTier === '12_months'
                              ? '12 Tháng (365 ngày)'
                              : 'Vĩnh viễn (Trọn đời)'}
                          </span>
                        </td>

                        <td className="p-3">
                          {isPermanent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              ♾️ Không giới hạn
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              Đã hết hạn
                            </span>
                          ) : (
                            <div className="font-mono text-[11px]">
                              <span className="text-slate-200">
                                {player.roleExpiresAt && new Date(player.roleExpiresAt).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="ml-1 text-[10px] text-teal-400 font-bold">
                                (Còn {daysLeft} ngày)
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-[11px] text-slate-400 font-mono">
                          <div>Cấp bởi: {player.roleGrantedBy || 'Admin'}</div>
                          <div className="text-[10px] text-slate-500">
                            {player.roleGrantedAt && new Date(player.roleGrantedAt).toLocaleDateString('vi-VN')}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPlayerForRole(player);
                              setSelectedRole(player.role || 'vip');
                              setSelectedDurationTier(player.roleTier || '3_months');
                              setShowRoleModal(true);
                              soundManager.playButtonClick();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold border border-slate-700"
                          >
                            Gia Hạn / Sửa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Player Action History / Audit Logs */}
        {activeTab === 'audit_logs' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <History size={17} className="text-teal-400" />
                  <span>Quản Lý Toàn Bộ Thao Tác Lịch Sử Của Người Chơi</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ghi nhận đầy đủ thao tác: Đăng nhập, Trận đấu, Cấp quyền hạn mức, Đổi tên, Mua vật phẩm...
                </p>
              </div>

              {/* Action Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={logFilterAction}
                  onChange={(e) => setLogFilterAction(e.target.value)}
                  className="h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="all">Tất cả thao tác</option>
                  <option value="role_granted">Cấp quyền hạn mức</option>
                  <option value="role_revoked">Thu hồi quyền</option>
                  <option value="login">Đăng nhập / Vào chơi</option>
                  <option value="match_played">Trận đấu ván cờ</option>
                  <option value="coins_granted">Thưởng / Nạp xu</option>
                  <option value="account_banned">Khóa tài khoản</option>
                  <option value="puzzle_solved">Giải thế cờ</option>
                  <option value="item_purchased">Mua trang phục</option>
                </select>
              </div>
            </div>

            {/* Search in logs */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Lọc lịch sử theo tên kỳ thủ, email, hoặc chi tiết thao tác..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    <th className="p-3">Thời Gian</th>
                    <th className="p-3">Kỳ Thủ Thao Tác</th>
                    <th className="p-3">Loại Thao Tác</th>
                    <th className="p-3">Nội Dung Chi Tiết Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map(log => {
                    const isRole = log.action === 'role_granted' || log.action === 'role_revoked';
                    const isBan = log.action === 'account_banned';

                    return (
                      <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-white truncate max-w-[140px]">{log.userName}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                            {log.userEmail || log.userId}
                          </div>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isRole
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isBan
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : log.action === 'match_played'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {log.actionLabel}
                          </span>
                        </td>

                        <td className="p-3 text-slate-300 text-xs leading-relaxed">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Match Activity Logs */}
        {activeTab === 'matches' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nhật Ký Các Ván Đấu Gần Nhất Trên Hệ Thống
            </h4>

            {matches.map(m => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-mono text-[10px]">
                    {m.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{m.playerXName} (X)</span>
                      <span className="text-slate-600 font-mono font-bold">VS</span>
                      <span className="font-bold text-rose-400">{m.playerOName} (O)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Chế độ: <strong className="text-slate-200">{m.gameMode}</strong> · {m.turnsCount} nước đi
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-bold text-[10px] uppercase">
                    Thắng: Quân {m.winner}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Broadcast Notifications */}
        {activeTab === 'broadcast' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <form onSubmit={handlePublishBroadcast} className="flex flex-col gap-3 max-w-xl mx-auto">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>
                  Thông báo bạn phát sẽ hiển thị trực tiếp trong Trung tâm thông báo của toàn bộ người chơi khi họ mở ứng dụng.
                </span>
              </div>

              {broadcastSuccess && (
                <div className="p-3 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Đã phát thông báo thành công lên toàn hệ thống!</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Tiêu Đề Thông Báo
                </label>
                <input
                  type="text"
                  placeholder="VD: Cập nhật phiên bản v2.8.0 - Ra mắt giải đấu..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Loại Thông Báo
                  </label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="update">🚀 Cập Nhật Game (Update)</option>
                    <option value="event">🏆 Sự Kiện & Mùa Giải</option>
                    <option value="reward">🎁 Quà Tặng & Phúc Lợi</option>
                    <option value="system">⚙️ Hệ Thống & Bảo Trì</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    Phiên Bản (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="v2.7.0"
                    value={broadcastVersion}
                    onChange={(e) => setBroadcastVersion(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Phần Thưởng Xu Đính Kèm (0 nếu không có)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={broadcastCoins}
                  onChange={(e) => setBroadcastCoins(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Nội Dung Thông Báo Chi Tiết
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung thông báo bản vá, các điểm mới, lời chúc đến kỳ thủ..."
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all mt-2"
              >
                <Send size={15} />
                <span>Phát Thông Báo Cho Toàn Bộ Kỳ Thủ</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Quyền hạn tối cao: Quản trị viên hệ thống</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* SUB-MODAL: GRANT ROLE / PRIVILEGE & DURATION TIERS */}
        {showRoleModal && selectedPlayerForRole && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-lg shadow-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Phân Quyền & Cấp Hạn Mức Kỳ Thủ</h4>
                    <p className="text-[11px] text-slate-400">Quản trị viên ủy quyền đặc quyền</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Target Player Info */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <img
                  src={selectedPlayerForRole.avatar}
                  alt={selectedPlayerForRole.name}
                  className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-amber-500/40"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate text-xs sm:text-sm">
                    {selectedPlayerForRole.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {selectedPlayerForRole.email || selectedPlayerForRole.id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-400">{selectedPlayerForRole.elo} ELO</div>
                  <div className="text-[10px] text-slate-500">Lv.{selectedPlayerForRole.level}</div>
                </div>
              </div>

              {roleSuccessMessage && (
                <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{roleSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleConfirmGrantRole} className="flex flex-col gap-3.5">
                {/* Select Role */}
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1.5">
                    1. Chọn Cấp Bậc / Quyền Hạn
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'vip',
                        name: '🌟 Kỳ Thủ VIP',
                        desc: 'Free mọi Theme/Skin, AI hint vô hạn, x2 XP',
                        border: 'hover:border-amber-400',
                      },
                      {
                        id: 'pro',
                        name: '⚡ Vé Cao Thủ PRO',
                        desc: 'Mở khóa 50 ải chiến dịch, giải đố',
                        border: 'hover:border-cyan-400',
                      },
                      {
                        id: 'moderator',
                        name: '🛡️ Phó Quản Trị (Mod)',
                        desc: 'Kiểm duyệt trận, thông báo',
                        border: 'hover:border-purple-400',
                      },
                      {
                        id: 'admin',
                        name: '👑 Quản Trị Viên (Admin)',
                        desc: 'Toàn quyền Database & Hệ thống',
                        border: 'hover:border-yellow-400',
                      },
                    ].map(r => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => setSelectedRole(r.id as UserRole)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 ' + r.border
                          }`}
                        >
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{r.name}</span>
                            {isSelected && <Check size={13} className="text-amber-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{r.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Select Duration Tier */}
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1.5">
                    2. Chọn Hạn Mức Thời Gian Cấp Quyền
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {[
                      { id: '1_month', label: '1 Tháng', days: '30 ngày' },
                      { id: '3_months', label: '3 Tháng', days: '90 ngày' },
                      { id: '6_months', label: '6 Tháng', days: '180 ngày' },
                      { id: '12_months', label: '12 Tháng', days: '365 ngày' },
                      { id: 'permanent', label: 'Vĩnh Viễn', days: 'Trọn đời' },
                    ].map(t => {
                      const isSelected = selectedDurationTier === t.id;
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setSelectedDurationTier(t.id as RoleDurationTier)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="text-xs font-bold">{t.label}</div>
                          <div className={`text-[9px] ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                            {t.days}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calculated Expiry Preview */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-400" />
                    <span>Dự kiến hết hạn:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {calculateExpirationDate(selectedDurationTier).label}
                  </span>
                </div>

                {/* Reason Note */}
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1">
                    3. Ghi Chú / Lý Do Cấp Quyền (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Quán quân giải Caro mùa 1, Đóng góp cộng đồng..."
                    value={roleReason}
                    onChange={(e) => setRoleReason(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 size={15} />
                    <span>Xác Nhận Cấp Quyền</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('user');
                      handleConfirmGrantRole({ preventDefault: () => {} } as any);
                    }}
                    className="px-3 h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
                    title="Hủy toàn bộ quyền đặc biệt của người này"
                  >
                    Thu Hồi Quyền
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
