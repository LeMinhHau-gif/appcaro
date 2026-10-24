import React, { useState } from 'react';
import { RotateCcw, Lightbulb, Flag, MessageSquare, Send } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';

interface GameControlsProps {
  onUndo: () => void;
  onHint: () => void;
  onResign: () => void;
  canUndo: boolean;
  canHint: boolean;
  onSendEmoji: (emoji: string) => void;
  onSendChat: (text: string) => void;
}

const QUICK_EMOJIS = ['🔥', '😎', '🤯', '👏', '🤝', '😭', '⚡', '☕'];
const QUICK_PHRASES = [
  'Đánh hay lắm!',
  'Nước cờ độc đấy!',
  'Xem tôi hóa giải này!',
  'Đừng vội mừng!',
  'Giao lưu vui vẻ nhé!',
];

export const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onHint,
  onResign,
  canUndo,
  canHint,
  onSendEmoji,
  onSendChat,
}) => {
  const { user } = useGame();
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <div className="w-full bg-slate-900/90 border-t border-slate-800 p-2 sm:p-3 flex flex-col gap-2">
      {/* Quick emoji reaction strip */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSendEmoji(emoji);
                soundManager.playButtonClick();
              }}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-90 text-sm flex items-center justify-center transition-all border border-slate-700/50"
              title={`Thả cảm xúc ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowChatModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors shrink-0"
        >
          <MessageSquare size={13} className="text-teal-400" />
          <span>Chat</span>
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* Undo Move */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-semibold text-xs border border-slate-700/60 transition-all shadow-sm"
        >
          <RotateCcw size={15} className="text-cyan-400" />
          <span>Đi Lại</span>
        </button>

        {/* AI Hint */}
        <button
          onClick={onHint}
          disabled={!canHint}
          className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all shadow-sm"
        >
          <Lightbulb size={15} className="text-amber-400" />
          <span>Gợi Ý (10 Xu)</span>
        </button>

        {/* Resign */}
        <button
          onClick={onResign}
          className="flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-all shadow-sm"
        >
          <Flag size={15} className="text-rose-400" />
          <span>Xin Thua</span>
        </button>
      </div>

      {/* Quick Chat Phrases Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100">Tin Nhắn Nhanh</h4>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="flex flex-col gap-2 py-3">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSendChat(phrase);
                    setShowChatModal(false);
                    soundManager.playButtonClick();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/60 transition-colors flex items-center justify-between"
                >
                  <span>{phrase}</span>
                  <Send size={12} className="text-teal-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
