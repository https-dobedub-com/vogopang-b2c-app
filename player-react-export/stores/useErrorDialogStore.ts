import { create } from "zustand";

interface ErrorDialogOptions {
  showCancel?: boolean;
  onCancel?: () => void;
}

interface ErrorDialogState {
  isOpenError: boolean;
  errorMessage: string;
  title: string;
  showCancel: boolean;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  openErrorTitleDialog: (title: string, message: string, onConfirm?: () => void, options?: ErrorDialogOptions) => void;
  openErrorDialog: (message: string, onConfirm?: () => void, options?: ErrorDialogOptions) => void;
  closeDialog: () => void;
  openErrorConfirmDialog: (title: string, message: string, onConfirm?: () => void, options?: ErrorDialogOptions) => void;
}

export const useErrorDialogStore = create<ErrorDialogState>((set) => ({
  isOpenError: false,
  errorMessage: "",
  title: "확인",
  showCancel: false,
  onConfirm: null,
  onCancel: null,

  openErrorConfirmDialog: (title: string, message: string, onConfirm?: () => void, options?: ErrorDialogOptions) => {
    set({
      isOpenError: true,
      errorMessage: message,
      title,
      showCancel: options?.showCancel ?? false,
      onConfirm: onConfirm ?? null,
      onCancel: options?.onCancel ?? null,
    });
  },
  openErrorTitleDialog: (ttitle: string, message: string, onConfirm?: () => void, options?: ErrorDialogOptions) => {
    set({
      isOpenError: true,
      errorMessage: message,
      title: ttitle,
      showCancel: options?.showCancel ?? false,
      onConfirm: onConfirm ?? null,
      onCancel: options?.onCancel ?? null,
    });
  },
  openErrorDialog: (message: string, onConfirm?: () => void, options?: ErrorDialogOptions) => {
    set({
      isOpenError: true,
      errorMessage: message,
      title: "확인",
      showCancel: options?.showCancel ?? false,
      onConfirm: onConfirm ?? null,
      onCancel: options?.onCancel ?? null,
    });
  },
  closeDialog: () => {
    set({ isOpenError: false, errorMessage: "", showCancel: false, onConfirm: null, onCancel: null });
  },
}));
