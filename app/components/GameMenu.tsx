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
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold mb-2">두뇌 게임</h1>
          {userInfo && (
            <p className="text-lg text-gray-600">
              {userInfo.name}님의 두뇌를 훈련해보세요
            </p>
          )}
          {!userInfo && (
            <p className="text-lg text-gray-600">
              매일 조금씩 두뇌를 훈련해보세요
            </p>
          )}
        </div>
        {onBack && <div className="w-10"></div>}
      </div>

      {/* 점수 표시 */}
      {totalScore > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-gray-600 mb-2">누적 점수</div>
              <div className="text-3xl font-bold text-gray-800">{totalScore.toLocaleString()}</div>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>
      )}

      {/* 게임 목록 */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onGameSelect(game.id)}
              className="w-full bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 active:scale-95"
            >
              <div className="flex items-center gap-5">
                <div className={`${game.bgColor} rounded-xl p-5 flex-shrink-0`}>
                  <Icon className={`w-8 h-8 ${game.iconColor}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="text-2xl font-semibold text-gray-800 mb-3">{game.title}</div>
                  <div className="text-lg text-gray-500">{game.description}</div>
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

      {/* 하단 메시지 */}
      <div className="text-center py-4 border-t border-gray-100 mt-4">
        <p className="text-base text-gray-500 font-medium">
          매일 5분씩 두뇌 훈련으로 인지 능력을 향상시키세요
        </p>
      </div>
    </div>
  );
}
