/**
 * 에피소드별 사용자 녹음(마이 보이스) 서버 API
 *
 * GET  /hole?episodeId=X&isRecordingSection=true
 *                                  → 체험하기 홀 목록 + 녹음 정보
 *
 * **적용하기 → S3 프리사인드 업로드 + 녹음 등록** (`postHoleRecording`)
 *
 * ① POST /files/uploadUrls  → presignedUrl + publicUrl + file id
 * ② PUT presignedUrl        → S3 업로드(브라우저 CORS 회피: `/api/player-recording-s3` 경유).
 *                             `mock=true` 쿼리가 붙은 URL은 ② 생략 후 ③만으로 메타 반영.
 * ③ PUT /files/uploadUrls   → 업로드 확정 `{ "ids": [ fileId ] }`
 * ④ POST /recordings        → `{ src, size, holeId }` (src: 업로드 파일 공개 URL, holeId: GET /holes item.id)
 *
 * 프리사인 요청 시 파일명에 hole uuid 포함 가능(백엔드·S3 키 정책용).
 */

import { apiClient } from "../api/client";
import { withBearerAuth } from "../lib/apiAuthHeaders";
import type { VogopangContentHole } from "../data/vogopangContentTypes";
import { getFetchUrl, getMediaUrl } from "../lib/environment";

export interface EpisodeRecordingApiItem {
  id: number;
  characterName?: string;
  uuid: string;
  script?: string;
  records: { id: number; src: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EpisodeRecordingsApiResponse {
  data: {
    items: EpisodeRecordingApiItem[];
  };
}

interface EpisodeRecordingApiRawItem {
  id?: number;
  characterName?: string;
  uuid?: string;
  script?: string;
  src?: string | null;
  records?: { id?: number; src?: string | null } | null;
  createdAt?: string;
  updatedAt?: string;
}

/** records.src 가 아직 재생 불가능한 자리 표시자인지 */
export function isPlaceholderRecordingSrc(src: string | undefined | null): boolean {
  if (src == null) return true;
  const t = src.trim();
  if (!t) return true;
  if (/^https?:\/\/\s*$/i.test(t)) return true;
  return false;
}

export function isUsableRecordingSrc(src: string | undefined | null): boolean {
  return !isPlaceholderRecordingSrc(src);
}

export function inferEpisodeRecordingMimeType(src: string | undefined | null): string {
  const value = String(src ?? "").trim().toLowerCase();
  if (!value) return "audio/webm";
  if (/\.m4a(?:$|\?)/i.test(value) || /\.x-m4a(?:$|\?)/i.test(value) || /\.mp4(?:$|\?)/i.test(value)) {
    return "audio/mp4";
  }
  if (/\.mp3(?:$|\?)/i.test(value) || /\.mpeg(?:$|\?)/i.test(value)) {
    return "audio/mpeg";
  }
  if (/\.ogg(?:$|\?)/i.test(value) || /\.opus(?:$|\?)/i.test(value)) {
    return "audio/ogg";
  }
  return "audio/webm";
}

export function canBrowserPlayRecordingMimeType(mimeType: string): boolean {
  if (typeof document === "undefined") return true;
  const audio = document.createElement("audio");
  return audio.canPlayType(mimeType) !== "";
}

/** 상대 경로 또는 절대 URL → 브라우저에서 재생 가능한 URL로 변환 */
export function resolveEpisodeRecordingAudioUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed || isPlaceholderRecordingSrc(trimmed)) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return getFetchUrl(trimmed);
  }
  const absolute = getMediaUrl(trimmed, "records");
  return getFetchUrl(absolute || trimmed);
}

