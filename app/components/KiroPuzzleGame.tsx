import React, { useEffect, useRef, useState } from "react";
import { saveGameResult } from '@/lib/gameStats';

type GameProps = {
  onBack: () => void;
  userInfo: { name: string; id: string };
};

type Cell = number | null;
type Block = { x: number; y: number };
type PieceTemplate = {
  id: number;
  name: string;
  color: string;
  blocks: Block[];
};

type Piece = PieceTemplate & {
  placed: boolean;
};

type PreviewCell = { r: number; c: number };

const BOARD_SIZE = 4;
const CELL_PX = 64; // 보드 셀 크기(가독성)
const GAP_PX = 6;

const solutionPatterns: number[][][] = [
  [
    [1, 1, 2, 2],
    [1, 3, 3, 2],
    [4, 3, 3, 5],
    [4, 4, 5, 5],
  ],
  [
    [1, 1, 1, 2],
    [3, 4, 4, 2],
    [3, 4, 4, 2],
    [3, 5, 5, 5],
  ],
  [
    [1, 2, 2, 2],
    [1, 3, 4, 4],
    [1, 3, 5, 5],
    [6, 3, 3, 5],
  ],
  [
    [1, 1, 2, 3],
    [4, 4, 2, 3],
    [5, 4, 2, 3],
    [5, 5, 6, 6],
  ],
  [
    [1, 1, 1, 1],
    [2, 2, 3, 4],
    [5, 2, 3, 4],
    [5, 5, 3, 4],
  ],
  [
    [1, 2, 2, 3],
    [1, 4, 4, 3],
    [1, 5, 6, 3],
    [7, 5, 6, 6],
  ],
  [
    [1, 1, 2, 2],
    [3, 1, 4, 2],
    [3, 5, 4, 6],
    [3, 5, 5, 6],
  ],
  [
    [1, 2, 3, 3],
    [1, 2, 4, 5],
    [1, 2, 4, 5],
    [6, 6, 4, 5],
  ],
];

const COLORS = [
  "#FF5722",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#607D8B",
  "#795548",
  "#009688",
];

const NAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];

function emptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, () => 
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

function generatePiecesFromSolution(pattern: number[][]): PieceTemplate[] {
  const pieces: Record<number, { x: number; y: number }[]> = {};
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const pieceId = pattern[y][x];
      if (!pieces[pieceId]) pieces[pieceId] = [];
      pieces[pieceId].push({ x, y });
    }
  }

  const ids = Object.keys(pieces)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  return ids.map((id, idx) => {
    const blocks = pieces[id];
    const minX = Math.min(...blocks.map((b) => b.x));
    const minY = Math.min(...blocks.map((b) => b.y));
    const relativeBlocks = blocks.map((b) => ({ 
      x: b.x - minX, 
      y: b.y - minY 
    }));

    return {
      id,
      name: NAMES[idx] ?? String.fromCharCode(65 + idx),
      color: COLORS[idx % COLORS.length],
      blocks: relativeBlocks,
    };
  });
}

