import { apiClient } from "../api/client";
import { getEpisodesBySeriesId } from "../api/episode";
import type {
  MyVoiceRecordingApiItem,
  MyVoiceRecordingListApiResponse,
  MyVoiceWork,
} from "../models/library";

export const MY_VOICE_SLOT_MAX = 5;
export const MY_VOICE_PLAYER_KEY = "three-kingdoms-ep1";

type RecordingApiItemWithSnake = MyVoiceRecordingApiItem & {
  license_id?: unknown;
  is_recording_hole_count?: unknown;
};

/** `/recordings/me`에 `licenseId`가 빠지는 경우가 있어, 스네이크 케이스·문자열까지 정규화 */
function pickLicenseIdFromRecordingApiItem(item: RecordingApiItemWithSnake): number {
  const coerce = (v: unknown): number => {
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  };
  const fromCamel = coerce(item.licenseId);
  if (fromCamel > 0) return fromCamel;
  return coerce(item.license_id);
}

function pickRecordingHoleTotal(
  item: RecordingApiItemWithSnake,
  holesLength: number,
): number {
  const raw = item.isRecordingHoleCount ?? item.is_recording_hole_count;
  const n =
    typeof raw === "number" && Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : NaN;
  if (Number.isFinite(n) && n > 0) return n;
  return holesLength;
}

/** 에피소드당 1행: `myVoice`=녹음 파일 개수, `totalVoice`=녹음 가능 홀 전체(`isRecordingHoleCount`) */
function mapMyVoiceRecordingItem(item: MyVoiceRecordingApiItem): MyVoiceWork {
  const holes = item.holes ?? [];
  const myVoice = holes.reduce((sum, h) => sum + (h.recordings?.length ?? 0), 0);
  const totalVoice = pickRecordingHoleTotal(item as RecordingApiItemWithSnake, holes.length);

  const recordingIds = holes.flatMap((h) => (h.recordings ?? []).map((r) => r.id));

  const seenChar = new Set<string>();
  const characterOrder: string[] = [];
  for (const h of holes) {
    const s = h.characterName?.trim() ?? "";
    if (s && !seenChar.has(s)) {
      seenChar.add(s);
      characterOrder.push(s);
    }
  }
  const characterName = characterOrder.length === 0 ? "-" : characterOrder.join(", ");

  return {
    id: item.id,
    playerKey: MY_VOICE_PLAYER_KEY,
    seriesId: item.seriesId,
    episodeId: item.id,
    licenseId: pickLicenseIdFromRecordingApiItem(item),
    availableLoanCount: item.availableLoanCount,
    title: item.seriesName,
    isLoan: item.isLoan,
    currentLoan: item.maxLoanCount - item.availableLoanCount,
    maxLoan: item.maxLoanCount,
    loanCount: item.maxLoanCount - item.availableLoanCount,
    reserveCount: item.reservationCount,
    episodeName: item.title,
    characterName,
    totalVoice,
    myVoice,
    dueDate: item.dueDate ?? "",
    recordingIds,
  };
}

async function resolveLicenseIdsBySeriesId(
  seriesIds: readonly number[],
): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  await Promise.all(
    seriesIds.map(async (seriesId) => {
      try {
        const payload = await getEpisodesBySeriesId(seriesId);
        if (payload.licenseId > 0) {
          map.set(seriesId, payload.licenseId);
        }
      } catch {
        /* 시리즈별 실패는 건너뜀 — 목록은 그대로 표시 */
      }
    }),
  );
  return map;
}

export async function getMyVoiceRecordingList(): Promise<{
  items: MyVoiceWork[];
  slotMax: number;
}> {
  const res = await apiClient.get<MyVoiceRecordingListApiResponse>("/recordings/me");
  const raw = (res.data ?? []) as RecordingApiItemWithSnake[];

  const seriesNeedingLicense = [
    ...new Set(
      raw
        .filter((item) => item.seriesId > 0 && pickLicenseIdFromRecordingApiItem(item) <= 0)
        .map((item) => item.seriesId),
    ),
  ];

  const licenseBySeries =
    seriesNeedingLicense.length > 0
      ? await resolveLicenseIdsBySeriesId(seriesNeedingLicense)
      : new Map<number, number>();

  const prepared = raw.map((item) => {
    const fromApi = pickLicenseIdFromRecordingApiItem(item);
    const resolved =
      fromApi > 0 ? fromApi : (licenseBySeries.get(item.seriesId) ?? 0);
    return { ...item, licenseId: resolved } satisfies MyVoiceRecordingApiItem;
  });

  return {
    items: prepared.map(mapMyVoiceRecordingItem),
    slotMax: MY_VOICE_SLOT_MAX,
  };
}

/**
 * 마이 보이스 편집 삭제 — 에피소드에 속한 녹음 id를 **배열로 한 번에** 전달해 일괄 삭제.
 * `DELETE /recordings` + JSON `{ "ids": number[] }` (백엔드 스펙이 다르면 본문 키·메서드만 조정)
 */
export async function deleteMyVoiceRecordingGroup(recordingIds: number[]): Promise<void> {
  const ids = [...new Set(recordingIds)].filter(
    (id) => typeof id === "number" && Number.isFinite(id) && id > 0,
  );
  if (ids.length === 0) return;

  await apiClient.delete("/recordings", { ids });
}