function normalizeEpisodeRecordingApiItem(item: EpisodeRecordingApiRawItem): EpisodeRecordingApiItem {
  const normalizedSrc =
    typeof item.records?.src === "string"
      ? item.records.src
      : typeof item.src === "string"
        ? item.src
        : "";

  return {
    id: Number(item.id ?? 0),
    characterName: item.characterName,
    uuid: String(item.uuid ?? ""),
    script: item.script,
    records: normalizedSrc
      ? {
          id: Number(item.records?.id ?? item.id ?? 0),
          src: normalizedSrc,
        }
      : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/* ── GET /hole?episodeId=X&isRecordingSection=true ── */
export async function fetchEpisodeRecordings(
  episodeId: number,
): Promise<EpisodeRecordingsApiResponse> {
  const response = await apiClient.get<{
    data?: {
      items?: EpisodeRecordingApiRawItem[];
    };
    items?: EpisodeRecordingApiRawItem[];
  }>(
    `/hole?episodeId=${encodeURIComponent(String(episodeId))}&isRecordingSection=true`,
  );

  const rawItems = response.data?.items ?? response.items ?? [];

  return {
    data: {
      items: rawItems.map(normalizeEpisodeRecordingApiItem),
    },
  };
}

/* ══════════════════════════════════════════════════════════
   S3 프리사인드 업로드 (① POST → ② S3 PUT → ③ PUT 확정)
   ══════════════════════════════════════════════════════════ */

/** ① POST /files/uploadUrls — presignedUrl + publicUrl 발급 */
interface PresignedUrlItem {
  id: number;
  publicUrl: string;
  mimetype: string;
  presignedUrl: string;
}

interface PresignedUrlResponse {
  data: PresignedUrlItem[];
}

/** Uint8Array → base64 (스택/인자 한도 피하도록 청크 처리) */
function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    const sub = bytes.subarray(i, Math.min(i + chunk, bytes.length));
    binary += String.fromCharCode.apply(null, sub as unknown as number[]);
  }
  return btoa(binary);
}

async function requestPresignedUrl(
  filename: string,
  directory: string,
): Promise<PresignedUrlItem> {
  const res = await apiClient.post<PresignedUrlResponse>("/files/uploadUrls", {
    filenames: [filename],
    directory,
  });
  const item = res.data?.[0];
  if (!item?.presignedUrl) throw new Error("presignedUrl 발급 실패");
  return item;
}

/** ② PUT presignedUrl — S3에 바이너리 업로드 */
async function uploadToS3(presignedUrl: string, blob: Blob): Promise<void> {
  const body = new Uint8Array(await blob.arrayBuffer());

  // 스텁/로컬용 presigned URL: 실제 S3 PUT 없이 확정(③)만 진행.
  if (presignedUrl.includes("mock=true")) {
    return;
  }

  // 실제 AWS: localhost → S3 크로스 오리진 PUT은 버킷 CORS 미설정 시 브라우저가 차단(Provisional headers).
  // Next 서버가 동일 presigned URL로 PUT 하면 CORS 없이 동작한다.
  if (typeof window !== "undefined") {
    const bodyBase64 = bytesToBase64(body);
    const res = await fetch("/api/player-recording-s3", {
      method: "POST",
      headers: withBearerAuth({ "Content-Type": "application/json" }),
      body: JSON.stringify({ presignedUrl, bodyBase64 }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      detail?: string;
    };
    if (!res.ok) {
      const base = data.error ?? `녹음 업로드 프록시 실패: HTTP ${res.status}`;
      throw new Error(data.detail ? `${base} — ${data.detail}` : base);
    }
    return;
  }

  let res: Response;
  try {
    res = await fetch(presignedUrl, {
      method: "PUT",
      body,
    });
  } catch (e) {
    throw new Error("S3 PUT 네트워크 오류", { cause: e });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const trimmed = detail.replace(/\s+/g, " ").trim().slice(0, 300);
    throw new Error(
      `S3 업로드 실패: HTTP ${res.status}${trimmed ? ` — ${trimmed}` : ""}`,
    );
  }
}

/** ③ PUT /files/uploadUrls — 업로드 확정 (`recordingId` 없음) */
async function finalizeUploadOnServer(fileIds: number[]): Promise<void> {
  await apiClient.put("/files/uploadUrls", { ids: fileIds });
}

/** ④ POST /recordings — S3 업로드·확정 후 백엔드에 녹음 메타 등록 */
export async function postRecordingRegistration(body: {
  src: string;
  size: number;
  holeId: number;
}): Promise<void> {
  await apiClient.post("/recordings", body);
}

/** base64 문자열 → Blob 변환 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNums)], { type: mimeType });
}

export interface PostRecordingPayload {
  /** S3 파일명·매핑용 — 홀 uuid */
  holeUuid: string;
  /** `GET /holes` 응답 item.id — `POST /recordings`의 holeId */
  serverHoleId: number;
  src: string;
  size: number;
}

export type EpisodeRecordingUploadStage =
  | "presign"
  | "upload"
  | "finalize"
  | "register";

export class EpisodeRecordingUploadError extends Error {
  stage: EpisodeRecordingUploadStage;
  detail?: string;

  constructor(stage: EpisodeRecordingUploadStage, message: string, detail?: string) {
    super(message);
    this.name = "EpisodeRecordingUploadError";
    this.stage = stage;
    this.detail = detail;
  }
}

function extractErrorDetail(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error ?? "");
}

