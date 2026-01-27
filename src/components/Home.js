import React, { useState, useEffect } from 'react';
import './Home.css';

function Home({ userInfo, onLogout, onChatbot }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large'

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  const getCurrentDate = () => {
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth() + 1;
    const date = currentTime.getDate();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = days[currentTime.getDay()];
    
    return `${year}년 ${month}월 ${date}일 ${dayName}`;
  };

  const toggleFontSize = () => {
    const sizes = [ 'normal', 'large'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  const getFontSizeLabel = () => {
    switch(fontSize) {
      case 'small': return '작게';
      case 'normal': return '보통';
      case 'large': return '크게';
      default: return '보통';
    }
  };

  const ChatIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.9"/>
      <path d="M12 16C12 13.7909 13.7909 12 16 12H24C26.2091 12 28 13.7909 28 16V20C28 22.2091 26.2091 24 24 24H18L14 28V20C14 18.8954 13.1046 18 12 18V16Z" fill="#667eea"/>
    </svg>
  );

  const GameIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.9"/>
      <rect x="10" y="14" width="20" height="12" rx="2" fill="#52c41a"/>
      <circle cx="14" cy="18" r="1.5" fill="white"/>
      <circle cx="18" cy="18" r="1.5" fill="white"/>
      <rect x="22" y="16" width="2" height="2" fill="white"/>
      <rect x="25" y="16" width="2" height="2" fill="white"/>
    </svg>
  );

  return (
    <div className={`home-container font-size-${fontSize}`}>
      <div className="home-header">
        <div className="greeting-section">
          <h1 className="greeting-title">안녕하세요,</h1>
          <h2 className="user-name">{userInfo?.name || '사용자'}님</h2>
          <p className="greeting-subtitle">오늘도 함께 건강한 하루를 보내요</p>
          <p className="current-date">{getCurrentDate()}</p>
        </div>
        <div className="header-buttons">
          <button className="back-btn" onClick={onLogout}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H9M13 7L17 11M17 11L13 15M17 11H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="font-toggle-btn" onClick={toggleFontSize}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <text x="2" y="8" fontSize="6" fill="currentColor">A</text>
              <text x="8" y="12" fontSize="8" fill="currentColor">A</text>
              <text x="13" y="16" fontSize="10" fill="currentColor">A</text>
            </svg>
            <span>{getFontSizeLabel()}</span>
          </button>
        </div>
      </div>

      <div className="feature-cards">
        <div className="feature-card chat-card" onClick={onChatbot}>
          <div className="card-icon">
            <ChatIcon />
          </div>
          <div className="card-content">
            <h3 className="card-title">AI 친구와 대화하기</h3>
            <p className="card-subtitle">오늘 기분은 어떠세요?</p>
            <p className="card-description">편하게 이야기 나눠요</p>
          </div>
        </div>

        <div className="feature-card game-card">
          <div className="card-icon">
            <GameIcon />
          </div>
          <div className="card-content">
            <h3 className="card-title">두뇌 훈련 게임</h3>
            <p className="card-subtitle">재미있는 게임으로</p>
            <p className="card-description">기억력을 키워요</p>
          </div>
        </div>
      </div>

      <div className="bottom-message">
        <p>천천히, 편안하게 사용하세요</p>
      </div>
    </div>
  );
}

export default Home;