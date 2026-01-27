import { useState, useEffect } from 'react';
import Layout from './Layout';

interface HomePageProps {
  userInfo: { name: string; id: string };
  onLogout: () => void;
  onChatbot: () => void;
  onBrainGame: () => void;
}

export default function HomePage({ userInfo, onLogout, onChatbot, onBrainGame }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
    const sizes: ('small' | 'normal' | 'large')[] = ['small', 'normal', 'large'];
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

  const fontSizeClasses = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg'
  };

  const titleSizeClasses = {
    small: 'text-2xl',
    normal: 'text-3xl',
    large: 'text-4xl'
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
    <Layout>
      <div className="p-6 h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
          <div className="flex-1">
            <h1 className={`${titleSizeClasses[fontSize]} font-light text-gray-800 mb-2`}>
              안녕하세요,
            </h1>
            <h2 className={`${titleSizeClasses[fontSize]} font-bold text-gray-800 mb-4`}>
              {userInfo?.name || '사용자'}님
            </h2>
            <p className={`${fontSizeClasses[fontSize]} text-gray-600 mb-2`}>
              오늘도 함께 건강한 하루를 보내요
            </p>
            <p className={`text-sm text-gray-500`}>
              {getCurrentDate()}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* 뒤로가기 버튼 */}
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H9M13 7L17 11M17 11L13 15M17 11H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* 글씨 크기 조절 버튼 */}
            <button
              onClick={toggleFontSize}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <text x="2" y="8" fontSize="6" fill="currentColor">A</text>
                <text x="8" y="12" fontSize="8" fill="currentColor">A</text>
                <text x="13" y="16" fontSize="10" fill="currentColor">A</text>
              </svg>
              <span>{getFontSizeLabel()}</span>
            </button>
          </div>
        </div>

        {/* 기능 카드들 */}
        <div className="flex-1 space-y-6">
          {/* AI 챗봇 카드 */}
          <div
            onClick={onChatbot}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-5"
          >
            <div className="flex-shrink-0">
              <ChatIcon />
            </div>
            <div className="flex-1">
              <h3 className={`${fontSize === 'large' ? 'text-xl' : fontSize === 'small' ? 'text-lg' : 'text-xl'} font-bold mb-2`}>
                AI 친구와 대화하기
              </h3>
              <p className={`${fontSizeClasses[fontSize]} opacity-90 mb-1`}>
                오늘 기분은 어떠세요?
              </p>
              <p className={`${fontSizeClasses[fontSize]} opacity-90`}>
                편하게 이야기 나눠요
              </p>
            </div>
          </div>

          {/* 두뇌 훈련 게임 카드 */}
          <div
            onClick={onBrainGame}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-5"
          >
            <div className="flex-shrink-0">
              <GameIcon />
            </div>
            <div className="flex-1">
              <h3 className={`${fontSize === 'large' ? 'text-xl' : fontSize === 'small' ? 'text-lg' : 'text-xl'} font-bold mb-2`}>
                두뇌 훈련 게임
              </h3>
              <p className={`${fontSizeClasses[fontSize]} opacity-90 mb-1`}>
                재미있는 게임으로
              </p>
              <p className={`${fontSizeClasses[fontSize]} opacity-90`}>
                기억력을 키워요
              </p>
            </div>
          </div>
        </div>

        {/* 하단 메시지 */}
        <div className="text-center py-6 border-t border-gray-100 mt-6">
          <p className={`${fontSizeClasses[fontSize]} text-gray-500`}>
            천천히, 편안하게 사용하세요
          </p>
        </div>
      </div>
    </Layout>
  );
}