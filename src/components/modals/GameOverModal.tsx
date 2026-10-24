import React, { useEffect } from 'react';
import { Player, GameMode, CampaignStage } from '../../types/game';
import { Trophy, Star, ArrowRight, RotateCcw, Award, Sparkles, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../engine/audioEngine';

interface GameOverModalProps {
  winner: Player | 'draw';
  userPlayer: Player;
  gameMode: GameMode;
  stage?: CampaignStage;
  turnsCount: number;
  onPlayAgain: () => void;
  onExit: () => void;
  onOpenBlunderReview: () => void;
  hasBlunders: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  userPlayer,
  gameMode,
  stage,
  turnsCount,
  onPlayAgain,
  onExit,
  onOpenBlunderReview,
  hasBlunders,
}) => {
  const isWinner = winner === userPlayer;
  const isDraw = winner === 'draw';

  // Compute stars for campaign
  let earnedStars = 0;
  if (isWinner && stage) {
    if (turnsCount <= stage.targetStars.threeStarsTurns) {
      earnedStars = 3;
    } else if (turnsCount <= stage.targetStars.twoStarsTurns) {
      earnedStars = 2;
    } else {
      earnedStars = 1;
    }
  }

  useEffect(() => {
    if (isWinner) {
      soundManager.playWinFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F5D4', '#FFD166', '#FF477E', '#38bdf8'],
        });
      } catch {}
    } else if (!isDraw) {
      soundManager.playDefeatSound();
    }
  }, [isWinner, isDraw]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isWinner ? 'bg-teal-500/25' : isDraw ? 'bg-amber-500/20' : 'bg-rose-500/20'
          }`}
        />

        {/* Header Icon */}
        <div className="relative mb-3 mt-1">
          {isWinner ? (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 animate-bounce">
              <Trophy size={32} className="text-slate-950" />
            </div>
          ) : isDraw ? (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Award size={32} className="text-amber-400" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <RotateCcw size={32} className="text-rose-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black tracking-tight text-white mb-1">
          {isWinner ? 'CHIẾN THẮNG!' : isDraw ? 'HÒA CỜ!' : 'THẤT BẠI!'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {isWinner
            ? `Xuất sắc! Bạn đã hạ gục đối thủ sau ${turnsCount} nước đi.`
            : isDraw
            ? 'Cả hai bên đều phòng thủ kiên cố, bàn cờ bất phân thắng bại.'
            : 'Đừng nản lòng! Hãy rút kinh nghiệm từ những nước cờ sơ hở.'}
        </p>

        {/* Star rating for campaign */}
        {gameMode === 'campaign' && isWinner && (
          <div className="flex items-center gap-2 mb-4 bg-slate-950/60 px-4 py-2 rounded-2xl border border-slate-800">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                size={24}
                className={
                  starIdx <= earnedStars
                    ? 'text-amber-400 fill-amber-400 filter drop-shadow(0 0 6px rgba(251,191,36,0.6))'
                    : 'text-slate-700'
                }
              />
            ))}
          </div>
        )}

        {/* Match Rewards Breakdown */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 mb-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">ELO</div>
            <div
              className={`text-sm font-bold font-mono tabular-nums ${
                isWinner ? 'text-teal-400' : isDraw ? 'text-slate-400' : 'text-rose-400'
              }`}
            >
              {isWinner ? '+25' : isDraw ? '+0' : '-18'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tiền Thưởng</div>
            <div className="text-sm font-bold font-mono tabular-nums text-amber-400">
              {isWinner ? (stage ? `+${stage.rewardCoins}` : '+50') : '+10'} Xu
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Kinh Nghiệm</div>
            <div className="text-sm font-bold font-mono tabular-nums text-cyan-400">
              {isWinner ? '+40' : '+15'} XP
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {/* AI Tutor / Blunder Review button */}
          <button
            onClick={onOpenBlunderReview}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-teal-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 border border-teal-500/40 text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Sparkles size={15} />
            <span>Xem Lỗi & Phân Tích Nước Đi (AI Tutor)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={onPlayAgain}
              className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <RotateCcw size={14} />
              <span>Chơi Lại</span>
            </button>

            <button
              onClick={onExit}
              className="h-11 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-md shadow-teal-500/20"
            >
              <Home size={14} />
              <span>Tiếp Tục</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
