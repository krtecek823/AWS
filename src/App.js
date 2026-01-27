import React, { useState } from 'react';
import './App.css';
import Home from './components/Home';
import Chatbot from './components/Chatbot';

function App() {
  const [currentPage, setCurrentPage] = useState('auth'); // 'auth', 'home', 'chatbot'
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({
    id: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    name: '',
    age: '',
    gender: '',
    familyPhone: ''
  });
  const [userInfo, setUserInfo] = useState(null);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginData.id || !loginData.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    console.log('로그인 데이터:', loginData);
    // 로그인 성공 시 홈화면으로 이동
    // 실제로는 서버에서 사용자 정보를 받아와야 하지만, 데모용으로 회원가입 데이터 사용
    const userName = signupData.name || '사용자'; // 회원가입한 이름 사용
    setUserInfo({ name: userName, id: loginData.id });
    setCurrentPage('home');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupData.name || !signupData.age || !signupData.gender || !signupData.familyPhone) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    if (signupData.age < 1 || signupData.age > 120) {
      alert('올바른 나이를 입력해주세요.');
      return;
    }
    console.log('회원가입 데이터:', signupData);
    alert('회원가입이 완료되었습니다! (데모용)');
    setActiveTab('login');
    // 회원가입 후 데이터는 유지 (실제로는 서버에 저장)
  };

  const handleLogout = () => {
    setCurrentPage('auth');
    setUserInfo(null);
    setLoginData({ id: '', password: '' });
    setSignupData({ name: '', age: '', gender: '', familyPhone: '' }); // 로그아웃 시 회원가입 데이터도 초기화
  };

  const HeartIcon = () => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      <rect width="60" height="60" rx="15" fill="url(#gradient)" />
      <path d="M30 20C25 20 21 24 21 29C21 34 30 42 30 42S39 34 39 29C39 24 35 20 30 20Z" fill="white" />
    </svg>
  );

  return (
    <div className="phone-container">
      {currentPage === 'auth' ? (
        <div className="app-container">
          {/* 로고 및 타이틀 섹션 */}
          <div className="logo-section">
            <div className="logo-icon">
              <HeartIcon />
            </div>
            <h1 className="app-title">인지 케어</h1>
            <p className="app-subtitle">
              매일 당신과 함께하는<br />건강한 일상
            </p>
          </div>

          {/* 로그인/회원가입 폼 */}
          <div className="login-form">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                로그인
              </button>
              <button
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                회원가입
              </button>
            </div>

            {activeTab === 'login' ? (
              <form className="form-container" onSubmit={handleLoginSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="id"
                    placeholder="아이디"
                    className="input-field"
                    value={loginData.id}
                    onChange={handleLoginChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="비밀번호"
                    className="input-field"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                </div>
                <button type="submit" className="login-btn">
                  로그인
                </button>
              </form>
            ) : (
              <form className="form-container" onSubmit={handleSignupSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="성함"
                    className="input-field"
                    value={signupData.name}
                    onChange={handleSignupChange}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    name="age"
                    placeholder="나이"
                    className="input-field"
                    min="1"
                    max="120"
                    value={signupData.age}
                    onChange={handleSignupChange}
                  />
                </div>
                <div className="input-group">
                  <select
                    name="gender"
                    className="input-field"
                    value={signupData.gender}
                    onChange={handleSignupChange}
                  >
                    <option value="">성별 선택</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div className="input-group">
                  <input
                    type="tel"
                    name="familyPhone"
                    placeholder="가족자 대표번호"
                    className="input-field"
                    value={signupData.familyPhone}
                    onChange={handleSignupChange}
                  />
                </div>
                <button type="submit" className="login-btn">
                  회원가입
                </button>
              </form>
            )}

            <div className="bottom-links">
              <a href="#" className="link" onClick={(e) => { e.preventDefault(); alert('아이디/비밀번호 찾기 기능은 데모용입니다.'); }}>
                아이디/비밀번호 찾기
              </a>
              <a href="#" className="link" onClick={(e) => { e.preventDefault(); setActiveTab('signup'); }}>
                회원가입
              </a>
            </div>
          </div>
        </div>
      ) : currentPage === 'home' ? (
        <Home userInfo={userInfo} onLogout={handleLogout} onChatbot={() => setCurrentPage('chatbot')} />
      ) : (
        <Chatbot userInfo={userInfo} onBack={() => setCurrentPage('home')} />
      )}
    </div>
  );
}

export default App;