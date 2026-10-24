import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Player, Move, WinningLine, BoardGrid, BlunderAnalysisItem } from '../../types/game';
import {
  createEmptyBoard,
  cloneBoard,
  checkWin,
  isBoardFull,
  getSuggestedMove,
  analyzeBlunders,
} from '../../engine/gomokuEngine';
import { soundManager } from '../../engine/audioEngine';
import { GameBoard } from '../board/GameBoard';
import { GameHeader } from '../board/GameHeader';
import { GameControls } from '../board/GameControls';
import { GameOverModal } from '../modals/GameOverModal';
import { BlunderReviewModal } from '../modals/BlunderReviewModal';

export const GameScreen: React.FC = () => {
  const {
    activeGameSession,
    exitToHome,
    user,
    addCoins,
    addXp,
    recordMatchResult,
    completeStage,
    markPuzzleSolved,
  } = useGame();

  if (!activeGameSession) return null;

  const { mode, difficulty, opponent, stage, puzzle } = activeGameSession;
  const userPlayer: Player = puzzle ? puzzle.playerColor : 'X';
  const opponentPlayer: Player = userPlayer === 'X' ? 'O' : 'X';

  const maxTime = stage?.timeLimitSec || (mode === 'pvp' ? 30 : 45);

  // Game state
  const [board, setBoard] = useState<BoardGrid>(() => {
    const b = createEmptyBoard();
    if (puzzle) {
      puzzle.initialBoard.forEach(st => {
        b[st.row][st.col] = st.player;
      });
    }
    return b;
  });

  const [activePlayer, setActivePlayer] = useState<Player>('X');
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null);
  const [activeReaction, setActiveReaction] = useState<{ emoji?: string; text?: string; from: 'user' | 'opp' } | null>(null);

  // Blunder analysis modal state
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showBlunderModal, setShowBlunderModal] = useState(false);
  const [blunders, setBlunders] = useState<BlunderAnalysisItem[]>([]);

  const isAiThinking = useRef(false);

  // Count stones
  const xStonesCount = moveHistory.filter(m => m.player === 'X').length;
  const oStonesCount = moveHistory.filter(m => m.player === 'O').length;

  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

  // Turn Timer countdown
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired! If user's turn, opponent wins on time; if opponent's turn, user wins
          handleTimeExpired();
          return 0;
        }
        if (prev <= 5) {
          soundManager.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activePlayer, isGameOver]);

  const handleTimeExpired = useCallback(() => {
    if (isGameOver) return;
    const losingPlayer = activePlayer;
    const matchWinner: Player = losingPlayer === 'X' ? 'O' : 'X';
    endGame(matchWinner);
  }, [activePlayer, isGameOver]);

  // Handle Game End
  const endGame = useCallback(
    (winPlayer: Player | 'draw') => {
      setIsGameOver(true);
      setWinner(winPlayer);

      const isUserWin = winPlayer === userPlayer;
      const isDraw = winPlayer === 'draw';

      // Record results in context
      recordMatchResult(isUserWin, isDraw, moveHistory.length);

      if (isUserWin) {
        if (stage) {
          // Calculate stars
          let stars = 1;
          if (moveHistory.length <= stage.targetStars.threeStarsTurns) stars = 3;
          else if (moveHistory.length <= stage.targetStars.twoStarsTurns) stars = 2;

          completeStage(stage.id, stars);
          addCoins(stage.rewardCoins);
          addXp(stage.rewardXp);
        } else if (puzzle) {
          markPuzzleSolved(puzzle.id);
          addCoins(puzzle.rewardCoins);
          addXp(50);
        } else {
          addCoins(50);
          addXp(40);
        }
      } else {
        addCoins(10);
        addXp(15);
      }

      // Analyze game blunders
      const analysis = analyzeBlunders(moveHistory);
      setBlunders(analysis);

      // Delay showing game over modal slightly for smooth visual impact
      setTimeout(() => {
        setShowGameOverModal(true);
      }, 700);
    },
    [userPlayer, moveHistory, stage, puzzle, recordMatchResult, completeStage, markPuzzleSolved, addCoins, addXp]
  );

  // Play a move
  const makeMove = useCallback(
    (row: number, col: number, player: Player) => {
      if (board[row][col] !== null || isGameOver) return;

      const newBoard = cloneBoard(board);
      newBoard[row][col] = player;
      setBoard(newBoard);

      soundManager.playStoneSound(player === userPlayer);
      setHintCell(null);

      const newMove: Move = {
        row,
        col,
        player,
        timestamp: Date.now(),
      };
      const updatedHistory = [...moveHistory, newMove];
      setMoveHistory(updatedHistory);

      // Check for win
      const win = checkWin(newBoard);
      if (win) {
        setWinningLine(win);
        endGame(win.player);
        return;
      }

      // Check for draw
      if (isBoardFull(newBoard)) {
        endGame('draw');
        return;
      }

      // Check puzzle solution if in puzzle mode
      if (puzzle) {
        const isSolution = puzzle.winningSolution.some(s => s.row === row && s.col === col);
        if (isSolution) {
          endGame(userPlayer);
          return;
        }
      }

      // Switch turn
      const nextPlayer: Player = player === 'X' ? 'O' : 'X';
      setActivePlayer(nextPlayer);
      setTimeLeft(maxTime);
    },
    [board, isGameOver, userPlayer, moveHistory, puzzle, maxTime, endGame]
  );

  // AI or Simulated Online Opponent Turn Loop
  useEffect(() => {
    if (mode !== 'pass_and_play' && activePlayer === opponentPlayer && !isGameOver && !isAiThinking.current) {
      isAiThinking.current = true;

      // Realistic thinking delay between 350ms and 750ms
      const delay = Math.floor(Math.random() * 350) + 400;

      const timer = setTimeout(() => {
        // Occasionally opponent sends an emoji in PvP
        if (mode === 'pvp' && Math.random() < 0.25) {
          const emojis = ['🔥', '😎', '👏', '🤝'];
          setActiveReaction({
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            from: 'opp',
          });
          setTimeout(() => setActiveReaction(null), 2500);
        }

        const bestMove = getSuggestedMove(board, opponentPlayer, difficulty);
        isAiThinking.current = false;
        makeMove(bestMove.row, bestMove.col, opponentPlayer);
      }, delay);

      return () => {
        clearTimeout(timer);
        isAiThinking.current = false;
      };
    }
  }, [activePlayer, opponentPlayer, isGameOver, board, difficulty, makeMove, mode]);

  // User taps cell
  const handleCellClick = (row: number, col: number) => {
    if (isGameOver) return;
    if (mode === 'pass_and_play') {
      makeMove(row, col, activePlayer);
      return;
    }
    if (activePlayer !== userPlayer) return;
    makeMove(row, col, userPlayer);
  };

  // Undo move
  const handleUndo = () => {
    if (isGameOver) return;

    if (mode === 'pass_and_play') {
      if (moveHistory.length < 1) return;
      soundManager.playButtonClick();
      const newHistory = moveHistory.slice(0, -1);
      const newBoard = createEmptyBoard();
      newHistory.forEach(m => {
        newBoard[m.row][m.col] = m.player;
      });
      setBoard(newBoard);
      setMoveHistory(newHistory);
      const prevPlayer = activePlayer === 'X' ? 'O' : 'X';
      setActivePlayer(prevPlayer);
      setTimeLeft(maxTime);
      setHintCell(null);
      return;
    }

    if (activePlayer !== userPlayer || moveHistory.length < 2) return;

    soundManager.playButtonClick();
    // Rollback last 2 moves (AI move and Player move)
    const newHistory = moveHistory.slice(0, -2);
    const newBoard = createEmptyBoard();

    // Replay puzzle initial board if applicable
    if (puzzle) {
      puzzle.initialBoard.forEach(st => {
        newBoard[st.row][st.col] = st.player;
      });
    }

    newHistory.forEach(m => {
      newBoard[m.row][m.col] = m.player;
    });

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setActivePlayer(userPlayer);
    setTimeLeft(maxTime);
    setHintCell(null);
  };

  // AI Hint
  const handleHint = () => {
    if (isGameOver) return;
    if (mode !== 'pass_and_play' && activePlayer !== userPlayer) return;

    if (user.coins >= 10) {
      addCoins(-10);
      soundManager.playHintSound();
      const hint = getSuggestedMove(board, activePlayer, 'grandmaster');
      setHintCell({ row: hint.row, col: hint.col });
    }
  };

  // Resign
  const handleResign = () => {
    if (isGameOver) return;
    soundManager.playDefeatSound();
    endGame(opponentPlayer);
  };

  // Play Again
  const handlePlayAgain = () => {
    soundManager.playButtonClick();
    const b = createEmptyBoard();
    if (puzzle) {
      puzzle.initialBoard.forEach(st => {
        b[st.row][st.col] = st.player;
      });
    }
    setBoard(b);
    setActivePlayer('X');
    setMoveHistory([]);
    setWinningLine(null);
    setWinner(null);
    setIsGameOver(false);
    setTimeLeft(maxTime);
    setHintCell(null);
    setShowGameOverModal(false);
    setShowBlunderModal(false);
  };

  // Reactions
  const handleSendEmoji = (emoji: string) => {
    setActiveReaction({ emoji, from: 'user' });
    setTimeout(() => setActiveReaction(null), 2500);
  };

  const handleSendChat = (text: string) => {
    setActiveReaction({ text, from: 'user' });
    setTimeout(() => setActiveReaction(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d111a] text-slate-100 justify-between relative overflow-hidden">
      {/* Header with Matchup and Blitz Timer */}
      <GameHeader
        opponent={opponent}
        gameMode={mode}
        activePlayer={activePlayer}
        userPlayer={userPlayer}
        timeLeft={timeLeft}
        maxTime={maxTime}
        onExit={exitToHome}
        xStonesCount={xStonesCount}
        oStonesCount={oStonesCount}
      />

      {/* Floating Reaction Bubble */}
      {activeReaction && (
        <div
          className={`fixed z-30 animate-in zoom-in-75 fade-in duration-200 pointer-events-none ${
            activeReaction.from === 'user' ? 'bottom-28 left-6' : 'top-24 right-6'
          }`}
        >
          <div className="px-3 py-2 rounded-2xl bg-slate-900/90 border border-teal-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs text-white">
            {activeReaction.emoji && <span className="text-xl">{activeReaction.emoji}</span>}
            {activeReaction.text && <span className="font-medium">{activeReaction.text}</span>}
          </div>
        </div>
      )}

      {/* Central Caro Board Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-2xl mx-auto w-full">
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          winningLine={winningLine}
          hintCell={hintCell}
          isInteractive={!isGameOver && (mode === 'pass_and_play' || activePlayer === userPlayer)}
          activePlayer={activePlayer}
        />
      </main>

      {/* Bottom Game Controls */}
      <GameControls
        onUndo={handleUndo}
        onHint={handleHint}
        onResign={handleResign}
        canUndo={!isGameOver && (mode === 'pass_and_play' ? moveHistory.length >= 1 : (activePlayer === userPlayer && moveHistory.length >= 2))}
        canHint={!isGameOver && (mode === 'pass_and_play' || activePlayer === userPlayer) && user.coins >= 10}
        onSendEmoji={handleSendEmoji}
        onSendChat={handleSendChat}
      />

      {/* Game Over Modal */}
      {showGameOverModal && winner && (
        <GameOverModal
          winner={winner}
          userPlayer={userPlayer}
          gameMode={mode}
          stage={stage}
          turnsCount={moveHistory.length}
          onPlayAgain={handlePlayAgain}
          onExit={exitToHome}
          onOpenBlunderReview={() => {
            setShowGameOverModal(false);
            setShowBlunderModal(true);
          }}
          hasBlunders={blunders.length > 0}
        />
      )}

      {/* AI Tutor / Blunder Review Modal */}
      {showBlunderModal && (
        <BlunderReviewModal
          history={moveHistory}
          blunders={blunders}
          onClose={() => setShowBlunderModal(false)}
        />
      )}
    </div>
  );
};
