"use client";

import { create } from "zustand";

interface GlobalSnackBarState {
  open: boolean;
  message: string;
  serial: number;
  showSnackBar: (message: string) => void;
  closeSnackBar: () => void;
}

export const useGlobalSnackBarStore = create<GlobalSnackBarState>((set, get) => ({
  open: false,
  message: "",
  serial: 0,
  showSnackBar: (message) => {
    const nextSerial = get().serial + 1;
    set({ open: false });
    window.setTimeout(() => {
      set({
        open: true,
        message,
        serial: nextSerial,
      });
    }, 0);
  },
  closeSnackBar: () => set({ open: false }),
}));

