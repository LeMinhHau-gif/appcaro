import React, { useState, useRef, useMemo } from 'react';
import { BoardGrid, Player, WinningLine } from '../../types/game';
import { BOARD_SIZE } from '../../engine/gomokuEngine';
import { BOARD_THEMES, STONE_SKINS } from '../../data/questsAndShop';
import { useGame } from '../../context/GameContext';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface GameBoardProps {
  board: BoardGrid;
  onCellClick: (row: number, col: number) => void;
  lastMove: { row: number; col: number; player: Player } | null;
  winningLine: WinningLine | null;
  hintCell: { row: number; col: number } | null;
  isInteractive: boolean;
  activePlayer: Player;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onCellClick,
  lastMove,
  winningLine,
  hintCell,
  isInteractive,
  activePlayer,
}) => {
  const { user } = useGame();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  const theme = useMemo(() => {
    return BOARD_THEMES.find(t => t.id === user.equippedTheme) || BOARD_THEMES[0];
  }, [user.equippedTheme]);

  const skin = useMemo(() => {
    return STONE_SKINS.find(s => s.id === user.equippedSkin) || STONE_SKINS[0];
  }, [user.equippedSkin]);

  // Coordinates labels (A-O, 1-15)
  const colLetters = useMemo(() => {
    return Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i));
  }, []);

  // Standard Star Points (Hoshi) on 15x15: (3,3), (3,11), (7,7), (11,3), (11,11)
  const isStarPoint = (r: number, c: number) => {
    return (
      (r === 3 && c === 3) ||
      (r === 3 && c === 11) ||
      (r === 7 && c === 7) ||
      (r === 11 && c === 3) ||
      (r === 11 && c === 11)
    );
  };

  const isWinningCell = (r: number, c: number) => {
    if (!winningLine) return false;
    return winningLine.cells.some(([wr, wc]) => wr === r && wc === c);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(1.4, Math.max(0.9, Number((prev + delta).toFixed(1)))));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-full">
      {/* Zoom / Viewport controls */}
      <div className="flex items-center justify-between w-full px-2 py-1.5 mb-1 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-slate-300">Bàn cờ 15x15</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-teal-400 font-medium">Lượt: Quân {activePlayer}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => handleZoom(-0.1)}
            disabled={zoomLevel <= 0.9}
            className="p-1.5 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
            title="Thu nhỏ"
            aria-label="Thu nhỏ bàn cờ"
          >
            <ZoomOut size={13} />
          </button>
          <span className="px-1 text-[10px] font-mono tabular-nums">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => handleZoom(0.1)}
            disabled={zoomLevel >= 1.4}
            className="p-1.5 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
            title="Phóng to"
            aria-label="Phóng to bàn cờ"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 hover:text-teal-400 rounded hover:bg-slate-800 transition-colors"
            title="Chuẩn vừa màn hình"
            aria-label="Vừa màn hình"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Scrollable Container with Zoom */}
      <div className="w-full overflow-auto rounded-2xl border border-slate-800/80 shadow-2xl bg-black/40 p-2 sm:p-4 flex items-center justify-center">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
          className="relative inline-block"
        >
          {/* Top Column Coordinate Header */}
          <div className="flex pl-6 pr-6 pb-1">
            {colLetters.map((letter) => (
              <div
                key={letter}
                className="w-6 h-4 sm:w-8 sm:h-5 md:w-9 md:h-5 text-center text-[10px] sm:text-xs font-mono font-medium text-slate-500"
              >
                {letter}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Left Row Coordinate Bar */}
            <div className="flex flex-col pt-0 pr-1">
              {Array.from({ length: BOARD_SIZE }, (_, i) => (
                <div
                  key={i}
                  className="w-4 h-6 sm:w-5 sm:h-8 md:w-5 md:h-9 flex items-center justify-center text-[10px] sm:text-xs font-mono font-medium text-slate-500"
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* The Main Caro Board Canvas Grid */}
            <div
              className={`relative rounded-xl shadow-inner border ${theme.borderColor} ${theme.boardBg} p-1 sm:p-2`}
              style={{
                boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.4)',
              }}
            >
              {/* Grid Cells */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                }}
              >
                {board.map((rowArr, r) =>
                  rowArr.map((cellValue, c) => {
                    const isLast = lastMove?.row === r && lastMove?.col === c;
                    const isWinning = isWinningCell(r, c);
                    const isHint = hintCell?.row === r && hintCell?.col === c;
                    const isStar = isStarPoint(r, c);
                    const isHover = hoveredCell?.r === r && hoveredCell?.c === c && !cellValue && isInteractive;

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => {
                          if (isInteractive && !cellValue) {
                            onCellClick(r, c);
                          }
                        }}
                        onMouseEnter={() => setHoveredCell({ r, c })}
                        onMouseLeave={() => setHoveredCell(null)}
                        disabled={!isInteractive || cellValue !== null}
                        className={`relative w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center focus:outline-none transition-colors ${
                          !cellValue && isInteractive ? 'cursor-pointer hover:bg-white/5 active:scale-95' : 'cursor-default'
                        }`}
                        aria-label={`Ô ${colLetters[c]}${r + 1}`}
                      >
                        {/* Grid Intersection Lines */}
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            backgroundColor: theme.gridLineColor,
                            left: c === 0 ? '50%' : 0,
                            right: c === BOARD_SIZE - 1 ? '50%' : 0,
                            top: '50%',
                            height: '1px',
                            transform: 'translateY(-50%)',
                          }}
                        />
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            backgroundColor: theme.gridLineColor,
                            top: r === 0 ? '50%' : 0,
                            bottom: r === BOARD_SIZE - 1 ? '50%' : 0,
                            left: '50%',
                            width: '1px',
                            transform: 'translateX(-50%)',
                          }}
                        />

                        {/* Star Point (Hoshi) Dot */}
                        {isStar && !cellValue && (
                          <div
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full absolute pointer-events-none"
                            style={{ backgroundColor: theme.starPointColor }}
                          />
                        )}

                        {/* Hover Preview for Active Player */}
                        {isHover && (
                          <div
                            className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border border-dashed flex items-center justify-center opacity-50 ${
                              activePlayer === 'X' ? 'border-cyan-400 text-cyan-400' : 'border-rose-400 text-rose-400'
                            }`}
                          >
                            <span className="text-[10px] sm:text-xs font-bold font-mono">{activePlayer}</span>
                          </div>
                        )}

                        {/* AI Hint Highlight Ring */}
                        {isHint && !cellValue && (
                          <div className="absolute inset-0.5 sm:inset-1 rounded-full border-2 border-amber-400 animate-ping opacity-80 pointer-events-none" />
                        )}
                        {isHint && !cellValue && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400/80 animate-pulse pointer-events-none flex items-center justify-center">
                            <span className="text-[8px] font-black text-black">!</span>
                          </div>
                        )}

                        {/* Stone Piece */}
                        {cellValue && (
                          <div
                            className={`relative w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base font-mono transition-transform duration-150 transform scale-100 ${
                              isWinning ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-slate-900 scale-105 z-20' : ''
                            }`}
                            style={{
                              boxShadow: cellValue === 'X' ? skin.xGlow : skin.oGlow,
                              backgroundColor: cellValue === 'X' ? (theme.id === 'theme_zen' ? '#0f172a' : '#091522') : (theme.id === 'theme_zen' ? '#f8fafc' : '#220b12'),
                              border: `1.5px solid ${cellValue === 'X' ? skin.xColor : skin.oColor}`,
                              color: cellValue === 'X' ? skin.xColor : skin.oColor,
                            }}
                          >
                            {cellValue}

                            {/* Last Move Indicator Ring */}
                            {isLast && (
                              <div
                                className="absolute -inset-1 rounded-full border-2 animate-pulse pointer-events-none"
                                style={{ borderColor: cellValue === 'X' ? skin.xColor : skin.oColor }}
                              />
                            )}

                            {/* Center small dot on last move */}
                            {isLast && (
                              <div
                                className="absolute bottom-0.5 w-1 h-1 rounded-full"
                                style={{ backgroundColor: cellValue === 'X' ? skin.xColor : skin.oColor }}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Row Coordinate Bar */}
            <div className="flex flex-col pt-0 pl-1">
              {Array.from({ length: BOARD_SIZE }, (_, i) => (
                <div
                  key={i}
                  className="w-4 h-6 sm:w-5 sm:h-8 md:w-5 md:h-9 flex items-center justify-center text-[10px] sm:text-xs font-mono font-medium text-slate-500"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Column Coordinate Footer */}
          <div className="flex pl-6 pr-6 pt-1">
            {colLetters.map((letter) => (
              <div
                key={letter}
                className="w-6 h-4 sm:w-8 sm:h-5 md:w-9 md:h-5 text-center text-[10px] sm:text-xs font-mono font-medium text-slate-500"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
