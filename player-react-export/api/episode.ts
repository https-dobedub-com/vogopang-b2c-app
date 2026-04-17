import { apiClient } from "../api/client";
import type { ApiDataResponse } from "../models/model";
import type { EpisodeListResponseData, SeriesEpisodeItemsPayload } from "../models/episode";

export async function getEpisodesBySeriesId(seriesId: number): Promise<SeriesEpisodeItemsPayload> {
  const qs = new URLSearchParams({ seriesId: String(seriesId) });
  const res = await apiClient.get<ApiDataResponse<EpisodeListResponseData>>(`/episodes?${qs.toString()}`);
  return res.data.items;
}
