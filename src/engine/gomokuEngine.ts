import { BoardGrid, CellValue, Player, WinningLine, AIDifficulty, Move, BlunderAnalysisItem } from '../types/game';

export const BOARD_SIZE = 15;

export const DIRECTIONS: [number, number][] = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal \
  [1, -1],  // diagonal /
];

// Center-biased position weights to naturally favor center dominance
export const POSITION_WEIGHTS: number[][] = Array.from({ length: BOARD_SIZE }, (_, r) =>
  Array.from({ length: BOARD_SIZE }, (_, c) => {
    const center = (BOARD_SIZE - 1) / 2;
    const dist = Math.max(Math.abs(r - center), Math.abs(c - center));
    return Math.max(1, 10 - Math.floor(dist * 1.2));
  })
);

export function createEmptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map(row => [...row]);
}

export function isValidCell(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

/**
 * Checks for 5-in-a-row winner on the board.
 */
export function checkWin(board: BoardGrid): WinningLine | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const player = board[r][c];
      if (!player) continue;

      // Check all 4 directions
      const dirConfigs: { dir: [number, number]; name: WinningLine['direction'] }[] = [
        { dir: [0, 1], name: 'horizontal' },
        { dir: [1, 0], name: 'vertical' },
        { dir: [1, 1], name: 'diagonal-main' },
        { dir: [1, -1], name: 'diagonal-anti' },
      ];

      for (const { dir, name } of dirConfigs) {
        const [dr, dc] = dir;
        const line: [number, number][] = [[r, c]];

        for (let step = 1; step < 5; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (isValidCell(nr, nc) && board[nr][nc] === player) {
            line.push([nr, nc]);
          } else {
            break;
          }
        }

        if (line.length >= 5) {
          return {
            cells: line,
            player,
            direction: name,
          };
        }
      }
    }
  }
  return null;
}

export function isBoardFull(board: BoardGrid): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

// Gomoku Pattern Scores
const PATTERN_SCORES = {
  FIVE: 10000000,
  OPEN_FOUR: 1000000,
  BLOCKED_FOUR: 100000,
  OPEN_THREE: 50000,
  BLOCKED_THREE: 2000,
  OPEN_TWO: 1000,
  BLOCKED_TWO: 100,
};

/**
 * Evaluates line pattern for a player in a specific direction from a starting point
 */
function evaluateDirectionPattern(
  board: BoardGrid,
  r: number,
  c: number,
  dr: number,
  dc: number,
  player: Player
): number {
  const opponent: Player = player === 'X' ? 'O' : 'X';
  let count = 0;
  let openEnds = 0;

  // Check forward
  let step = 1;
  while (isValidCell(r + dr * step, c + dc * step) && board[r + dr * step][c + dc * step] === player) {
    count++;
    step++;
  }
  if (isValidCell(r + dr * step, c + dc * step) && board[r + dr * step][c + dc * step] === null) {
    openEnds++;
  }

  // Check backward
  step = 1;
  while (isValidCell(r - dr * step, c - dc * step) && board[r - dr * step][c - dc * step] === player) {
    count++;
    step++;
  }
  if (isValidCell(r - dr * step, c - dc * step) && board[r - dr * step][c - dc * step] === null) {
    openEnds++;
  }

  // count is other stones in row; total stones = count + 1
  const total = count + 1;

  if (total >= 5) return PATTERN_SCORES.FIVE;
  if (total === 4) {
    return openEnds === 2 ? PATTERN_SCORES.OPEN_FOUR : openEnds === 1 ? PATTERN_SCORES.BLOCKED_FOUR : 0;
  }
  if (total === 3) {
    return openEnds === 2 ? PATTERN_SCORES.OPEN_THREE : openEnds === 1 ? PATTERN_SCORES.BLOCKED_THREE : 0;
  }
  if (total === 2) {
    return openEnds === 2 ? PATTERN_SCORES.OPEN_TWO : openEnds === 1 ? PATTERN_SCORES.BLOCKED_TWO : 0;
  }
  return 0;
}

/**
 * Calculate heuristic score for placing a stone at (r, c)
 */
