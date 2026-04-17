/**
 * API 기본 클라이언트
 * 백엔드 연동 시 BASE_URL만 변경하면 됩니다.
 * 로그인 시 저장된 액세스 토큰이 있으면 `Authorization: Bearer …`를 자동 부착합니다.
 */

import { withBearerAuth } from "../lib/apiAuthHeaders";

const BASE_URL = (import.meta.env.VITE_CORE_API_URL ?? "").trim();

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const isAbsoluteUrl = /^https?:\/\//i.test(path);
  // Next Route Handler 같은 "same-origin" 프록시 경로는 BASE_URL을 붙이면 CORS가 터짐
  const isSameOriginApiRoute = path.startsWith("/api/");
  const url = isAbsoluteUrl || isSameOriginApiRoute || !BASE_URL ? path : `${BASE_URL}${path}`;

  const merged = withBearerAuth(headers);
  if (!merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...rest,
    headers: merged,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  const text = await res.text();
  if (!text.trim()) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),

  delete: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE", body }),
};
