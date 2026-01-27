import { useState } from 'react';
import AuthPage from '@/app/components/AuthPage';
import HomePage from '@/app/components/HomePage';
import ChatbotPage from '@/app/components/ChatbotPage';
import Layout from '@/app/components/Layout';
import { GameMenu } from '@/app/components/GameMenu';
import KiroPuzzleGame from '@/app/components/KiroPuzzleGame';
import { MemoryCardGame } from '@/app/components/MemoryCardGame';
import { NumberSequenceGame } from '@/app/components/NumberSequenceGame';
import { MathGame } from '@/app/components/MathGame';
import { ColorGame } from '@/app/components/ColorGame';

export type GameType = 'menu' | 'memory' | 'sequence' | 'math' | 'color' | 'kiro';
type PageType = 'auth' | 'home' | 'chatbot' | 'braingame';

interface UserInfo {
  name: string;
  id: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('auth');
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  const handleLogin = (loginUserInfo: UserInfo) => {
    setUserInfo(loginUserInfo);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUserInfo(null);
    setCurrentPage('auth');
    setCurrentGame('menu');
    setTotalScore(0);
  };

  const handleChatbot = () => {
    setCurrentPage('chatbot');
  };

  const handleBrainGame = () => {
    setCurrentPage('braingame');
    setCurrentGame('menu');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setCurrentGame('menu');
  };

  const handleGameSelect = (game: GameType) => {
    setCurrentGame(game);
  };

  const handleBackToGameMenu = () => {
    setCurrentGame('menu');
  };

  const handleScoreUpdate = (score: number) => {
    setTotalScore((prev) => prev + score);
  };

  // 인증 페이지
  if (currentPage === 'auth') {
    return <AuthPage onLogin={handleLogin} />;
  }

  // 홈 페이지
  if (currentPage === 'home') {
    return (
      <HomePage 
        userInfo={userInfo!}
        onLogout={handleLogout}
        onChatbot={handleChatbot}
        onBrainGame={handleBrainGame}
      />
    );
  }

  // 챗봇 페이지
  if (currentPage === 'chatbot') {
    return (
      <ChatbotPage 
        userInfo={userInfo!}
        onBack={handleBackToHome}
      />
    );
  }

  // 두뇌 훈련 게임 페이지
  if (currentPage === 'braingame') {
    return (
      <Layout showMobileFrame={false}>
        <div className="max-w-4xl mx-auto">
          {currentGame === 'menu' && (
            <GameMenu 
              onGameSelect={handleGameSelect} 
              totalScore={totalScore} 
              userInfo={userInfo || undefined} 
              onBack={handleBackToHome}
            />
          )}
          {currentGame === 'memory' && (
            <MemoryCardGame onBack={handleBackToGameMenu} onScoreUpdate={handleScoreUpdate} />
          )}
          {currentGame === 'sequence' && (
            <NumberSequenceGame onBack={handleBackToGameMenu} onScoreUpdate={handleScoreUpdate} />
          )}
          {currentGame === 'math' && (
            <MathGame onBack={handleBackToGameMenu} onScoreUpdate={handleScoreUpdate} />
          )}
          {currentGame === 'color' && (
            <ColorGame onBack={handleBackToGameMenu} onScoreUpdate={handleScoreUpdate} />
          )}
          {currentGame === 'kiro' && (
            <KiroPuzzleGame onBack={handleBackToGameMenu} onScoreUpdate={handleScoreUpdate} />
          )}
        </div>
      </Layout>
    );
  }

  return null;
}