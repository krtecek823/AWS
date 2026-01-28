import { useState } from 'react';
import Layout from './Layout';

interface SettingsPageProps {
  userInfo: { 
    name: string; 
    id: string;
    age?: number;
    gender?: string;
    guardianPhone?: string;
  };
  onBack: () => void;
  onLogout: () => void;
}

export default function SettingsPage({ userInfo, onBack, onLogout }: SettingsPageProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

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
                설정
              </h1>
            </div>
            <p className={`${fontSizeClasses[fontSize]} text-gray-600 ml-12`}>
              개인정보 및 앱 설정
            </p>
          </div>
        </div>

        {/* 개인정보 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className={`${fontSize === 'large' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-4 flex items-center gap-2`}>
            👤 개인정보
          </h3>
          <div className="space-y-4">
            {/* 이름 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>이름</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                {userInfo.name}
              </span>
            </div>
            
            {/* 아이디 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>아이디</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                {userInfo.id}
              </span>
            </div>
            
            {/* 나이 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>나이</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                {userInfo.age || '미입력'}세
              </span>
            </div>
            
            {/* 성별 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>성별</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                {userInfo.gender || '미입력'}
              </span>
            </div>
            
            {/* 보호자 연락처 */}
            <div className="flex items-center justify-between py-3">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>보호자 연락처</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                {userInfo.guardianPhone || '미입력'}
              </span>
            </div>
          </div>
        </div>

        {/* 앱 설정 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className={`${fontSize === 'large' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-4 flex items-center gap-2`}>
            ⚙️ 앱 설정
          </h3>
          <div className="space-y-4">
            {/* 글씨 크기 설정 */}
            <div className="flex items-center justify-between py-3">
              <div>
                <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800 block`}>
                  글씨 크기
                </span>
                <span className="text-sm text-gray-500">
                  화면의 글씨 크기를 조절합니다
                </span>
              </div>
              <button
                onClick={toggleFontSize}
                className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all font-medium"
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
        </div>

        {/* 앱 정보 섹션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className={`${fontSize === 'large' ? 'text-xl' : 'text-lg'} font-semibold text-gray-800 mb-4 flex items-center gap-2`}>
            ℹ️ 앱 정보
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>앱 이름</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                마음 케어
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>버전</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                1.0.0
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className={`${fontSizeClasses[fontSize]} text-gray-600`}>개발자</span>
              <span className={`${fontSizeClasses[fontSize]} font-medium text-gray-800`}>
                Kiro Team
              </span>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H9M13 7L17 11M17 11L13 15M17 11H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={fontSize === 'large' ? 'text-lg' : 'text-base'}>
              로그아웃
            </span>
          </button>
        </div>

        {/* 하단 여백 */}
        <div className="h-6"></div>
      </div>
    </Layout>
  );
}