export function evaluatePoint(board: BoardGrid, r: number, c: number, player: Player): number {
  if (board[r][c] !== null) return 0;

  const opponent: Player = player === 'X' ? 'O' : 'X';
  let myScore = 0;
  let oppScore = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const pScore = evaluateDirectionPattern(board, r, c, dr, dc, player);
    const oScore = evaluateDirectionPattern(board, r, c, dr, dc, opponent);

    myScore += pScore;
    oppScore += oScore;
  }

  // Defend against immediate win or open 4 with high priority
  if (oppScore >= PATTERN_SCORES.FIVE) oppScore *= 1.8;
  if (oppScore >= PATTERN_SCORES.OPEN_FOUR) oppScore *= 1.5;

  // Add subtle positional center weight
  const posBonus = POSITION_WEIGHTS[r][c];

  return myScore + oppScore * 1.15 + posBonus;
}

/**
 * Get candidate moves near existing stones to reduce branching factor dramatically
 */
export function getCandidateMoves(board: BoardGrid, radius = 2): { r: number; c: number; score: number }[] {
  const candidates: Map<string, { r: number; c: number }> = new Map();
  let hasStones = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        hasStones = true;
        // Search surrounding neighbors
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (isValidCell(nr, nc) && board[nr][nc] === null) {
              const key = `${nr},${nc}`;
              if (!candidates.has(key)) {
                candidates.set(key, { r: nr, c: nc });
              }
            }
          }
        }
      }
    }
  }

  // If board is empty, open in center
  if (!hasStones) {
    const center = Math.floor(BOARD_SIZE / 2);
    return [{ r: center, c: center, score: 100 }];
  }

  // Score candidate moves for fast move ordering
  const scoredCandidates: { r: number; c: number; score: number }[] = [];
  for (const { r, c } of candidates.values()) {
    // Quick evaluate from perspective of player 'O' (or 'X')
    const score = evaluatePoint(board, r, c, 'O');
    scoredCandidates.push({ r, c, score });
  }

  scoredCandidates.sort((a, b) => b.score - a.score);
  return scoredCandidates;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimaxAlphaBeta(
  board: BoardGrid,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  const win = checkWin(board);
  if (win) {
    return win.player === aiPlayer ? 100000000 + depth : -100000000 - depth;
  }
  if (depth <= 0 || isBoardFull(board)) {
    return evaluateBoardTotal(board, aiPlayer);
  }

  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const currentPlayer = isMaximizing ? aiPlayer : humanPlayer;
  const candidates = getCandidateMoves(board, 1).slice(0, 10); // prune to top 10

  if (candidates.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of candidates) {
      board[move.r][move.c] = currentPlayer;
      const evaluation = minimaxAlphaBeta(board, depth - 1, alpha, beta, false, aiPlayer);
      board[move.r][move.c] = null;

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of candidates) {
      board[move.r][move.c] = currentPlayer;
      const evaluation = minimaxAlphaBeta(board, depth - 1, alpha, beta, true, aiPlayer);
      board[move.r][move.c] = null;

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Board overall evaluation
 */
function evaluateBoardTotal(board: BoardGrid, aiPlayer: Player): number {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  let aiTotal = 0;
  let humanTotal = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === aiPlayer) {
        aiTotal += POSITION_WEIGHTS[r][c];
      } else if (board[r][c] === humanPlayer) {
        humanTotal += POSITION_WEIGHTS[r][c];
      }
    }
  }

  return aiTotal - humanTotal;
}

/**
 * Main AI decision engine
 */
