/**
 * 플레이어 등에서 사용하는 알림 유틸.
 * sonner 미사용 시 콘솔로 대체 (나중에 Toaster + sonner 추가 가능)
 */
const noop = () => {};
const log = (level: string, message: string, description?: string) => {
  if (typeof console !== "undefined") {
    const msg = description ? `${message} ${description}` : message;
    if (level === "error") console.error("[notify]", msg);
    else if (level === "warning") console.warn("[notify]", msg);
    else console.log("[notify]", msg);
  }
};

export const notify = {
  success: (message: string, description?: string) => log("log", message, description),
  error: (message: string, description?: string) => log("error", message, description),
  info: (message: string, description?: string) => log("log", message, description),
  warning: (message: string, description?: string) => log("warning", message, description),
  promise: <T,>(
    promise: Promise<T>,
    _messages: { loading: string; success: string | ((data: T) => string); error: string | ((error: Error) => string) }
  ) => {
    promise.then(noop).catch(noop);
    return promise;
  },
};
