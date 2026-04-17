/** 현재 accessToken 저장 키 */
export const LIBRARY_ACCESS_TOKEN_STORAGE_KEY = "vogopang_auth_access_token";

/** 이전 키 호환용 */
export const LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY = "vogopang_library_access_token";

/** 이전 sessionStorage 기반 키와의 호환을 위해 이름은 유지한다. */
export const LIBRARY_ACCESS_TOKEN_SESSION_KEY = LIBRARY_ACCESS_TOKEN_STORAGE_KEY;

export function getStoredLibraryAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem(LIBRARY_ACCESS_TOKEN_STORAGE_KEY) ??
    localStorage.getItem(LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY) ??
    sessionStorage.getItem(LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY)
  );
}

export function setLibraryAccessTokenInSession(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIBRARY_ACCESS_TOKEN_STORAGE_KEY, token);
  localStorage.removeItem(LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY);
}

export function clearLibraryAccessTokenFromSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LIBRARY_ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(LIBRARY_ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(LEGACY_LIBRARY_ACCESS_TOKEN_STORAGE_KEY);
}