export function getSuggestedMove(
  board: BoardGrid,
  player: Player,
  difficulty: AIDifficulty = 'hard'
): { row: number; col: number; score: number } {
  const candidates = getCandidateMoves(board, 2);
  if (candidates.length === 0) {
    const center = Math.floor(BOARD_SIZE / 2);
    return { row: center, col: center, score: 0 };
  }

  const opponent: Player = player === 'X' ? 'O' : 'X';

  // 1. Instant check: Can AI win this turn? (5-in-a-row)
  for (const move of candidates) {
    board[move.r][move.c] = player;
    const win = checkWin(board);
    board[move.r][move.c] = null;
    if (win) {
      return { row: move.r, col: move.c, score: PATTERN_SCORES.FIVE };
    }
  }

  // 2. Instant check: Must AI block human's immediate win? (human has 4 in a row)
  for (const move of candidates) {
    board[move.r][move.c] = opponent;
    const humanWin = checkWin(board);
    board[move.r][move.c] = null;
    if (humanWin) {
      return { row: move.r, col: move.c, score: PATTERN_SCORES.OPEN_FOUR };
    }
  }

  // Difficulty adjustment
  if (difficulty === 'easy') {
    // 40% random mistake, shallow search
    if (Math.random() < 0.35 && candidates.length > 2) {
      const idx = Math.min(candidates.length - 1, 1 + Math.floor(Math.random() * 3));
      return { row: candidates[idx].r, col: candidates[idx].c, score: candidates[idx].score };
    }
    return { row: candidates[0].r, col: candidates[0].c, score: candidates[0].score };
  }

  if (difficulty === 'medium') {
    // Top 3 heuristic evaluation
    const topCandidates = candidates.slice(0, 4);
    // Add small random noise to prevent identical games
    topCandidates.forEach(c => {
      c.score += Math.random() * 50;
    });
    topCandidates.sort((a, b) => b.score - a.score);
    return { row: topCandidates[0].r, col: topCandidates[0].c, score: topCandidates[0].score };
  }

  // For Hard and Grandmaster: Minimax Alpha-Beta on top candidates
  const searchDepth = difficulty === 'grandmaster' ? 3 : 2;
  const pool = candidates.slice(0, difficulty === 'grandmaster' ? 12 : 8);

  let bestMove = pool[0];
  let bestScore = -Infinity;

  for (const move of pool) {
    board[move.r][move.c] = player;
    const evalScore = minimaxAlphaBeta(board, searchDepth, -Infinity, Infinity, false, player);
    board[move.r][move.c] = null;

    const totalScore = evalScore + move.score * 0.2;
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMove = move;
    }
  }

  return { row: bestMove.r, col: bestMove.c, score: bestScore };
}

/**
 * Analyzes a completed game step-by-step to identify blunders and brilliant moves.
 */
export function analyzeBlunders(history: Move[]): BlunderAnalysisItem[] {
  const analysis: BlunderAnalysisItem[] = [];
  const testBoard = createEmptyBoard();

  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const prevBoard = cloneBoard(testBoard);

    // Compute what the optimal move would have been BEFORE this move
    const suggested = getSuggestedMove(prevBoard, move.player, 'medium');

    testBoard[move.row][move.col] = move.player;
    const didWin = checkWin(testBoard);

    // If played move was winning
    if (didWin) {
      analysis.push({
        moveNumber: i + 1,
        move,
        severity: 'brilliant',
        evalDelta: 5000,
        description: `Nước đi quyết định chiến thắng ${move.player}! Chuỗi 5 cờ hoàn hảo.`,
      });
      continue;
    }

    // Check if player missed a direct block of opponent's open 4 or missed their own win
    const missedWin = (suggested.row !== move.row || suggested.col !== move.col) && suggested.score >= PATTERN_SCORES.FIVE;
    const missedBlock = (suggested.row !== move.row || suggested.col !== move.col) && suggested.score >= PATTERN_SCORES.OPEN_FOUR;

    if (missedWin) {
      analysis.push({
        moveNumber: i + 1,
        move,
        severity: 'blunder',
        evalDelta: -4000,
        description: `Bỏ lỡ cơ hội kết liễu trận đấu! Nước tối ưu tại (${String.fromCharCode(65 + suggested.col)}${suggested.row + 1}).`,
        betterMove: { row: suggested.row, col: suggested.col },
      });
    } else if (missedBlock) {
      analysis.push({
        moveNumber: i + 1,
        move,
        severity: 'blunder',
        evalDelta: -3000,
        description: `Bỏ qua mối đe dọa 4 cờ đối thủ! Cần chặn ngay tại (${String.fromCharCode(65 + suggested.col)}${suggested.row + 1}).`,
        betterMove: { row: suggested.row, col: suggested.col },
      });
    } else if (i > 4 && (suggested.row !== move.row || suggested.col !== move.col) && suggested.score > 40000) {
      analysis.push({
        moveNumber: i + 1,
        move,
        severity: 'mistake',
        evalDelta: -1200,
        description: `Nước đi hơi bị động. Điểm (${String.fromCharCode(65 + suggested.col)}${suggested.row + 1}) tạo thế 3 cờ đôi lợi thế hơn.`,
        betterMove: { row: suggested.row, col: suggested.col },
      });
    }
  }

  return analysis;
}
