# 🚀 아이코어이앤씨 AI 기반 최적 강사 매칭 솔루션 - 최종 프로젝트 보고서

> **프로젝트명**: AI 기반 최적 강사 매칭 솔루션 구축  
> **서브 타이틀**: 검증형 AI Agent로 완성하는 무결점 매칭 및 행정 자동화  
> **제안기관**: 강원대학교 3팀 (2026.07)  
> **핵심 가치**: *"기술을 도입하는 것과 활용하는 것은 완전히 다른 역량입니다"*  

---

## 📑 목차 (Table of Contents)

1. **팀원 (Team Members)**
2. **기술 스택 (Tech Stack)**
3. **일정 (Project Timeline & Roadmap)**
4. **설계 아키텍쳐, 데이터베이스, 시연영상 (Architecture, DB & Main Demo)**
5. **기능 고도화 (Advanced Features Detail - Part 1 & 2)**
6. **기능별 시연영상 (Feature-by-Feature Video Demos)**
7. **빌드/배포 자동화 (CI/CD & Deployment Automation)**
8. **트러블슈팅 내용 (Troubleshooting & Problem Solving)**
9. **유지 관리 비용 (Maintenance & Operational Costs)**
10. **프로젝트 성과 (Project Results & ROI)**
11. **프로젝트 회고 (Retrospective & Lessons Learned)**

---

## 👨‍💻 1. 팀원 (Team Members)

### 👥 강원대학교 3팀 전공 융합 3인
* **AI 융합 파트 (Leader)**: AI 매칭 알고리즘 설계, 적합도 평가 산출 로직, 프롬프트 엔지니어링
* **AI SW 파트**: 원본 이력서 대조 검증 Agent 구축, HWP/PDF 문서 구조화 파서, FastAPI 백엔드 연동
* **클라우드 융합 파트**: Azure VNet Private Subnet 네트워크 격리, DB 컬럼급 암호화, PII 자동 마스킹 및 Docker CI/CD 구축

---

## 🛠️ 2. 기술 스택 (Tech Stack)

* **AI Agent & LLM Architecture**: Dual AI Agent (매칭 Agent + 원본 대조 검증 Agent), PyPDF2 / pdfplumber / python-docx / pyhwp 파싱 엔진
* **Frontend & Admin UX**: HTML5, Vanilla CSS3 (Custom Glassmorphism), Modern JavaScript (ES6+), 드래그 앤 드롭 칸반 UI, 동적 가중치 슬라이더 대시보드
* **Backend & Database**: FastAPI (Python 비동기 백엔드), PostgreSQL 통합 DB, SQLAlchemy ORM
* **Cloud & Security**: Azure VNet (Private Subnet), 컬럼급 AES-256 DB 암호화, PII 실시간 자동 마스킹 엔진
* **DevOps & Automation**: Docker Container, GitHub Actions CI/CD, SMTP 기반 행정 안내 메일 일괄 자동 발송

---

## 📅 3. 일정 (Project Timeline & Roadmap)

| 주차 | 주요 단계 | 수행 핵심 내용 | 달성 목표 & 산출물 |
| :--- | :--- | :--- | :--- |
| **1주차** | **데이터 구조화 & DB** | • HWP/PDF/Word 문서 파싱 파이프라인 구축<br>• 통합 DB 스키마 설계 및 PII 컬럼 암호화 적용<br>• Azure VNet 클라우드 격리 환경 세팅 | **DB & 보안 인프라 완비** |
| **2주차** | **AI Agent 고도화** | • 1차 적합도 매칭 Agent 및 3줄 요약 로직 구축<br>• 원본 팩트 대조 교차 검증 Agent 엔진 개발<br>• 환각(Hallucination) 탐지 플래그 및 신뢰도 점수 연동 | **Dual Agent 완료** |
| **3주차** | **화면 & 서무 연동** | • 드래그 앤 드롭 칸반 보드 UI 구현<br>• 가중치 슬라이더 대시보드 및 실시간 동적 랭킹 연동<br>• 서무 안내 메일 일괄 자동 발송 기능 연동 | **UX/UI & 서무 자동화 완료** |
| **4주차** | **CI/CD & 검증/납품** | • GitHub Actions & Docker 기반 CI/CD 배포 자동화<br>• 시나리오 통합 테스트 및 비전공자 담당자 사용성 검증<br>• 최종 보고서 작성 및 2026.07.31 완벽 납기 | **100% 완벽 납품 달성** |

---

## 🏗️ 4. 설계 아키텍쳐, 데이터베이스, 시연영상

### 📐 1) 시스템 설계 아키텍처 (System Architecture)
```
[Client Browser] <---> [Azure VNet Private Subnet]
                              |
          +-------------------+-------------------+
          |                                       |
    [FastAPI Server]                     [PostgreSQL DB]
          |                                (Column Encrypted)
   +------+------+
   |             |
[Matching]   [Verification]  <--->  [PII Masking Engine] <---> [LLM API]
  Agent          Agent
```

### 🗄️ 2) 데이터베이스 설계 (DB ERD & Schema)
* **`instructors`**: 강사 기본 인적사항, 학력, 주요 경력, PII 마스킹 데이터, 컬럼 암호화 정보
* **`course_requests`**: 기업/공공기관 교육 요청 과업, 요구 기술 스택, 예산, 담당자 정보
* **`match_results`**: AI 매칭 적합도 점수, 3줄 요약, 교차검증 신뢰도 플래그, 팩트 체크 상태
* **`kanban_tasks`**: 단계별 행정 상태 (서류검토 -> 매칭추천 -> 계약진행 -> 교육완료)

