import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { DAILY_PUZZLES } from '../../data/dailyPuzzles';
import { PuzzleDefinition } from '../../types/game';
import { BrainCircuit, CheckCircle2, Coins, Play, Sparkles, ArrowLeft, Trophy } from 'lucide-react';
import { soundManager } from '../../engine/audioEngine';

export const PuzzlesScreen: React.FC = () => {
  const { user, startPuzzleMatch, setActiveTab } = useGame();
  const [filterDiff, setFilterDiff] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredPuzzles = DAILY_PUZZLES.filter(p => filterDiff === 'all' || p.difficulty === filterDiff);

  const handleStartPuzzle = (puzzle: PuzzleDefinition) => {
    soundManager.playButtonClick();
    startPuzzleMatch(puzzle);
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('home');
              soundManager.playButtonClick();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <BrainCircuit size={20} className="text-amber-400" />
              <span>Giải Đố Thế Cờ Caro</span>
            </h2>
            <p className="text-xs text-slate-400">Rèn luyện đòn sát thủ Mate in 2, Song Tam, Tứ Tam</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-2xl text-teal-300">
          <CheckCircle2 size={15} />
          <span className="text-xs font-bold font-mono tabular-nums">
            {user.solvedPuzzles.length} / {DAILY_PUZZLES.length} Đã Giải
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => {
          const label = { all: 'Tất Cả', easy: 'Nhập Môn', medium: 'Kỳ Thủ', hard: 'Cao Thủ' }[diff];
          const isSelected = filterDiff === diff;

          return (
            <button
              key={diff}
              onClick={() => {
                setFilterDiff(diff);
                soundManager.playButtonClick();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Puzzles List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPuzzles.map((puzzle) => {
          const isSolved = user.solvedPuzzles.includes(puzzle.id);

          return (
            <div
              key={puzzle.id}
              className={`rounded-3xl p-4 border transition-all flex flex-col justify-between ${
                isSolved
                  ? 'bg-slate-900/60 border-slate-800'
                  : 'bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      puzzle.difficulty === 'easy'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : puzzle.difficulty === 'medium'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {puzzle.difficulty}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-mono text-amber-400 font-bold">
                    <Coins size={13} />
                    +{puzzle.rewardCoins} Xu
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{puzzle.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{puzzle.description}</p>

                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 text-[11px] text-teal-300 mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="shrink-0 text-amber-400" />
                  <span>Mục tiêu: {puzzle.objective}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                {isSolved ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>Đã Hoàn Thành</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Chưa giải</span>
                )}

                <button
                  onClick={() => handleStartPuzzle(puzzle)}
                  className={`h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                    isSolved
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  <Play size={13} className="fill-current" />
                  <span>{isSolved ? 'Luyện Lại' : 'Vào Giải Đố'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
