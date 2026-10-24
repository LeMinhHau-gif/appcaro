import React, { useState, useMemo } from 'react';
import { Move, BlunderAnalysisItem, BoardGrid } from '../../types/game';
import { BOARD_SIZE, createEmptyBoard, cloneBoard } from '../../engine/gomokuEngine';
import { X, ChevronLeft, ChevronRight, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

interface BlunderReviewModalProps {
  history: Move[];
  blunders: BlunderAnalysisItem[];
  onClose: () => void;
}

export const BlunderReviewModal: React.FC<BlunderReviewModalProps> = ({
  history,
  blunders,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(history.length);

  // Build board state up to currentStep
  const stepBoard: BoardGrid = useMemo(() => {
    const b = createEmptyBoard();
    for (let i = 0; i < currentStep && i < history.length; i++) {
      b[history[i].row][history[i].col] = history[i].player;
    }
    return b;
  }, [history, currentStep]);

  const currentMove = currentStep > 0 && currentStep <= history.length ? history[currentStep - 1] : null;

  // Check if currentStep has an analysis item
  const currentBlunder = useMemo(() => {
    return blunders.find(b => b.moveNumber === currentStep);
  }, [blunders, currentStep]);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      soundManager.playButtonClick();
    }
  };

  const handleNext = () => {
    if (currentStep < history.length) {
      setCurrentStep(prev => prev + 1);
      soundManager.playButtonClick();
    }
  };

  const jumpToBlunder = (moveNum: number) => {
    setCurrentStep(moveNum);
    soundManager.playButtonClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Kỳ Đạo Sư: Phân Tích Sai Lầm & Nước Cờ</h3>
              <p className="text-[11px] text-slate-400">Xem lại từng nước đi và học hỏi từ các tình huống mấu chốt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">
          {/* Left: Mini board preview */}
          <div className="flex flex-col items-center justify-center bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <div className="relative inline-block border border-slate-700 rounded-lg p-1 bg-[#121622]">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                }}
              >
                {stepBoard.map((rowArr, r) =>
                  rowArr.map((cellValue, c) => {
                    const isCurrent = currentMove?.row === r && currentMove?.col === c;
                    const isSuggestedBetter = currentBlunder?.betterMove?.row === r && currentBlunder?.betterMove?.col === c;

                    return (
                      <div
                        key={`${r}-${c}`}
                        className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                      >
                        {/* Intersection line */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-[1px] bg-slate-700/60" />
                          <div className="h-full w-[1px] bg-slate-700/60 absolute" />
                        </div>

                        {/* Cell Stone */}
                        {cellValue && (
                          <div
                            className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[8px] font-bold font-mono ${
                              cellValue === 'X'
                                ? 'bg-cyan-500 text-black shadow-sm'
                                : 'bg-rose-500 text-white shadow-sm'
                            } ${isCurrent ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            {cellValue}
                          </div>
                        )}

                        {/* Suggested Better Move Target */}
                        {isSuggestedBetter && (
                          <div className="absolute inset-0.5 rounded-full border border-teal-400 bg-teal-400/30 animate-pulse flex items-center justify-center">
                            <span className="text-[7px] font-bold text-teal-200">★</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stepper controls */}
            <div className="flex items-center justify-between w-full mt-3 px-2">
              <button
                onClick={handlePrev}
                disabled={currentStep <= 0}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-mono font-semibold text-slate-300 tabular-nums">
                Nước đi: {currentStep} / {history.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentStep >= history.length}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: Key Blunders & Tutor Recommendations */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Current Step Analysis Callout */}
            {currentBlunder ? (
              <div
                className={`p-3.5 rounded-2xl border ${
                  currentBlunder.severity === 'blunder'
                    ? 'bg-rose-950/40 border-rose-500/40'
                    : currentBlunder.severity === 'brilliant'
                    ? 'bg-teal-950/40 border-teal-500/40'
                    : 'bg-amber-950/40 border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {currentBlunder.severity === 'blunder' ? (
                    <AlertTriangle size={16} className="text-rose-400" />
                  ) : (
                    <CheckCircle2 size={16} className="text-teal-400" />
                  )}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      currentBlunder.severity === 'blunder'
                        ? 'text-rose-400'
                        : currentBlunder.severity === 'brilliant'
                        ? 'text-teal-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {currentBlunder.severity === 'blunder'
                      ? 'Nước Cờ Sai Lầm (Blunder)'
                      : currentBlunder.severity === 'brilliant'
                      ? 'Nước Cờ Xuất Sắc (Brilliant)'
                      : 'Nước Cờ Sơ Hở (Inaccuracy)'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{currentBlunder.description}</p>
                {currentBlunder.betterMove && (
                  <div className="mt-2 text-[11px] text-teal-300 font-medium">
                    Nước AI khuyên dùng: Ô (
                    {String.fromCharCode(65 + currentBlunder.betterMove.col)}
                    {currentBlunder.betterMove.row + 1}) được đánh dấu ngôi sao xanh ★ trên bàn cờ.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                {currentMove ? (
                  <span>
                    Quân <strong className="text-slate-200">{currentMove.player}</strong> đánh tại{' '}
                    <strong className="text-slate-200 font-mono">
                      {String.fromCharCode(65 + currentMove.col)}
                      {currentMove.row + 1}
                    </strong>
                    . Thế cờ đang ổn định.
                  </span>
                ) : (
                  <span>Bắt đầu ván cờ. Hãy dùng các nút điều hướng để xem lại trận đấu.</span>
                )}
              </div>
            )}

            {/* List of critical turning points */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Các Tình Huống Quan Trọng ({blunders.length})
              </h4>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {blunders.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2">Không phát hiện sai lầm nghiêm trọng nào! Bạn đánh rất chuẩn xác.</div>
                ) : (
                  blunders.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => jumpToBlunder(item.moveNumber)}
                      className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between border transition-all ${
                        currentStep === item.moveNumber
                          ? 'bg-slate-800 border-teal-500/60 text-white'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          #{item.moveNumber}
                        </span>
                        <span className="font-medium truncate max-w-[200px]">
                          {item.severity === 'blunder' ? 'Bỏ lỡ thế cờ' : item.severity === 'brilliant' ? 'Thế cờ thắng' : 'Sơ hở'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-teal-400">Xem ngay →</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
