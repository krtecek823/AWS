# 마음 케어 (Mind Care) - AI 상담 앱

React로 구현된 AI 상담 챗봇 애플리케이션입니다. AWS Bedrock과 음성 인식/합성 기능을 활용한 종합적인 마음 건강 케어 서비스를 제공합니다.

## 🌟 주요 기능

### 📱 사용자 인증
- 회원가입 (아이디, 비밀번호, 이름, 나이, 성별, 가족 연락처)
- 로그인 시스템
- 개인화된 사용자 경험

### 🏠 홈 화면
- 개인화된 인사말 (실제 사용자 이름 표시)
- 실시간 날짜 업데이트
- 글씨 크기 조절 기능 (작게/보통/크게)
- 직관적인 네비게이션

### 🤖 AI 챗봇
- **AWS Bedrock Claude 3 Haiku** 모델 연동
- 한국어 최적화 상담사 AI
- 따뜻하고 공감적인 대화
- 실시간 메시지 교환

### 🎤 음성 서비스
- **음성 인식 (STT)**: 마이크로 음성 입력
- **음성 합성 (TTS)**: AI 응답을 음성으로 재생
- 한국어 음성 처리 최적화
- 시각적 피드백 (녹음 중 애니메이션)

## 🛠️ 기술 스택

- **Frontend**: React 18, CSS3
- **AI**: AWS Bedrock (Claude 3 Haiku)
- **음성**: Web Speech API (SpeechRecognition, SpeechSynthesis)
- **상태관리**: React Hooks (useState, useEffect)
- **스타일링**: CSS Modules, Responsive Design

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/mind-care-app.git
cd mind-care-app
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env` 파일을 생성하고 AWS 자격증명을 입력하세요:
```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key_here
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

### 4. 개발 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🔧 AWS Bedrock 설정

### 1. AWS 계정 설정
- AWS 계정 생성 및 로그인
- IAM 사용자 생성 및 Bedrock 권한 부여
- Access Key/Secret Key 발급

### 2. Bedrock 모델 액세스
- AWS Console → Amazon Bedrock → Model access
- Claude 3 Haiku 모델 활성화

### 3. 권한 설정
IAM 사용자에게 다음 권한 부여:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
        }
    ]
}
```

## 🎯 사용 방법

### 1. 회원가입 및 로그인
1. "회원가입" 탭에서 개인정보 입력
2. "로그인" 탭에서 아이디/비밀번호 입력
3. 홈화면으로 자동 이동

### 2. AI 챗봇 사용
1. 홈화면에서 "AI 친구와 대화하기" 카드 클릭
2. 텍스트 입력 또는 마이크 버튼으로 음성 입력
3. AI 응답 확인 및 스피커 버튼으로 음성 재생

### 3. 접근성 기능
- 우상단 글씨 크기 조절 버튼 사용
- 음성 입력/출력으로 편리한 사용
- 반응형 디자인으로 다양한 기기 지원

## 📱 지원 브라우저

- Chrome (권장)
- Edge
- Safari
- Firefox (음성 기능 제한적)

## 🔒 보안 고려사항

⚠️ **중요**: 현재 구현은 데모 목적입니다. 실제 운영 환경에서는:
- AWS 자격증명을 백엔드에서 관리
- API Gateway + Lambda를 통한 Bedrock 호출
- 사용자 인증 및 세션 관리 강화
- HTTPS 사용 필수

## 🚀 배포

### Vercel 배포
```bash
npm run build
npx vercel --prod
```

### Netlify 배포
```bash
npm run build
# build 폴더를 Netlify에 업로드
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**마음 케어**로 더 건강한 일상을 만들어보세요! 💙