export function getEpisodeRecordingUploadErrorMessage(error: unknown): string {
  if (error instanceof EpisodeRecordingUploadError) {
    switch (error.stage) {
      case "presign":
        return "녹음 업로드 준비에 실패했습니다.\n잠시 후 다시 시도해 주세요.";
      case "upload":
        return "녹음 파일 업로드에 실패했습니다.\n네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
      case "finalize":
        return "녹음 업로드 확인 처리에 실패했습니다.\n잠시 후 다시 시도해 주세요.";
      case "register":
        return "녹음 적용에 실패했습니다.\n잠시 후 다시 시도해 주세요.";
      default:
        return "녹음 업로드에 실패했습니다.\n잠시 후 다시 시도해 주세요.";
    }
  }

  return "녹음 업로드에 실패했습니다.\n잠시 후 다시 시도해 주세요.";
}

/**
 * 녹음 저장 통합 함수 — 적용하기 버튼에서 호출
 * ① POST /files/uploadUrls → ② S3 PUT → ③ PUT /files/uploadUrls → ④ POST /recordings
 */
export async function postHoleRecording(
  payload: PostRecordingPayload,
): Promise<{ publicUrl: string }> {
  const mimeType = "audio/webm";
  const filename = `recording_${payload.holeUuid}_${Date.now()}.webm`;
  const directory = "recordings";

  let presigned: PresignedUrlItem;
  try {
    presigned = await requestPresignedUrl(filename, directory);
  } catch (error) {
    throw new EpisodeRecordingUploadError(
      "presign",
      "presignedUrl 발급 실패",
      extractErrorDetail(error),
    );
  }

  const blob = base64ToBlob(payload.src, mimeType);
  try {
    await uploadToS3(presigned.presignedUrl, blob);
  } catch (error) {
    throw new EpisodeRecordingUploadError(
      "upload",
      "S3 업로드 실패",
      extractErrorDetail(error),
    );
  }

  try {
    await finalizeUploadOnServer([presigned.id]);
  } catch (error) {
    throw new EpisodeRecordingUploadError(
      "finalize",
      "업로드 확정 실패",
      extractErrorDetail(error),
    );
  }

  try {
    await postRecordingRegistration({
      src: presigned.publicUrl,
      size: payload.size,
      holeId: payload.serverHoleId,
    });
  } catch (error) {
    throw new EpisodeRecordingUploadError(
      "register",
      "녹음 메타 등록 실패",
      extractErrorDetail(error),
    );
  }

  return { publicUrl: presigned.publicUrl };
}

