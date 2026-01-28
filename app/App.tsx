import { useState } from 'react';
import AuthPage from '@/app/components/AuthPage';
import HomePage from '@/app/components/HomePage';
import ChatbotPage from '@/app/components/ChatbotPage';
import Dashboard from '@/app/components/Dashboard';
import Layout from '@/app/components/Layout';
import InstallPrompt from '@/app/components/InstallPrompt';
import { GameMenu } from '@/app/components/GameMenu';
import KiroPuzzleGame from '@/app/components/KiroPuzzleGame';
import { MemoryCardGame } from '@/app/components/MemoryCardGame';
import { NumberSequenceGame } from '@/app/components/NumberSequenceGame';
import { MathGame } from '@/app/components/MathGame';
import { ColorGame } from '@/app/components/ColorGame';

export type GameType = 'menu' | 'memory' | 'sequence' | 'math' | 'color' | 'kiro';
type PageType = 'auth' | 'home' | 'chatbot' | 'braingame' | 'dashboard';

interface UserInfo {
  name: string;
  id: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('auth');
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);


  const handleLogin = (loginUserInfo: UserInfo) => {
    setUserInfo(loginUserInfo);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUserInfo(null);
    setCurrentPage('auth');
    setCurrentGame('menu');
  };

  const handleChatbot = () => {
    setCurrentPage('chatbot');
  };

  const handleBrainGame = () => {
    setCurrentPage('braingame');
    setCurrentGame('menu');
  };

  const handleDashboard = () => {
    setCurrentPage('dashboard');
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



  // 인증 페이지
  if (currentPage === 'auth') {
    return (
      <>
        <AuthPage onLogin={handleLogin} />
        <InstallPrompt />
      </>
    );
  }

  // 홈 페이지
  if (currentPage === 'home') {
    return (
      <>
        <HomePage 
          userInfo={userInfo!}
          onLogout={handleLogout}
          onChatbot={handleChatbot}
          onBrainGame={handleBrainGame}
          onDashboard={handleDashboard}
        />
        <InstallPrompt />
      </>
    );
  }

  // 대시보드 페이지
  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        userInfo={userInfo!}
        onBack={handleBackToHome}
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
      <Layout>
        <div className="h-full flex flex-col">
          {currentGame === 'menu' && (
            <GameMenu 
              onGameSelect={handleGameSelect} 
              userInfo={userInfo || undefined} 
              onBack={handleBackToHome}
            />
          )}
          {currentGame === 'memory' && (
            <MemoryCardGame onBack={handleBackToGameMenu} userInfo={userInfo!} />
          )}
          {currentGame === 'sequence' && (
            <NumberSequenceGame onBack={handleBackToGameMenu} userInfo={userInfo!} />
          )}
          {currentGame === 'math' && (
            <MathGame onBack={handleBackToGameMenu} userInfo={userInfo!} />
          )}
          {currentGame === 'color' && (
            <ColorGame onBack={handleBackToGameMenu} userInfo={userInfo!} />
          )}
          {currentGame === 'kiro' && (
            <KiroPuzzleGame onBack={handleBackToGameMenu} userInfo={userInfo!} />
          )}
        </div>
      </Layout>
    );
  }

  return null;
}