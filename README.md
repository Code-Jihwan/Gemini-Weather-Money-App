# Gemini Weather & Lifestyle App

이 문서는 React와 Google Gemini API를 활용한 **'스마트 날씨 및 생활 대시보드'**입니다.
웹 브라우저에서 동작하지만, 모바일 앱과 같은 사용자 경험(Mobile-First)을 제공하도록 설계되었습니다.

## 📱 주요 기능 (Features)

### 1. 스마트 홈 화면 (Smart Home)
- **실시간 시계**: 12시간제(예: 2:30, 11:45)로 현재 시간을 심플하고 크게 표시합니다.
- **단축어(Shortcuts) 토글**: 시계 영역을 클릭하면 주요 서비스(뉴스, 메일, Gemini, 음악) 바로가기와 **가계부** 앱을 실행할 수 있는 메뉴로 전환됩니다.
- **날짜 헤더**: 상단에 현재 날짜와 요일을 한글로 깔끔하게 표시합니다.

### 2. AI 날씨 리포트 (AI Weather)
- **실시간 날씨 정보**: Gemini의 `Google Search Tool`을 활용하여 부산 지역의 정확한 실시간 기온(최저/최고/현재)과 날씨 상태를 조회합니다.
- **AI 날씨 코멘트**: 단순한 날씨 상태가 아닌, Gemini가 생성한 따뜻하고 유용한 한 줄 조언(예: "비가 오니 우산을 챙기세요")을 제공합니다.
- **Generative Visuals**: 현재 날씨 분위기를 반영한 고품질 3D 캐릭터 이미지를 Google Imagen 모델(`gemini-2.5-flash-image`)로 실시간 생성하여 시각적인 즐거움을 줍니다.

### 3. AI 스마트 가계부 (Smart Spending Tracker)
- **간편한 지출 기록**: 금액과 카테고리(식비, 간식, 쇼핑, 기타)를 선택하여 빠르게 소비 내역을 저장합니다.
- **일별 조회**: 날짜별로 소비 내역과 총 지출액을 관리합니다. (LocalStorage 저장)
- **AI 소비 코멘트 (New)**: 그날의 지출 총액과 카테고리를 분석하여, Gemini가 재치 있는 한 줄 평을 남깁니다.
    - *예시: "부자이신가요? 지갑이 울고 있어요.", "오늘도 무지출 성공! 칭찬해요."*

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI & API**:
  - **Google Gemini 2.5 Flash**: 
    - 날씨 정보 검색 (Google Search Grounding)
    - 날씨 코멘트 및 가계부 소비 분석 (Text Generation)
  - **Gemini 2.5 Flash Image**: 날씨 기반 이미지 생성
- **Libraries**: 
  - `lucide-react`: UI 아이콘
  - `date-fns`: 날짜 및 시간 포맷팅
- **Storage**: Supabase (PostgreSQL Database)

## 🚀 개발 특징
- **Serverless & Cloud Database**: 별도의 백엔드 서버 구축 없이 Gemini API와 Supabase를 활용하여 인텔리전트한 기능과 안정적인 데이터 관리를 구현했습니다.
- **Design**: Tailwind CSS를 활용하여 그림자, 그라디언트, 애니메이션 등 모던하고 깔끔한 UI를 구성했습니다.

## ⚙️ 설치 및 실행 (Setup)

1. **환경 변수 설정 (.env.local)**
   프로젝트 루트에 `.env.local` 파일을 생성하고 아래 키를 입력하세요.
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Supabase 테이블 생성**
   Supabase SQL Editor에서 아래 쿼리를 실행하여 테이블을 생성합니다.
   ```sql
   create table transactions (
     id uuid default gen_random_uuid() primary key,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     amount numeric not null,
     category text not null,
     date bigint not null,
     description text
   );
   ```

3. **실행**
   ```bash
   npm install
   npm run dev
   ```
