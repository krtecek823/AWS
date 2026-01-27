import { useState, useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';

interface NumberSequenceGameProps {
  onBack: () => void;
  onScoreUpdate: (score: number) => void;
}

type GameState = 'ready' | 'showing' | 'input' | 'result';

export function NumberSequenceGame({ onBack, onScoreUpdate }: NumberSequenceGameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [level, setLevel] = useState(3);
  const [score, setScore] = useState(0);
  const [showingIndex, setShowingIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateSequence = (length: number) => {
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    setSequence(newSequence);
  };

  const startGame = () => {
    generateSequence(level);
    setUserInput([]);
    setIsCorrect(null);
    setGameState('showing');
    setShowingIndex(0);
  };

  useEffect(() => {
    if (gameState === 'showing' && showingIndex < sequence.length) {
      const timer = setTimeout(() => {
        setShowingIndex((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingIndex >= sequence.length) {
      setTimeout(() => {
        setGameState('input');
      }, 500);
    }
  }, [gameState, showingIndex, sequence.length]);

  const handleNumberClick = (num: number) => {
    if (gameState !== 'input') return;
    
    const newInput = [...userInput, num];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      checkAnswer(newInput);
    }
  };

  const checkAnswer = (input: number[]) => {
    const correct = input.every((num, index) => num === sequence[index]);
    setIsCorrect(correct);
    setGameState('result');

    if (correct) {
      const points = level * 5;
      setScore((prev) => prev + points);
      onScoreUpdate(points);
      setTimeout(() => {
        setLevel((prev) => prev + 1);
        startGame();
      }, 2000);
    } else {
      setTimeout(() => {
        setLevel(3);
        setScore(0);
        setGameState('ready');
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="bg-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로</span>
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">점수</div>
            <div className="text-2xl">{score}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl mb-2">숫자 기억</h2>
          <p className="text-gray-600">레벨 {level} · {level}개 숫자</p>
        </div>

        {gameState === 'ready' && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 mb-6">
              <p className="text-gray-700 mb-4">
                숫자가 순서대로 나타나요
              </p>
              <p className="text-gray-700">
                잘 기억했다가 같은 순서로 입력해주세요
              </p>
            </div>
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#0064FF] text-white rounded-2xl hover:bg-[#0055DD] transition-colors active:scale-95 text-lg"
            >
              <Play className="w-6 h-6" />
              <span>시작하기</span>
            </button>
          </div>
        )}

        {gameState === 'showing' && (
          <div className="text-center py-16">
            <div className="text-8xl mb-4">
              {showingIndex < sequence.length ? sequence[showingIndex] : ''}
            </div>
            <div className="text-gray-500">
              {showingIndex + 1} / {sequence.length}
            </div>
          </div>
        )}

        {gameState === 'input' && (
          <div>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 min-h-24 flex items-center justify-center">
              <div className="text-3xl">
                {userInput.length > 0 ? userInput.join(' ') : '입력하세요'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="aspect-square rounded-2xl text-3xl bg-white border-2 border-gray-200 hover:border-[#0064FF] hover:bg-blue-50 transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center py-16">
            <div className={`text-7xl mb-4 ${isCorrect ? '' : ''}`}>
              {isCorrect ? '✓' : '✗'}
            </div>
            <p className="text-2xl mb-2">
              {isCorrect ? '정답이에요!' : '아쉬워요'}
            </p>
            {isCorrect ? (
              <p className="text-gray-600">다음 레벨로 이동해요</p>
            ) : (
              <div className="text-gray-600">
                <p className="mb-2">정답: {sequence.join(' ')}</p>
                <p>처음부터 다시 시작해요</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
