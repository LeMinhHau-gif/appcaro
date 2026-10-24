import React, { useState } from 'react';
import { WHEEL_ITEMS } from '../../data/questsAndShop';
import { X, Sparkles, Gift } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../engine/audioEngine';
import confetti from 'canvas-confetti';

interface WheelSpinModalProps {
  onClose: () => void;
}

export const WheelSpinModal: React.FC<WheelSpinModalProps> = ({ onClose }) => {
  const { addCoins, addGems } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof WHEEL_ITEMS)[0] | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);
    soundManager.playButtonClick();

    // Random target index (0-7)
    const prizeIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const targetPrize = WHEEL_ITEMS[prizeIndex];

    const segmentAngle = 360 / WHEEL_ITEMS.length;
    // We want the pointer at top (270 deg or 0 deg), let's calculate rotation:
    // Extra 5 full rotations (1800 deg) + prize angle
    const extraRotations = 360 * 5;
    const stopAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotationDeg + extraRotations + (stopAngle - (rotationDeg % 360));

    setRotationDeg(totalRotation);

    // Play ticking sounds during spin
    let ticks = 0;
    const interval = setInterval(() => {
      soundManager.playSpinTick();
      ticks++;
      if (ticks > 24) clearInterval(interval);
    }, 120);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(targetPrize);

      if (targetPrize.type === 'coins') {
        addCoins(targetPrize.value);
      } else if (targetPrize.type === 'gems') {
        addGems(targetPrize.value);
      } else {
        addCoins(100);
      }

      soundManager.playWinFanfare();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm p-5 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <Gift size={20} className="text-amber-400" />
          <h3 className="text-lg font-bold text-slate-100">Vòng Quay May Mắn</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">Quay mỗi ngày để nhận xu, đá quý và quà tặng miễn phí</p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-5">
          {/* Outer Ring & Indicator Pointer */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow(0 2px 4px rgba(0,0,0,0.5))" />

          {/* Rotating Wheel Canvas/SVG */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-2xl overflow-hidden relative"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
              transition: isSpinning ? 'transform 3.5s cubic-bezier(0.12, 0.8, 0.32, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {WHEEL_ITEMS.map((item, idx) => {
                const angle = 360 / WHEEL_ITEMS.length;
                const startAngle = (idx * angle * Math.PI) / 180;
                const endAngle = ((idx + 1) * angle * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                // Text position
                const midAngle = ((idx + 0.5) * angle * Math.PI) / 180;
                const tx = 50 + 32 * Math.cos(midAngle);
                const ty = 50 + 32 * Math.sin(midAngle);

                return (
                  <g key={item.id}>
                    <path
                      d={pathData}
                      fill={item.color}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="4"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${idx * angle + angle / 2 + 90}, ${tx}, ${ty})`}
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Central Hub Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-10 w-14 h-14 rounded-full bg-slate-900 border-4 border-amber-400 text-amber-400 font-black text-xs uppercase tracking-wider flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-60 transition-transform cursor-pointer"
          >
            {isSpinning ? '...' : 'QUAY'}
          </button>
        </div>

        {/* Won Prize Banner */}
        {wonPrize && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center mb-4 animate-in zoom-in-90 duration-200">
            <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">
              Chúc mừng bạn đã trúng!
            </span>
            <div className="text-base font-bold text-white mt-0.5">
              {wonPrize.label}
            </div>
          </div>
        )}

        {/* Spin CTA Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles size={16} />
          <span>{isSpinning ? 'Đang Quay...' : 'Quay Ngay (Miễn Phí)'}</span>
        </button>
      </div>
    </div>
  );
};
