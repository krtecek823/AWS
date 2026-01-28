import { createContext, useContext, useState, ReactNode } from 'react';

export interface ActivitySession {
  id: string;
  type: 'chat' | 'game';
  gameType?: 'memory' | 'sequence' | 'math' | 'color' | 'kiro';
  startTime: Date;
  endTime?: Date;
  duration?: number; // 분 단위
  score?: number;
  details?: any;
}

export interface DiagnosisResult {
  date: Date;
  score: number;
  answers: number[];
}

export interface ActivityData {
  sessions: ActivitySession[];
  diagnosisResults: DiagnosisResult[];
}

interface ActivityContextType {
  activityData: ActivityData;
  startSession: (type: 'chat' | 'game', gameType?: string) => string;
  endSession: (sessionId: string, score?: number, details?: any) => void;
  addDiagnosisResult: (score: number, answers: number[]) => void;
  getWeeklyStats: () => {
    totalChatSessions: number;
    totalGameSessions: number;
    totalTime: number;
    avgDailyTime: number;
    gameStats: Record<string, { played: number; avgScore: number; bestScore: number }>;
    dailyActivities: Array<{
      date: string;
      chatSessions: number;
      gamesSessions: number;
      totalTime: number;
      diagnosisScore?: number;
    }>;
    latestDiagnosis?: DiagnosisResult;
  };
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activityData, setActivityData] = useState<ActivityData>({
    sessions: [],
    diagnosisResults: []
  });

  const startSession = (type: 'chat' | 'game', gameType?: string): string => {
    const sessionId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: ActivitySession = {
      id: sessionId,
      type,
      gameType: gameType as any,
      startTime: new Date()
    };

    setActivityData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));

    return sessionId;
  };

  const endSession = (sessionId: string, score?: number, details?: any) => {
    setActivityData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session => {
        if (session.id === sessionId) {
          const endTime = new Date();
          const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
          return {
            ...session,
            endTime,
            duration,
            score,
            details
          };
        }
        return session;
      })
    }));
  };

  const addDiagnosisResult = (score: number, answers: number[]) => {
    const newResult: DiagnosisResult = {
      date: new Date(),
      score,
      answers
    };

    setActivityData(prev => ({
      ...prev,
      diagnosisResults: [...prev.diagnosisResults, newResult]
    }));
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 최근 7일간의 세션 필터링
    const recentSessions = activityData.sessions.filter(session => 
      session.startTime >= weekAgo && session.endTime
    );

    const totalChatSessions = recentSessions.filter(s => s.type === 'chat').length;
    const totalGameSessions = recentSessions.filter(s => s.type === 'game').length;
    const totalTime = recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgDailyTime = Math.round(totalTime / 7);

    // 게임별 통계
    const gameStats: Record<string, { played: number; avgScore: number; bestScore: number }> = {};
    const gameTypes = ['memory', 'sequence', 'math', 'color', 'kiro'];
    
    gameTypes.forEach(gameType => {
      const gameSessions = recentSessions.filter(s => s.type === 'game' && s.gameType === gameType);
      const scores = gameSessions.map(s => s.score || 0).filter(score => score > 0);
      
      gameStats[gameType] = {
        played: gameSessions.length,
        avgScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
        bestScore: scores.length > 0 ? Math.max(...scores) : 0
      };
    });

    // 일별 활동 데이터
    const dailyActivities = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = recentSessions.filter(session => {
        const sessionDate = session.startTime.toISOString().split('T')[0];
        return sessionDate === dateStr;
      });

      const chatSessions = daySessions.filter(s => s.type === 'chat').length;
      const gamesSessions = daySessions.filter(s => s.type === 'game').length;
      const dayTotalTime = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);

      // 해당 날짜의 진단 결과 찾기
      const dayDiagnosis = activityData.diagnosisResults.find(result => {
        const resultDate = result.date.toISOString().split('T')[0];
        return resultDate === dateStr;
      });

      dailyActivities.push({
        date: dateStr,
        chatSessions,
        gamesSessions,
        totalTime: dayTotalTime,
        diagnosisScore: dayDiagnosis?.score
      });
    }

    // 최근 진단 결과
    const latestDiagnosis = activityData.diagnosisResults.length > 0 
      ? activityData.diagnosisResults[activityData.diagnosisResults.length - 1]
      : undefined;

    return {
      totalChatSessions,
      totalGameSessions,
      totalTime,
      avgDailyTime,
      gameStats,
      dailyActivities,
      latestDiagnosis
    };
  };

  return (
    <ActivityContext.Provider value={{
      activityData,
      startSession,
      endSession,
      addDiagnosisResult,
      getWeeklyStats
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}