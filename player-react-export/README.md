# player-react-export

현재 `src/app/player` 기반 플레이어 구현을 React/Next 프로젝트에서 옮겨 쓰기 쉽게 묶어둔 export 폴더입니다.

## 포함 범위

- `app/player/`
  플레이어 UI, 훅, 라이브러리, 아이콘
- `stores/`
  Zustand 기반 플레이어/녹음/스낵바/에러 다이얼로그 스토어
- `api/`
  플레이어/녹음 관련 API 클라이언트
- `lib/`, `data/`, `models/`, `constants/`, `auth/`
  동작에 필요한 보조 유틸과 타입

## 기본 사용

```tsx
"use client";

import { PlayerContent, usePlayerStore } from "./player-react-export";

export default function ExamplePlayerPage() {
  const loadLibContentByPlayerKey = usePlayerStore(
    (state) => state.loadLibContentByPlayerKey,
  );

  return (
    <PlayerContent
      seriesId={219}
      episodeId={3342}
      version="V1"
      currentPlayerKey="three-kingdoms-ep1"
      title="삼국지"
    />
  );
}
```

## 전제 조건

- React 19+
- Next.js 환경 권장
- `zustand`, `@msgpack/msgpack`, `tone`, `clsx`, `lucide-react` 필요
- 이미지 최적화와 라우팅은 `next/image`, `next/navigation` 기준으로 작성됨

## 환경 변수

원본 플레이어와 동일하게 `NEXT_PUBLIC_*` 환경 변수를 사용합니다.

- `NEXT_PUBLIC_MEDIA_BASE_URL`
- `NEXT_PUBLIC_LIB_MEDIA_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_USE_MEDIA_PROXY`
- `NEXT_PUBLIC_EXPERIENCE_BASE_DOMAIN`

## 인증 토큰

`Authorization` 헤더는 `auth/libraryAccessTokenStorage.ts`의 로컬 스토리지 키를 기준으로 읽습니다.

- 현재 키: `vogopang_auth_access_token`
- 레거시 키: `vogopang_library_access_token`

## 참고

- 이 폴더는 현재 앱의 React 플레이어를 그대로 export-friendly 하게 복제한 버전입니다.
- 페이지 라우트(`src/app/player/[playerKey]/page.tsx`)는 포함하지 않았고, 재사용 가능한 클라이언트 구성만 담았습니다.
