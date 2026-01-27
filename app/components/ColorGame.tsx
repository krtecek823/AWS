import { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

interface ColorGameProps {
  onBack: () => void;
  onScoreUpdate: (score: number) => void;
}

type ColorName = '빨강' | '파랑' | '노랑' | '초록';
type ColorValue = 'red' | 'blue' | 'yellow' | 'green';

interface ColorQuestion {
  text: ColorName;
  color: ColorValue;
  correctColor: ColorValue;
}

const colorMap: Record<ColorName, ColorValue> = {
  빨강: 'red',
  파랑: 'blue',
  노랑: 'yellow',
  초록: 'green',
};

const colorNames: ColorName[] = ['빨강', '파랑', '노랑', '초록'];

const colorStyles: Record<ColorValue, string> = {
  red: 'text-red-600',
  blue: 'text-[#0064FF]',
  yellow: 'text-yellow-600',
  green: 'text-green-600',
};

const buttonColors: Record<ColorValue, string> = {
  red: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
  blue: 'bg-[#0064FF] hover:bg-[#0055DD] active:bg-[#0047BB]',
  yellow: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
  green: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
};

const colorLabels: Record<ColorValue, string> = {
  red: '빨강',
  blue: '파랑',
  yellow: '노랑',
  green: '초록',
};

export function ColorGame({ onBack, onScoreUpdate }: ColorGameProps) {
  const [question, setQuestion] = useState<ColorQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameActive, setIsGameActive] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = (): ColorQuestion => {
    const text = colorNames[Math.floor(Math.random() * colorNames.length)];
    const color = Object.values(colorMap)[Math.floor(Math.random() * colorNames.length)] as ColorValue;
    
    return {
      text,
      color,
      correctColor: color,
    };
  };

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setTimeLeft(45);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedback(null);
    setQuestion(generateQuestion());
  };

  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isGameActive) {
      setIsGameActive(false);
    }
  }, [isGameActive, timeLeft]);

  const handleAnswer = (selectedColor: ColorValue) => {
    if (!question) return;

    const isCorrect = selectedColor === question.correctColor;
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      const points = 5;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      onScoreUpdate(points);
    } else {
      setWrongCount((prev) => prev + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      setQuestion(generateQuestion());
    }, 400);
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
          <h2 className="text-2xl mb-2">색상 인식</h2>
          {!isGameActive ? (
            <p className="text-gray-600">글자가 아닌 색상을 빠르게 선택하세요</p>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0064FF]" />
              <span className={timeLeft <= 10 ? 'text-red-500' : ''}>
                {timeLeft}초
              </span>
            </div>
          )}
        </div>

        {!isGameActive && timeLeft === 45 ? (
          <div className="text-center py-8">
            <div className="bg-blue-50 border border-[#0064FF] rounded-2xl p-6 mb-6">
              <p className="text-sm mb-4">
                <strong>스트룹 효과 훈련</strong>
              </p>
              <p className="text-gray-700 mb-3 text-sm">
                화면에 표시되는 <strong>글자의 색상</strong>을 선택하세요
              </p>
              <div className="bg-white rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-600">예시</p>
                <p className="text-[#0064FF] text-2xl">빨강 ← 파랑 선택!</p>
                <p className="text-red-600 text-2xl">파랑 ← 빨강 선택!</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-[#0064FF] text-white rounded-2xl hover:bg-[#0055DD] transition-colors active:scale-95 text-lg"
            >
              시작하기
            </button>
          </div>
        ) : !isGameActive && timeLeft === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-3xl mb-6">완료!</h3>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">최종 점수</span>
                  <span className="text-2xl">{score}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">정답</span>
                  <span className="text-green-600">{correctCount}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">오답</span>
                  <span className="text-red-600">{wrongCount}개</span>
                </div>
                {correctCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">정확도</span>
                    <span>{Math.round((correctCount / (correctCount + wrongCount)) * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-[#0064FF] text-white rounded-2xl hover:bg-[#0055DD] transition-colors active:scale-95"
            >
              다시 시작
            </button>
          </div>
        ) : (
          question && (
            <div>
              <div className="flex items-center justify-center gap-6 mb-6 text-sm">
                <div className="text-green-600">정답 {correctCount}</div>
                <div className="text-red-600">오답 {wrongCount}</div>
              </div>

              <div
                className={`rounded-2xl p-16 mb-8 transition-all ${
                  feedback === 'correct'
                    ? 'bg-blue-50 border-2 border-[#0064FF]'
                    : feedback === 'wrong'
                    ? 'bg-red-50 border-2 border-red-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className={`text-center text-7xl ${colorStyles[question.color]}`}>
                  {question.text}
                </div>
              </div>

              <div className="text-center mb-4 text-sm text-gray-600">
                이 글자의 <strong>색상</strong>은?
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(colorMap) as ColorName[]).map((colorName) => {
                  const colorValue = colorMap[colorName];
                  return (
                    <button
                      key={colorValue}
                      onClick={() => handleAnswer(colorValue)}
                      disabled={!isGameActive}
                      className={`py-6 text-white rounded-2xl transition-all active:scale-95 text-lg ${
                        buttonColors[colorValue]
                      } disabled:opacity-50`}
                    >
                      {colorLabels[colorValue]}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
