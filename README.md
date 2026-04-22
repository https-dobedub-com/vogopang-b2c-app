# 보고팡 B2C 앱

Expo + React Native + TypeScript 기반의 보고팡 B2C 모바일 앱입니다.

## 개발 환경

- Node.js `>=20 <23`
- Expo SDK 54
- React Native 0.81
- Expo Router 기반 파일 라우팅
- React Query 기반 데이터 로딩
- AsyncStorage 기반 로컬 상태 저장
- `expo-audio` 기반 플레이어 오디오 재생

## 실행

```bash
npm install
npm run start
```

플랫폼별 실행:

```bash
npm run ios
npm run android
npm run web
```

타입 체크:

```bash
npm run typecheck
```

## 환경 변수

로컬 개발 시 `.env` 파일을 만들고 아래 값을 설정합니다. `.env`는 git에 커밋하지 않습니다.

```bash
EXPO_PUBLIC_GUARDIAN_PIN=0000
```

보호자 PIN은 `src/features/mode/context/AppModeProvider.tsx`에서 이 값을 읽습니다. 값이 비어 있으면 보호자 인증은 실패합니다.

## 주요 폴더

- `app/`: Expo Router 화면과 레이아웃
- `app/(tabs)/`: 홈, 검색, 이벤트, 내서재, 더보기 탭 화면
- `app/book/[id].tsx`: 도서 상세 화면
- `app/player/[seriesId]/[episodeId].tsx`: 플레이어 라우트
- `app/guardian/`: 보호자 화면과 PIN 인증
- `app/kids/`: 키즈모드 화면
- `src/features/`: 기능 단위 코드
- `src/features/mode/`: 키즈모드/보호자모드 상태
- `src/features/player/`: 플레이어 데이터, 타입, 화면 컴포넌트
- `src/features/reading-list/`: 내서재 저장 상태
- `src/lib/`: 공용 클라이언트, query key 등 앱 공통 유틸
- `assets/figma/`: Figma 기반 앱 이미지 에셋
- `player-react-export/`: React/Next 플레이어 구현 참고용 export 폴더

## 출시 준비 설정

`app.json`에는 현재 앱 이름, iOS Bundle ID, Android Package Name이 들어가 있습니다. 실제 스토어 출시 전 최종 식별자가 맞는지 다시 확인해야 합니다.

`eas.json`에는 아래 빌드 프로파일이 있습니다.

- `development`: 개발 클라이언트 빌드
- `preview`: 내부 배포용 빌드
- `production`: 스토어 제출용 빌드

production Android 빌드는 Google Play 업로드용 AAB로 생성됩니다.

## 출시 전 체크

- `EXPO_PUBLIC_GUARDIAN_PIN` 운영 값 설정
- iOS/Android 실기기에서 오디오 재생 확인
- 키즈모드/보호자모드 실기기 QA
- 작은 화면/태블릿 화면 UI 확인
- 마이 보이스 녹음 기능 출시 여부 확정
- 녹음 기능 출시 시 마이크 권한 문구와 개인정보 처리방침 반영
