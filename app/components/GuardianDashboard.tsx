import { useState, useEffect } from 'react';
import { useActivity } from '@/app/contexts/ActivityContext';
import Layout from './Layout';

interface GuardianDashboardProps {
  userInfo: { name: string; id: string };
  onBack: () => void;
  onLogout: () => void;
}

// interface ActivityData {
//   date: string;
//   chatSessions: number;
//   gamesSessions: number;
//   totalTime: number; // 분 단위
//   diagnosisScore?: number;
// }

// interface GameStats {
//   cardMatching: { played: number; avgScore: number; bestScore: number };
//   numberSequence: { played: number; avgScore: number; bestScore: number };
//   mathGame: { played: number; avgScore: number; bestScore: number };
//   colorGame: { played: number; avgScore: number; bestScore: number };
//   kiroPuzzle: { played: number; avgScore: number; bestScore: number };
// }

export default function GuardianDashboard({ userInfo, onBack, onLogout }: GuardianDashboardProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { getWeeklyStats } = useActivity();

  // 실제 활동 데이터 가져오기
  const weeklyStats = getWeeklyStats();

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
    const sizes: ('normal' | 'large')[] = ['normal', 'large'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  const getFontSizeLabel = () => {
    switch(fontSize) {
      case 'normal': return '보통';
      case 'large': return '크게';
      default: return '보통';
    }
  };

  const fontSizeClasses = {
    normal: 'text-base',
    large: 'text-lg'
  };

  const titleSizeClasses = {
    normal: 'text-2xl',
    large: 'text-3xl'
  };

  const getHealthStatus = () => {
    const latestDiagnosis = weeklyStats.latestDiagnosis;
    if (!latestDiagnosis) return null;
    
    const score = latestDiagnosis.score;
    if (score <= 5) {
      return { status: '우수', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    } else if (score <= 16) {
      return { status: '양호', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    } else {
      return { status: '주의', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}/${day}(${dayName})`;
  };

  const stats = weeklyStats;
  const healthStatus = getHealthStatus();

  return (
    <Layout>
      <div className="p-6 h-full overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className={`${titleSizeClasses[fontSize]} font-bold text-gray-800`}>
                보호자 대시보드
              </h1>
            </div>
            <p className={`${fontSizeClasses[fontSize]} text-gray-600 ml-12`}>
              {userInfo?.name || '사용자'}님의 활동 통계
            </p>
            <p className="text-sm text-gray-500 ml-12">
              {getCurrentDate()}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* 로그아웃 버튼 */}
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

        {/* 기간 선택 */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'week', label: '최근 7일' },
            { key: 'month', label: '최근 30일' },
            { key: 'quarter', label: '최근 3개월' }
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.key
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* 주요 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* 총 활동 시간 */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">총 활동 시간</span>
              <span className="text-2xl">⏰</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalTime}분</div>
            <div className="text-sm opacity-90">일평균 {stats.avgDailyTime}분</div>
          </div>

          {/* AI 대화 세션 */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">AI 대화</span>
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalChatSessions}회</div>
            <div className="text-sm opacity-90">7일간 총 세션</div>
          </div>

          {/* 게임 세션 */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">두뇌 게임</span>
              <span className="text-2xl">🎮</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalGameSessions}회</div>
            <div className="text-sm opacity-90">7일간 총 세션</div>
          </div>

          {/* 건강 상태 */}
          {healthStatus && (
            <div className={`${healthStatus.bgColor} ${healthStatus.borderColor} border rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">인지 상태</span>
                <span className="text-2xl">🧠</span>
              </div>
              <div className={`text-2xl font-bold ${healthStatus.color}`}>{healthStatus.status}</div>
              <div className="text-sm text-gray-600">최근 자가진단 결과</div>
            </div>
          )}
        </div>

        {/* 일별 활동 차트 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">일별 활동 현황</h3>
          <div className="space-y-3">
            {weeklyStats.dailyActivities.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600 font-medium">
                  {formatDate(day.date)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  {/* AI 대화 바 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">AI 대화</span>
                      <span className="text-xs text-gray-600">{day.chatSessions}회</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((day.chatSessions / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* 게임 바 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">게임</span>
                      <span className="text-xs text-gray-600">{day.gamesSessions}회</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((day.gamesSessions / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* 총 시간 */}
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-gray-700">{day.totalTime}분</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 게임별 상세 통계 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">게임별 성과</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(weeklyStats.gameStats).map(([gameKey, stats]) => {
              const gameNames = {
                memory: '카드 매칭',
                sequence: '숫자 기억',
                math: '빠른 계산',
                color: '색상 인식',
                kiro: 'Kiro 퍼즐'
              };
              
              const gameEmojis = {
                memory: '🃏',
                sequence: '🔢',
                math: '🧮',
                color: '🎨',
                kiro: '🧩'
              };

              return (
                <div key={gameKey} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{gameEmojis[gameKey as keyof typeof gameEmojis]}</span>
                    <span className="font-medium text-gray-800">
                      {gameNames[gameKey as keyof typeof gameNames]}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">플레이 횟수</span>
                      <span className="font-medium">{stats.played}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">평균 점수</span>
                      <span className="font-medium">{stats.avgScore}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">최고 점수</span>
                      <span className="font-medium text-green-600">{stats.bestScore}점</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 건강 권장사항 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            💡 건강 관리 권장사항
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">활동 패턴 분석</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 일평균 {stats.avgDailyTime}분 활동 중 (권장: 30-60분)</li>
                <li>• AI 대화를 통한 소통 활발</li>
                <li>• 다양한 두뇌 게임 참여 중</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">개선 제안</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 매일 꾸준한 활동 유지</li>
                <li>• 새로운 게임 도전 권장</li>
                <li>• 정기적인 자가진단 실시</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}