function isInsideBoard(r: number, c: number) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export default function KiroPuzzleGame({ onBack, userInfo }: GameProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [patternIndex, setPatternIndex] = useState<number>(0); // 0-based
  const [currentPattern, setCurrentPattern] = useState<number[][]>(solutionPatterns[0]);
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard());
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [score, setScore] = useState(0);
  const [previewCells, setPreviewCells] = useState<PreviewCell[]>([]);
  const [previewValid, setPreviewValid] = useState<boolean | null>(null);
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [completed, setCompleted] = useState(false);

  // const placedIds = useMemo(
  //   () => new Set(pieces.filter((p) => p.placed).map((p) => p.id)),
  //   [pieces]
  // );

  function applyScore(nextScore: number) {
    setScore(nextScore);
  }

  function resetToNewPattern() {
    const idx = Math.floor(Math.random() * solutionPatterns.length);
    const pattern = solutionPatterns[idx];
    const templates = generatePiecesFromSolution(pattern);

    setPatternIndex(idx);
    setCurrentPattern(pattern);
    setBoard(emptyBoard());
    setPieces(templates.map((t) => ({ ...t, placed: false })));
    setPreviewCells([]);
    setPreviewValid(null);
    setDraggingPieceId(null);
    setDragPos(null);
    setCompleted(false);

    // 점수는 "절대값"이 아니라 delta로 App에 반영해야 해서, 0으로 만들면서 delta 처리
    applyScore(0);
  }

  useEffect(() => {
    // 첫 로드: 랜덤 패턴 시작
    resetToNewPattern();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function canPlacePiece(
    piece: Piece,
    originR: number,
    originC: number,
    targetBoard: Cell[][]
  ) {
    return piece.blocks.every((b) => {
      const r = originR + b.y;
      const c = originC + b.x;
      return isInsideBoard(r, c) && targetBoard[r][c] === null;
    });
  }

  function computePreview(piece: Piece, originR: number, originC: number) {
    const cells: PreviewCell[] = [];
    for (const b of piece.blocks) {
      const r = originR + b.y;
      const c = originC + b.x;
      if (isInsideBoard(r, c)) cells.push({ r, c });
    }
    return cells;
  }

  function placePiece(piece: Piece, originR: number, originC: number) {
    setBoard((prev) => {
      const next = prev.map((row) => row.slice());
      for (const b of piece.blocks) {
        const r = originR + b.y;
        const c = originC + b.x;
        next[r][c] = piece.id;
      }
      return next;
    });

    setPieces((prev) =>
      prev.map((p) => (p.id === piece.id ? { ...p, placed: true } : p))
    );

    const gained = piece.blocks.length * 10;
    applyScore(score + gained);
  }

  function removePieceFromBoard(pieceId: number) {
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece || !piece.placed) return;

    setBoard((prev) => {
      const next = prev.map((row) => row.slice());
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (next[r][c] === pieceId) next[r][c] = null;
        }
      }
      return next;
    });

    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, placed: false } : p))
    );

    const lost = piece.blocks.length * 10;
    applyScore(Math.max(0, score - lost));
    setCompleted(false);
  }

  function isBoardComplete(b: Cell[][]) {
    return b.every((row) => row.every((cell) => cell !== null));
  }

  // board 상태가 바뀔 때 완성 체크
  useEffect(() => {
    if (isBoardComplete(board) && !completed) {
      setCompleted(true);
      
      // 게임 완료 시 통계 저장
      const accuracy = 100; // 퍼즐 완성 시 100% 정확도
      const gameScore = score;
      
      saveGameResult(userInfo.id, {
        gameName: 'Kiro 퍼즐',
        score: gameScore,
        accuracy: accuracy
      });
    }
  }, [board, completed, score, userInfo.id]);

  function getBoardCellAtPointer(clientX: number, clientY: number) {
    const el = boardRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

    const cellW = CELL_PX + GAP_PX;
    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellW);

    if (!isInsideBoard(r, c)) return null;
    return { r, c };
  }

  function clearPreview() {
    setPreviewCells([]);
    setPreviewValid(null);
  }

  function handlePointerDown(e: React.PointerEvent, pieceId: number) {
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece || piece.placed) return;

    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();

    dragOffsetRef.current = { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    };
    dragPointerRef.current = { x: e.clientX, y: e.clientY };

    setDraggingPieceId(pieceId);
    setDragPos({ 
      x: e.clientX - dragOffsetRef.current.x, 
      y: e.clientY - dragOffsetRef.current.y 
    });

    // pointer capture
    target.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (draggingPieceId == null) return;

    dragPointerRef.current = { x: e.clientX, y: e.clientY };
    setDragPos({ 
      x: e.clientX - dragOffsetRef.current.x, 
      y: e.clientY - dragOffsetRef.current.y 
    });

    const piece = pieces.find((p) => p.id === draggingPieceId);
    if (!piece) return;

    const cell = getBoardCellAtPointer(e.clientX, e.clientY);
    if (!cell) {
      clearPreview();
      return;
    }

    const ok = canPlacePiece(piece, cell.r, cell.c, board);
    setPreviewValid(ok);
    setPreviewCells(computePreview(piece, cell.r, cell.c));
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (draggingPieceId == null) return;

    const piece = pieces.find((p) => p.id === draggingPieceId);
    const cell = getBoardCellAtPointer(e.clientX, e.clientY);

    if (piece && cell) {
      const ok = canPlacePiece(piece, cell.r, cell.c, board);
      if (ok) placePiece(piece, cell.r, cell.c);
    }

    setDraggingPieceId(null);
    setDragPos(null);
    clearPreview();
  }

  function showHint() {
    window.alert(
      `💡 힌트 (패턴 ${patternIndex + 1})\n` +
      `• 4x4(16칸) 보드를 모든 조각으로 채우면 완성!\n` +
      `• 드래그 중 초록색은 배치 가능, 빨간색은 불가능\n` +
      `• 보드에 놓인 조각은 셀을 클릭하면 회수 가능\n` +
      `• 막히면 '정답 보기'를 눌러 배치를 관찰해봐!`
    );
  }

  function showSolution() {
    const ok = window.confirm(
      "정답을 보시겠습니까? 현재 진행 상태가 정답 배치로 바뀝니다."
    );
    if (!ok) return;

    // board를 정답으로 세팅
    setBoard(currentPattern.map((row) => row.slice()));
    setPieces((prev) => prev.map((p) => ({ ...p, placed: true })));

    // 정답 점수(16칸*10)
    applyScore(16 * 10);
    setCompleted(true);

    window.alert(
      `🎯 패턴 ${patternIndex + 1} 정답 배치입니다.\n각 조각의 위치를 잘 관찰해보세요!`
    );
  }

  const availablePieces = pieces.filter((p) => !p.placed);

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-6">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition"
          >
            ← 메뉴
          </button>
          <div>
            <div className="text-2xl font-semibold">🧩 Kiro Puzzle</div>
            <div className="text-sm text-muted-foreground">
              패턴: <span className="font-medium text-foreground">{patternIndex + 1}</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold shadow">
          점수: <span className="tabular-nums">{score}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full max-w-5xl rounded-xl border border-border bg-card p-4 mb-6">
        <div className="font-semibold mb-2">🎮 게임 방법</div>
        <div className="text-sm text-muted-foreground leading-relaxed">
          랜덤 생성된 조각을 드래그해서 4×4 보드를 완전히 채워보세요. 드래그 중{" "}
          <span className="font-medium text-foreground">초록색</span>은 배치 가능,{" "}
          <span className="font-medium text-foreground">빨간색</span>은 불가능! 보드에 놓인 조각은 해당 셀을
          클릭하면 회수할 수 있어요.
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Board */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="font-semibold mb-3">보드</div>
          <div className="flex justify-center">
            <div
              ref={boardRef}
              className="select-none rounded-xl bg-zinc-900 p-3 inline-block"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_PX}px)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_PX}px)`,
                gap: `${GAP_PX}px`,
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {board.flatMap((row, r) =>
                row.map((cell, c) => {
                  const piece = cell ? pieces.find((p) => p.id === cell) : null;
                  const inPreview = previewCells.some((pc) => pc.r === r && pc.c === c);

                  const baseStyle: React.CSSProperties = piece
                    ? { backgroundColor: piece.color, color: "white" }
                    : { backgroundColor: "#f3f4f6", color: "#9ca3af" };

                  const previewStyle: React.CSSProperties | undefined = inPreview
                    ? previewValid
                      ? { 
                          outline: "2px dashed #22c55e", 
                          backgroundColor: "rgba(34,197,94,0.25)" 
                        }
                      : { 
                          outline: "2px dashed #ef4444", 
                          backgroundColor: "rgba(239,68,68,0.25)" 
                        }
                    : undefined;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={[
                        "rounded-md flex items-center justify-center font-bold transition",
                        piece ? "cursor-pointer hover:scale-[1.03]" : "",
                      ].join(" ")}
                      style={{ ...baseStyle, ...previewStyle }}
                      title={piece ? `${piece.name} 조각 (클릭하여 회수)` : ""}
                      onClick={() => {
                        if (cell) removePieceFromBoard(cell);
                      }}
                    >
                      {piece ? piece.name : "·"}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={resetToNewPattern}
              className="px-4 py-2 rounded-full bg-orange-600 text-white font-semibold shadow hover:brightness-110 transition"
            >
              🔄 새 게임
            </button>
            <button
              onClick={showHint}
              className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:brightness-110 transition"
            >
              💡 힌트
            </button>
            <button
              onClick={showSolution}
              className="px-4 py-2 rounded-full bg-pink-600 text-white font-semibold shadow hover:brightness-110 transition"
            >
              🎯 정답 보기
            </button>
          </div>
        </div>

        {/* Pieces */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="font-semibold mb-3">조각</div>
          <div className="text-sm text-muted-foreground mb-3 text-center">
            남은 조각: <span className="font-medium text-foreground">{availablePieces.length}</span> /{" "}
            {pieces.length}
          </div>
          <div className="relative">
            <div className="flex flex-wrap justify-center gap-3">
              {availablePieces.map((p) => {
                const width = (Math.max(...p.blocks.map((b) => b.x)) + 1) * 34;
                const height = (Math.max(...p.blocks.map((b) => b.y)) + 1) * 34;
                const isDragging = draggingPieceId === p.id;

                return (
                  <div
                    key={p.id}
                    className={[
                      "relative rounded-lg border border-border bg-background shadow-sm",
                      "cursor-grab active:cursor-grabbing transition",
                      isDragging ? "opacity-20" : "hover:scale-[1.02]",
                    ].join(" ")}
                    style={{ 
                      width: Math.max(110, width + 10), 
                      height: Math.max(80, height + 10) 
                    }}
                    onPointerDown={(e) => handlePointerDown(e, p.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    title={`조각 ${p.name}`}
                  >
                    {p.blocks.map((b, idx) => (
                      <div
                        key={idx}
                        className="absolute rounded-md flex items-center justify-center text-[11px] font-black text-white"
                        style={{
                          left: 8 + b.x * 34,
                          top: 8 + b.y * 34,
                          width: 30,
                          height: 30,
                          backgroundColor: p.color,
                          border: "2px solid rgba(255,255,255,0.85)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Drag Ghost */}
            {draggingPieceId != null && dragPos && (() => {
              const p = pieces.find((x) => x.id === draggingPieceId);
              if (!p) return null;

              const width = (Math.max(...p.blocks.map((b) => b.x)) + 1) * 34;
              const height = (Math.max(...p.blocks.map((b) => b.y)) + 1) * 34;

              return (
                <div
                  className="fixed z-[9999] pointer-events-none"
                  style={{ 
                    left: dragPos.x, 
                    top: dragPos.y, 
                    width: Math.max(110, width + 10), 
                    height: Math.max(80, height + 10) 
                  }}
                >
                  <div className="relative rounded-lg border border-white/40 bg-white/10 backdrop-blur-sm shadow-lg">
                    {p.blocks.map((b, idx) => (
                      <div
                        key={idx}
                        className="absolute rounded-md flex items-center justify-center text-[11px] font-black text-white"
                        style={{
                          left: 8 + b.x * 34,
                          top: 8 + b.y * 34,
                          width: 30,
                          height: 30,
                          backgroundColor: p.color,
                          border: "2px solid rgba(255,255,255,0.85)",
                          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {completed && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white text-zinc-900 p-6 shadow-xl">
            <div className="text-2xl font-extrabold text-emerald-600 mb-2">🎉 축하합니다!</div>
            <div className="text-sm text-zinc-600 mb-4">퍼즐을 완성했습니다!</div>
            <div className="rounded-xl bg-zinc-50 p-4 mb-5">
              <div className="text-sm text-zinc-600">최종 점수</div>
              <div className="text-3xl font-black tabular-nums">{score}점</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // 모달만 닫고 유지
                  setCompleted(false);
                }}
                className="flex-1 px-4 py-2 rounded-full bg-zinc-200 font-semibold hover:bg-zinc-300 transition"
              >
                확인
              </button>
              <button
                onClick={() => {
                  setCompleted(false);
                  resetToNewPattern();
                }}
                className="flex-1 px-4 py-2 rounded-full bg-orange-600 text-white font-semibold hover:brightness-110 transition"
              >
                새 게임
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}