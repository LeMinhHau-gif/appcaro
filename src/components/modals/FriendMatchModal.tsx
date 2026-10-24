import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Play,
  Smartphone,
  Globe,
  Share2,
  Mail,
  ExternalLink,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

interface FriendMatchModalProps {
  onClose: () => void;
  onStartRoomMatch: (roomCode: string, isHost: boolean, timeLimitSec: number) => void;
  onStartPassAndPlay: (timeLimitSec: number) => void;
  initialRoomCode?: string;
}

export const FriendMatchModal: React.FC<FriendMatchModalProps> = ({
  onClose,
  onStartRoomMatch,
  onStartPassAndPlay,
  initialRoomCode,
}) => {
  const [activeTab, setActiveTab] = useState<'online' | 'local'>('online');
  const [roomAction, setRoomAction] = useState<'create' | 'join'>(
    initialRoomCode ? 'join' : 'create'
  );

  const [generatedCode] = useState<string>(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CARO-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });

  const [inputCode, setInputCode] = useState<string>(initialRoomCode || '');
  const [turnTime, setTurnTime] = useState<number>(30);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Generate real invite link based on current domain and room code
  const getInviteUrl = (code: string) => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?room=${encodeURIComponent(code)}`;
    } catch {
      return `https://caromaster.app/?room=${code}`;
    }
  };

  const inviteUrl = getInviteUrl(generatedCode);
  const inviteMessage = `🎮 Vào so tài cờ Caro đỉnh cao với tôi nhé!\nMã phòng: ${generatedCode}\n👉 Bấm vào link để vào bàn cờ thi đấu ngay: ${inviteUrl}`;
  const emailSubject = `Lời mời so tài cờ Caro đỉnh cao - Mã phòng: ${generatedCode}`;
  const emailBody = `Xin chào bạn,\n\nTôi vừa tạo phòng thi đấu Cờ Caro (Gomoku) trên Caro Master AI!\n\nMã phòng của tôi: ${generatedCode}\n\n👉 Bấm vào liên kết này để vào bàn cờ thi đấu trực tiếp cùng tôi:\n${inviteUrl}\n\nHẹn gặp bạn trên bàn cờ nhé!`;

  // Clear feedback toast after 3 seconds
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  // Copy just room code
  const handleCopyCode = () => {
    soundManager.playButtonClick();
    navigator.clipboard.writeText(generatedCode);
    setCopyFeedback(`Đã sao chép mã phòng: ${generatedCode}`);
  };

  // Copy full invite link
  const handleCopyLink = () => {
    soundManager.playButtonClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopyFeedback('Đã sao chép liên kết phòng vào bộ nhớ tạm!');
  };

  // 1. Share via Zalo
  const handleShareZalo = () => {
    soundManager.playButtonClick();
    // Copy invite text for easy pasting
    navigator.clipboard.writeText(inviteMessage).catch(() => {});
    
    // Official Zalo share web intent
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(inviteUrl)}&title=${encodeURIComponent(`Thách đấu Cờ Caro - Mã phòng ${generatedCode}`)}`;
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    
    setCopyFeedback('Đã mở Zalo và sao chép nội dung lời mời thi đấu!');
  };

  // 2. Share via Facebook
  const handleShareFacebook = () => {
    soundManager.playButtonClick();
    navigator.clipboard.writeText(inviteMessage).catch(() => {});
    
    // Official Facebook sharer endpoint
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(inviteMessage)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
    
    setCopyFeedback('Đã mở Facebook và sao chép nội dung lời mời!');
  };

  // 3. Share via Email
  const handleShareEmail = () => {
    soundManager.playButtonClick();
    navigator.clipboard.writeText(emailBody).catch(() => {});
    
    // Standard mailto link
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    
    setCopyFeedback('Đang mở ứng dụng Email với thư mời soạn sẵn!');
  };

  // 4. Native / System Share
  const handleNativeShare = async () => {
    soundManager.playButtonClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Thách đấu Cờ Caro - Phòng ${generatedCode}`,
          text: `Vào so tài cờ Caro với tôi nhé! Mã phòng: ${generatedCode}`,
          url: inviteUrl,
        });
        setCopyFeedback('Đã chia sẻ thành công!');
        return;
      } catch (err) {
        // User cancelled or unsupported
      }
    }
    // Fallback: copy entire message
    navigator.clipboard.writeText(inviteMessage);
    setCopyFeedback('Đã sao chép toàn bộ tin nhắn lời mời!');
  };

  const handleCreateAndPlay = () => {
    soundManager.playButtonClick();
    onStartRoomMatch(generatedCode, true, turnTime);
    onClose();
  };

  const handleJoinAndPlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    soundManager.playButtonClick();
    onStartRoomMatch(inputCode.trim().toUpperCase(), false, turnTime);
    onClose();
  };

  const handleStartLocalMatch = () => {
    soundManager.playButtonClick();
    onStartPassAndPlay(turnTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Ambient background glows */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ghép Trận Với Bạn Bè</h3>
            <p className="text-xs text-slate-400">Thi đấu online qua mã phòng hoặc cùng chơi trên 1 máy</p>
          </div>
        </div>

        {/* Main Mode Tabs: Online Room vs Pass & Play */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-4">
          <button
            onClick={() => {
              setActiveTab('online');
              soundManager.playButtonClick();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'online'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe size={14} />
            <span>Đấu Online Qua Mã Phòng</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('local');
              soundManager.playButtonClick();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'local'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={14} />
            <span>Đấu 2 Người Trên Máy</span>
          </button>
        </div>

        {/* Online Room Content */}
        {activeTab === 'online' && (
          <div className="flex flex-col gap-3">
            {/* Create vs Join Sub-toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setRoomAction('create');
                  soundManager.playButtonClick();
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  roomAction === 'create'
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                Tạo Phòng Mới
              </button>
              <button
                onClick={() => {
                  setRoomAction('join');
                  soundManager.playButtonClick();
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  roomAction === 'join'
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-900'
                }`}
              >
                Nhập Mã Vào Phòng
              </button>
            </div>

            {/* Room Action: CREATE */}
            {roomAction === 'create' ? (
              <div className="flex flex-col gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                {/* Room Code Showcase */}
                <div className="text-center py-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Mã Phòng Thi Đấu Của Bạn
                  </span>
                  <div className="text-3xl font-mono font-black text-cyan-400 tracking-wider my-1 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                    {generatedCode}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Chia sẻ liên kết hoặc mã phòng dưới đây để mời bạn bè vào chơi
                  </p>
                </div>

                {/* Direct Link Preview & Copy Link Button */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 bg-transparent text-[11px] text-slate-300 font-mono truncate focus:outline-none"
                    title={inviteUrl}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold shrink-0 flex items-center gap-1 border border-slate-700 transition-colors"
                  >
                    <Copy size={12} />
                    <span>Sao Chép Link</span>
                  </button>
                </div>

                {/* Section: Share with other players via Zalo, Facebook, Email */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Share2 size={13} className="text-cyan-400" />
                      <span>Chia Sẻ Lời Mời Trực Tiếp Qua:</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-medium">Bấm để gửi ngay</span>
                  </div>

                  {/* 3 Dedicated Social Platforms: Zalo, Facebook, Email */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Zalo Share Button */}
                    <button
                      onClick={handleShareZalo}
                      className="py-2.5 px-2 rounded-xl bg-[#0068FF]/15 hover:bg-[#0068FF]/25 border border-[#0068FF]/40 text-blue-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group cursor-pointer"
                      title="Chia sẻ lời mời qua Zalo"
                    >
                      {/* Zalo Icon SVG */}
                      <div className="w-6 h-6 rounded-lg bg-[#0068FF] text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                        Z
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-blue-200">Zalo</span>
                      <span className="text-[9px] text-blue-300/80">Gửi tin nhắn</span>
                    </button>

                    {/* 2. Facebook Share Button */}
                    <button
                      onClick={handleShareFacebook}
                      className="py-2.5 px-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-blue-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group cursor-pointer"
                      title="Chia sẻ lời mời qua Facebook"
                    >
                      {/* Facebook 'f' Icon SVG */}
                      <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-blue-200">Facebook</span>
                      <span className="text-[9px] text-blue-300/80">Chia sẻ bài</span>
                    </button>

                    {/* 3. Email Share Button */}
                    <button
                      onClick={handleShareEmail}
                      className="py-2.5 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group cursor-pointer"
                      title="Gửi lời mời qua Email"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shadow-sm">
                        <Mail size={13} />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-rose-200">Email</span>
                      <span className="text-[9px] text-rose-300/80">Soạn thư mời</span>
                    </button>
                  </div>

                  {/* Secondary Quick Share Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <Copy size={13} />
                      <span>Chép Mã Phòng</span>
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <Share2 size={13} />
                      <span>Chia Sẻ Khác</span>
                    </button>
                  </div>
                </div>

                {/* Toast Feedback Notification */}
                {copyFeedback && (
                  <div className="p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                    <Check size={14} className="text-teal-400 shrink-0" />
                    <span>{copyFeedback}</span>
                  </div>
                )}

                {/* Turn Time Selector */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-medium text-slate-300 block mb-1.5">
                    Thời Gian Mỗi Lượt Đi:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map(sec => (
                      <button
                        key={sec}
                        onClick={() => {
                          setTurnTime(sec);
                          soundManager.playButtonClick();
                        }}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                          turnTime === sec
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sec} Giây
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button: Enter room & wait */}
                <button
                  onClick={handleCreateAndPlay}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 mt-1 transition-all active:scale-95 cursor-pointer"
                >
                  <Play size={16} className="fill-slate-950" />
                  <span>Vào Phòng & Bắt Đầu Chờ Bạn Bè</span>
                </button>
              </div>
            ) : (
              /* Room Action: JOIN */
              <form onSubmit={handleJoinAndPlay} className="flex flex-col gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                {initialRoomCode && (
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                    <Sparkles size={14} className="shrink-0" />
                    <span>Đã nhận diện mã phòng từ liên kết lời mời!</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Nhập mã phòng bạn bè đã chia sẻ với bạn:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: CARO-K7W9"
                      value={inputCode}
                      onChange={e => setInputCode(e.target.value.toUpperCase())}
                      required
                      className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-base font-mono font-bold text-cyan-400 tracking-widest focus:outline-none focus:border-cyan-400"
                    />
                    {inputCode && (
                      <button
                        type="button"
                        onClick={() => setInputCode('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="w-full h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer mt-1"
                >
                  <Play size={16} className="fill-slate-950" />
                  <span>Vào Bàn Cờ Thi Đấu Ngay</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Local Pass & Play */}
        {activeTab === 'local' && (
          <div className="flex flex-col gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-around py-2">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-950 border-2 border-cyan-400 text-cyan-400 font-mono font-black flex items-center justify-center text-sm shadow-sm shadow-cyan-500/30">
                  X
                </div>
                <span className="text-xs font-bold text-slate-200 mt-1">Người Chơi 1</span>
                <span className="text-[10px] text-slate-400">Đi Trước</span>
              </div>

              <span className="text-sm font-black text-slate-500">VS</span>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-rose-950 border-2 border-rose-400 text-rose-400 font-mono font-black flex items-center justify-center text-sm shadow-sm shadow-rose-500/30">
                  O
                </div>
                <span className="text-xs font-bold text-slate-200 mt-1">Người Chơi 2</span>
                <span className="text-[10px] text-slate-400">Đi Sau</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 text-center leading-relaxed">
              Hai người lần lượt thay nhau chạm vào màn hình để đặt quân. Phù hợp khi chơi trực tiếp cùng bạn bè, người thân!
            </p>

            {/* Turn Timer Selector */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-medium text-slate-300 block mb-1.5">
                Thời Gian Lượt Đi:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 30, 60, 999].map(sec => (
                  <button
                    key={sec}
                    onClick={() => {
                      setTurnTime(sec);
                      soundManager.playButtonClick();
                    }}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                      turnTime === sec
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sec === 999 ? 'Tự Do' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartLocalMatch}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 mt-1 transition-all active:scale-95 cursor-pointer"
            >
              <Play size={16} className="fill-slate-950" />
              <span>Bắt Đầu Trận Đấu 2 Người</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
