import type { ApiDataResponse } from "./model";

/** `GET /episodes?seriesId=` → `data.items.episodes[]` 한 건 */
export interface EpisodeListItem {
  id: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  seriesName: string;
  chapter: string;
  thumbnailImageUrl: string;
  isRecordingEpisode: boolean;
  summary?: string;
  isPurchased?: boolean;
  requiresLoan?: boolean;
  playerKey?: string;
  /** API가 회차마다 시리즈 페이로드를 중첩해 주는 경우 */
  series?: SeriesEpisodeItemsPayload;
}

export type SeriesWorkTagType = "category" | "target_group" | string;

/** 시리즈 `data.items.tags[]` */
export interface SeriesWorkTag {
  id: number;
  name: string;
  type: SeriesWorkTagType;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  events?: unknown[];
}

/** 내 예약·대출 단계 */
export type ReservationStatus = "available" | "pending" | "loaned" | "cancelled";

/** 상세 CTA — API 미전달·보조 분기용 `none` */
export type WorkDetailReservationPhase = ReservationStatus | "none";

/**
 * `GET /episodes?seriesId=` → `data.items`
 * 시리즈 메타 + 대출·예약 요약 + `episodes` + `tags`
 */
export interface SeriesEpisodeItemsPayload {
  licenseId: number;
  id: number;
  title: string;
  thumbnailImageUrl: string;
  reservationId: number;
  isLoan: boolean;
  isReservation: boolean;
  isAvailableExtension: boolean;
  availableLoanCount: number;
  myReservationOrder: number;
  maxLoanCount: number;
  reservationCount: number;
  loanId: number;
  publisher: string;
  writer: string;
  illustrator: string;
  expectedReturnedOn: string;
  paperBookPublishOn: string;
  isbn: string;
  summary: string;
  extensionCount: number;
  tags?: SeriesWorkTag[];
  reservationStatus?: ReservationStatus;
  episodes: EpisodeListItem[];
}

export interface EpisodeListResponseData {
  items: SeriesEpisodeItemsPayload;
}

export type EpisodeListApiResponse = ApiDataResponse<EpisodeListResponseData>;