/** uuid 문자열 비교용 — 대소문자·하이픈 차이 흡수 */
function uuidAliasKeys(raw: unknown): string[] {
  const s = String(raw ?? "").trim();
  if (!s) return [];
  const lower = s.toLowerCase();
  const compact = lower.replace(/-/g, "");
  return Array.from(new Set([s, lower, compact]));
}

/**
 * 서버 item.uuid → 플레이어 hole.uuid(캐논 키)로 정규화.
 * 매칭: item.uuid ↔ hole.uuid | hole.script_uuid (별칭 키 포함)
 * uuid 매칭 실패 시, start_ms·id 순으로 같은 개수면 인덱스 보조 매칭(서버·JSON uuid 불일치 대비)
 */
export function buildServerRecordingMapsByHoleUuid(
  holes: Pick<VogopangContentHole, "uuid" | "script_uuid" | "start_ms">[],
  items: EpisodeRecordingApiItem[],
): {
  recordingsByHoleUuid: Record<string, { src: string }>;
  serverHoleIdByHoleUuid: Record<string, number>;
} {
  const anyUuidToHoleUuid = new Map<string, string>();
  const registerHoleKeys = (raw: unknown, canonicalUuid: string) => {
    if (!canonicalUuid) return;
    for (const k of uuidAliasKeys(raw)) {
      anyUuidToHoleUuid.set(k, canonicalUuid);
    }
  };
  for (const h of holes) {
    registerHoleKeys(h.uuid, h.uuid);
    registerHoleKeys(h.script_uuid, h.uuid);
  }

  const resolveHoleUuid = (itemUuid: unknown): string | undefined => {
    for (const k of uuidAliasKeys(itemUuid)) {
      const v = anyUuidToHoleUuid.get(k);
      if (v) return v;
    }
    return undefined;
  };

  const recordingsByHoleUuid: Record<string, { src: string }> = {};
  const serverHoleIdByHoleUuid: Record<string, number> = {};

  for (const item of items) {
    const holeUuid = resolveHoleUuid(item.uuid);
    if (!holeUuid) continue;
    if (Number.isFinite(item.id) && item.id > 0) {
      serverHoleIdByHoleUuid[holeUuid] = item.id;
    }
    if (item.records) {
      recordingsByHoleUuid[holeUuid] = { src: item.records.src.trim() };
    }
  }

  const sortedHoles = [...holes].sort((a, b) => (a.start_ms ?? 0) - (b.start_ms ?? 0));
  const sortedItems = [...items].sort((a, b) => a.id - b.id);
  const n = Math.min(sortedHoles.length, sortedItems.length);
  for (let i = 0; i < n; i++) {
    const hu = sortedHoles[i].uuid;
    const existing = serverHoleIdByHoleUuid[hu];
    if (existing != null && existing > 0) continue;
    const row = sortedItems[i];
    if (row && Number.isFinite(row.id) && row.id > 0) {
      serverHoleIdByHoleUuid[hu] = row.id;
    }
  }

  return { recordingsByHoleUuid, serverHoleIdByHoleUuid };
}

/** `buildServerRecordingMapsByHoleUuid`의 recordings 맵만 필요할 때 */
export function buildServerRecordingMapByHoleUuid(
  holes: Pick<VogopangContentHole, "uuid" | "script_uuid" | "start_ms">[],
  items: EpisodeRecordingApiItem[],
): Record<string, { src: string }> {
  return buildServerRecordingMapsByHoleUuid(holes, items).recordingsByHoleUuid;
}

export function collectHolesFromContent(content: {
  tracks?: Array<{ holes?: VogopangContentHole[] }>;
}): Pick<VogopangContentHole, "uuid" | "script_uuid" | "start_ms">[] {
  const list: Pick<VogopangContentHole, "uuid" | "script_uuid" | "start_ms">[] = [];
  for (const t of content.tracks ?? []) {
    for (const h of t.holes ?? []) {
      list.push({ uuid: h.uuid, script_uuid: h.script_uuid, start_ms: h.start_ms });
    }
  }
  return list;
}
