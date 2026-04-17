//본 작품 
export interface WatchedLibraryWork {
  id: string;
  title: string;
  isLoan: boolean;
  currentLoan: number;
  maxLoan: number;
  loanCount: number;
  reserveCount: number;
  thumbnailUrl: string;
  category: string;
  writerName: string;
  illustratorName: string;
  publisher: string;
  lastViewedAt: string;
  reservationId: number;
  loanId: number;
  /** 예약 대기열(순서 표시) — status·본 작품 공통 카드 UI */
  loanOrder?: number;
  isReservation?: boolean;
  isLoanWaitDisplay?: boolean;
  isExtendable?: boolean;
  /** GET /libraries 등 — `false` 이면 연장 CTA 비활성 */
  isAvailableExtension?: boolean;
  /** 남은 대출 슬롯 — `maxLoan` > 0 일 때 CTA 대출만/예약만 분기 */
  availableLoanCount?: number;
  /** 대출 중 연장 적용 횟수 — `> 0` 이면 연장 버튼에 「연장중」 표시 */
  extensionCount?: number;
}

export interface StatusLibraryWork extends WatchedLibraryWork {
  loanOrder: number;
  /** status 목록 행은 항상 명시 (본 작품은 옵션) */
  isReservation: boolean;
  /** 작품 상세 `/works/[id]` — 썸네일·설명 클릭 이동 */
  seriesId: number;
}

export interface MyVoiceWork {
  id: number;
  playerKey?: string;
  seriesId: number;
  episodeId: number;
  /** POST /loans · POST /reservations — 작품 상세와 동일 스펙 */
  licenseId: number;
  /** 남은 대출 슬롯(>0이면 대출하기 CTA) */
  availableLoanCount: number;
  title: string;
  isLoan: boolean;
  currentLoan: number;
  maxLoan: number;
  loanCount: number;
  reserveCount: number;
  episodeName: string;
  characterName: string;
  /** 에피소드 내 녹음 가능 홀 전체 개수 (`/recordings/me`의 `isRecordingHoleCount`) */
  totalVoice: number;
  /** 실제 등록된 녹음 파일 개수(hole별 `recordings` 길이 합) */
  myVoice: number;
  dueDate?: string;
  recordingIds: number[];
}

export interface MyVoiceRecordingApiItem {
  id: number;
  title: string;
  seriesName: string;
  seriesId: number;
  /** 대출·예약 API용 — 미응답 시 0으로 두고 작품 상세로 유도 */
  licenseId?: number;
  holes: Array<{
    id: number;
    characterName: string;
    recordings: Array<{
      id: number;
      src: string;
    }>;
  }>;
  isLoan: boolean;
  availableLoanCount: number;
  /** 에피소드에서 마이 보이스 녹음 가능한 홀(대사 슬롯) 전체 개수 */
  isRecordingHoleCount?: number;
  maxLoanCount: number;
  reservationCount: number;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyVoiceRecordingListApiResponse {
  data: MyVoiceRecordingApiItem[];
}

export interface WatchedLibraryPageModel {
  works: WatchedLibraryWork[];
}