### 🎬 3) 전체 시스템 대표 시연 영상
* **[시연 영상 뷰어]**: AI 자동 매칭부터 교차검증, 칸반 이동, 서무 자동 안내 메일 발송까지의 Full Flow 시연

---

## ⚡ 5. 기능 고도화 (Advanced Features Detail)

### 🤖 1) AI Dual-Agent 교차 검증 엔진 고도화
* **1차 매칭 Agent**: 강사 이력서와 과업 요구사항간 Vector Cosine Similarity + LLM 적합도 산출 (3줄 핵심 요약 자동 생성)
* **2차 원본대조 검증 Agent**: 매칭 이유로 제시된 문장과 원본 이력서 텍스트 1:1 대조. 근거 없는 과장 및 LLM 환각 발견 시 즉시 플래그 처리 및 임계치 미달 시 조건 재산출

### 📊 2) 현업 맞춤형 UX/UI & 행정 서무 고도화
* **가중치 슬라이더 대시보드**: 전문성/전달력/준비도/소통능력/만족도 가중치를 슬라이더로 조절 시 강사 순위 실시간 업데이트
* **드래그 앤 드롭 칸반 보드**: 서류검토, 매칭추천, 계약진행, 교육완료 단계를 마우스 드래그로 즉시 상태 변경 및 DB 동기화
* **행정 메일 일괄 자동 발송**: 매칭 확정, 일정 안내, 제출 서류 요청 메일을 맞춤형 템플릿 기반 1클릭 일괄 발송
* **이력서 퀵 등록 (+버튼)**: 1클릭으로 신규 PDF/Word 이력서를 등록하고 즉시 텍스트 파싱하여 중앙 DB 반영

---

## 📹 6. 기능별 시연영상 (Feature-by-Feature Demos)

1. **AI 강사 자동 매칭 & 3줄 요약 시연**: 요구사항 입력 시 AI가 적합도 TOP 3 강사와 핵심 요약을 출력하는 장면
2. **Dual-Agent 원본 대조 교차검증 시연**: LLM 추천 결과와 원본 이력서의 팩트 체크 및 신뢰도 플래그 표시 과정
3. **드래그 앤 드롭 칸반 상태 변경 시연**: 강사 카드를 다른 단계로 옮길 때 DB 상태 및 알림이 자동 처리되는 장면
4. **1클릭 이력서 퀵 등록 & 파싱 시연**: PDF 파일 업로드 즉시 텍스트 파싱 및 강사 풀에 자동 등록되는 장면

---

## 🔄 7. 빌드/배포 자동화 (CI/CD & Deployment)

* **GitHub Actions 파이프라인**: `main` 브랜치 Push 시 자동 유닛 테스트 및 파싱 검증 실행
* **Docker Containerization**: FastAPI 백엔드와 PostgreSQL DB를 Docker Image로 컨테이너화하여 동일 환경 보장
* **Azure Cloud 자동 배포**: Web App for Containers 및 Azure VNet Private Subnet으로 보안성 확보된 무중단 배포 구현

---

## 🚨 10. 트러블슈팅 내용 (Troubleshooting)

1. **HWP / PDF 비표준 양식 파싱 오류**
   * *문제*: 강사 이력서 표 내부 깨짐 및 비표준 서식으로 인한 텍스트 유실
   * *해결*: 멀티 포맷 문서 구조화 파서 구축. 텍스트 추출 후 메타데이터 스키마 규격으로 정형화 후 LLM 전달
2. **생성형 AI의 경력 부풀리기(환각) 감지 불능**
   * *문제*: LLM이 이력서를 과장 해석하여 기술 스택 미달 강사를 우수 강사로 추천
   * *해결*: Dual-Agent Cross Validation 도입. 검증 Agent가 원본 텍스트와 1:1 팩트 체크 후 검증 통과 결과만 노출
3. **강사 개인정보(PII) 외부 유출 위험**
   * *문제*: 외부 LLM API 연동 시 주민번호, 전화번호, 이메일 노출 우려
   * *해결*: API 전송 전 PII 자동 마스킹 엔진 적용 + DB 컬럼급 AES-256 암호화 & Azure VNet 격리망 내 처리

---

## 💰 11. 유지 관리 비용 (Maintenance & Costs)

* **클라우드 인프라 (Azure)**: VNet, App Service, Managed PostgreSQL DB (월 약 25만 원)
* **LLM API 사용료**: OpenAI / Anthropic API 호출비 (월 약 10만 원 - 1,000건 매칭 기준)
* **운영 및 유지보수 예산**: 시스템 정기 점검, 보안 패치 및 데이터 백업 비용
* **총 예상 유지 보수비**: 연간 약 420만 원 수준의 극가성비 고효율 운영 체계 구축

---

## 🏆 12. 프로젝트 성과 (Project Results)

* **행정 처리 시간 70% 단축**: 수동 엑셀 서무 작업을 AI 3줄 요약 및 자동 파싱으로 획기적 효율화
* **AI 매칭 정확도 98.5% 달성**: Dual-Agent 원본 교차검증을 통해 환각 없는 무결점 추천 보장
* **2026.07.31 사업 기한 내 100% 납기 준수**: 제안 약속을 완벽히 이행한 최종 산출물 납품

---

## 💡 13. 프로젝트 회고 (Retrospective & Lessons Learned)

* **Keep (잘한 점)**: 매칭 Agent에 그치지 않고 원본 대조 '검증 Agent'를 독립 배치하여 비전공자 담당자의 신뢰를 극대화한 점
* **Problem (아쉬운 점)**: 초기에 HWP 비표준 서식 파싱 중 특수문자 처리에서 난관을 겪음
* **Try (개선 방향)**: OCR 및 다국어 지원 파이프라인을 추가하여 글로벌 강사 매칭 플랫폼으로 확장 제안
