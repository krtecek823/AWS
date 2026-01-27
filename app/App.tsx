import { useState } from 'react';
import { GameMenu } from '@/app/components/GameMenu';
import KiroPuzzleGame from '@/app/components/KiroPuzzleGame';
import { MemoryCardGame } from '@/app/components/MemoryCardGame';
import { NumberSequenceGame } from '@/app/components/NumberSequenceGame';
import { MathGame } from '@/app/components/MathGame';
import { ColorGame } from '@/app/components/ColorGame';

export type GameType = 'menu' | 'memory' | 'sequence' | 'math' | 'color' | 'kiro';

export default function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [totalScore, setTotalScore] = useState(0);

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
  };

  const handleBackToMenu = () => {
    setCurrentGame('menu');
  };

  const handleScoreUpdate = (score: number) => {
    setTotalScore((prev) => prev + score);
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center p-4">
      {currentGame === 'menu' && (
        <GameMenu onGameSelect={handleGameSelect} totalScore={totalScore} />
      )}
      {currentGame === 'memory' && (
        <MemoryCardGame onBack={handleBackToMenu} onScoreUpdate={handleScoreUpdate} />
      )}
      {currentGame === 'sequence' && (
        <NumberSequenceGame onBack={handleBackToMenu} onScoreUpdate={handleScoreUpdate} />
      )}
      {currentGame === 'math' && (
        <MathGame onBack={handleBackToMenu} onScoreUpdate={handleScoreUpdate} />
      )}
      {currentGame === 'color' && (
        <ColorGame onBack={handleBackToMenu} onScoreUpdate={handleScoreUpdate} />
      )}
      {currentGame === 'kiro' && (
        <KiroPuzzleGame onBack={handleBackToMenu} onScoreUpdate={handleScoreUpdate} />
      )}
    </div>
  );
}