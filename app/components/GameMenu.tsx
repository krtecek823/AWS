import { Brain, Calculator, Palette, Puzzle, ArrowLeft } from 'lucide-react';
import type { GameType } from '@/app/App';

interface GameMenuProps {
  onGameSelect: (game: GameType) => void;
  totalScore: number;
  userInfo?: { name: string; id: string };
  onBack?: () => void;
}

export function GameMenu({ onGameSelect, totalScore, userInfo, onBack }: GameMenuProps) {
  const games = [
    {
      id: 'memory' as GameType,
      title: '카드 매칭',
      description: '같은 그림 찾기',
      icon: Brain,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'sequence' as GameType,
      title: '숫자 기억',
      description: '순서대로 기억하기',
      icon: Brain,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'math' as GameType,
      title: '빠른 계산',
      description: '두뇌 활성화',
      icon: Calculator,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      id: 'color' as GameType,
      title: '색상 인식',
      description: '우뇌 자극 훈련',
      icon: Palette,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
    {
      id: 'kiro' as GameType,
      title: 'Kiro 퍼즐',
      description: '4x4 조각 맞추기',
      icon: Puzzle,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold mb-2">두뇌 훈련</h1>
          {userInfo && (
            <p className="text-gray-600">
              {userInfo.name}님의 두뇌를 훈련해보세요
            </p>
          )}
          {!userInfo && (
            <p className="text-gray-600">
              매일 조금씩 두뇌를 훈련해보세요
            </p>
          )}
        </div>
        {onBack && <div className="w-10"></div>}
      </div>

      {totalScore > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">누적 점수</div>
              <div className="text-3xl font-bold">{totalScore.toLocaleString()}</div>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onGameSelect(game.id)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className={`${game.bgColor} rounded-2xl p-4 flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${game.iconColor}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-lg font-semibold mb-1">{game.title}</div>
                  <div className="text-sm text-gray-500">{game.description}</div>
                </div>
                <div className="text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        매일 5분씩 두뇌 훈련으로 인지 능력을 향상시키세요
      </div>
    </div>
  );
}
