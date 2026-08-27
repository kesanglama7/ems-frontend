import { create } from "zustand";

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogState {
  open: boolean;
  options: ConfirmDialogOptions | null;

  confirm: (options: ConfirmDialogOptions) => void;
  close: () => void;
}

export const useConfirmDialogStore =
  create<ConfirmDialogState>((set) => ({
    open: false,
    options: null,

    confirm: (options) =>
      set({
        open: true,
        options,
      }),

    close: () =>
      set({
        open: false,
        options: null,
      }),
  }));
