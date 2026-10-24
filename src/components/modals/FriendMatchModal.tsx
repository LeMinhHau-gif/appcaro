import React, { useState } from 'react';
import { X, Users, Copy, Check, Play, UserPlus, Smartphone, Globe, Share2 } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

interface FriendMatchModalProps {
  onClose: () => void;
  onStartRoomMatch: (roomCode: string, isHost: boolean, timeLimitSec: number) => void;
  onStartPassAndPlay: (timeLimitSec: number) => void;
}

export const FriendMatchModal: React.FC<FriendMatchModalProps> = ({
  onClose,
  onStartRoomMatch,
  onStartPassAndPlay,
}) => {
  const [activeTab, setActiveTab] = useState<'online' | 'local'>('online');
  const [roomAction, setRoomAction] = useState<'create' | 'join'>('create');
  const [generatedCode] = useState<string>(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CARO-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });
  const [inputCode, setInputCode] = useState<string>('');
  const [turnTime, setTurnTime] = useState<number>(30);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    soundManager.playButtonClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareInvite = () => {
    const text = `Vào so tài cờ Caro đỉnh cao với tôi nhé! Mã phòng: ${generatedCode} - Ứng dụng Caro Master AI`;
    if (navigator.share) {
      navigator.share({ title: 'Lời Mời Đấu Caro', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    soundManager.playButtonClick();
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
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-5 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Users size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ghép Trận Với Bạn Bè</h3>
            <p className="text-xs text-slate-400">Thi đấu giao hữu qua mã phòng hoặc cùng một máy</p>
          </div>
        </div>

        {/* Main Mode Tabs */}
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

        {/* Tab 1: Online Room */}
        {activeTab === 'online' && (
          <div className="flex flex-col gap-3">
            {/* Create vs Join Sub-toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRoomAction('create')}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  roomAction === 'create'
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                Tạo Phòng Mới
              </button>
              <button
                onClick={() => setRoomAction('join')}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  roomAction === 'join'
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                Nhập Mã Vào Phòng
              </button>
            </div>

            {roomAction === 'create' ? (
              <div className="flex flex-col gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div className="text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Mã Phòng Bí Mật Của Bạn
                  </span>
                  <div className="text-2xl font-mono font-black text-cyan-400 tracking-wider my-1">
                    {generatedCode}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gửi mã này cho bạn bè để cùng vào bàn cờ thi đấu
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Đã Sao Chép' : 'Sao Chép Mã'}</span>
                  </button>

                  <button
                    onClick={handleShareInvite}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium flex items-center gap-1.5 border border-cyan-500/30 transition-colors"
                  >
                    <Share2 size={14} />
                    <span>Chia Sẻ Lời Mời</span>
                  </button>
                </div>

                {/* Turn Time Selector */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-medium text-slate-300 block mb-1.5">
                    Thời Gian Mỗi Lượt Đi:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 60].map(sec => (
                      <button
                        key={sec}
                        onClick={() => setTurnTime(sec)}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                          turnTime === sec
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sec} Giây
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateAndPlay}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 mt-1 transition-all active:scale-95"
                >
                  <Play size={16} className="fill-slate-950" />
                  <span>Vào Phòng & Chờ Bạn Bè</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinAndPlay} className="flex flex-col gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Nhập mã phòng bạn bè gửi cho bạn
                  </label>
                  <input
                    type="text"
                    placeholder="VD: CARO-889"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    required
                    className="w-full h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-base font-mono font-bold text-cyan-400 tracking-widest focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="w-full h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <Play size={16} className="fill-slate-950" />
                  <span>Vào Phòng Thi Đấu</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Local Pass & Play */}
        {activeTab === 'local' && (
          <div className="flex flex-col gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
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
                    onClick={() => setTurnTime(sec)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                      turnTime === sec
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {sec === 999 ? 'Tự Do' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartLocalMatch}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 mt-1 transition-all active:scale-95"
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
