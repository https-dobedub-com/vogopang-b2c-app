/**
 * 백엔드 공통 응답 컨벤션
 *
 * - 리스트: { data: { items: T[], total?: number } }
 * - 단건:   { data: T }
 */

export interface ApiDataResponse<TData> {
  data: TData;
}

export interface ApiItemsTotalResponse<TItem> {
  data: {
    items: TItem[];
    total: number;
  };
}

/**
 * 목록 API 공통 쿼리 파라미터 (클라이언트·페이지네이션·정렬·검색)
 */
export interface ListQueryParams {
  clientId?: number;
  page?: number;
  limit?: number;
  sort?: string;
  seriesName?: string;
  lastViewedDate?: string;
  order?: "ASC" | "DESC";
  searchValue?: string;
  searchKey?: string;
  type?: string;
  tagIds?: number[];
}


