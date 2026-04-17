import { getStoredLibraryAccessToken } from "../auth/libraryAccessTokenStorage";

function getStoredAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/** 브라우저에서 저장된 액세스 토큰으로 `Authorization` 값 생성. SSR/없으면 `null`. */
export function getBearerAuthorizationHeader(): string | null {
  const token =
    getStoredLibraryAccessToken()?.trim() ||
    getStoredAdminAccessToken()?.trim();
  return token ? `Bearer ${token}` : null;
}

/** `fetch` / `apiClient`용 — 기존 `Authorization`이 없을 때만 Bearer 부착 */
export function withBearerAuth(headers?: HeadersInit): Headers {
  const out = new Headers(headers);
  if (!out.has("Authorization")) {
    const bearer = getBearerAuthorizationHeader();
    if (bearer) {
      out.set("Authorization", bearer);
    }
  }
  return out;
}
