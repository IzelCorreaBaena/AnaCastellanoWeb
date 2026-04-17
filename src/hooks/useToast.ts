import { useSyncExternalStore } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

const emit = () => listeners.forEach((l) => l());

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => toasts;

export const toast = {
  show(message: string, type: ToastType = 'info', durationMs = 4000) {
    const id = nextId++;
    toasts = [...toasts, { id, message, type }];
    emit();
    if (durationMs > 0) {
      setTimeout(() => toast.hide(id), durationMs);
    }
    return id;
  },
  hide(id?: number) {
    if (typeof id === 'number') {
      toasts = toasts.filter((t) => t.id !== id);
    } else {
      toasts = [];
    }
    emit();
  },
  success(message: string) {
    return toast.show(message, 'success');
  },
  error(message: string) {
    return toast.show(message, 'error');
  },
  warning(message: string) {
    return toast.show(message, 'warning');
  },
  info(message: string) {
    return toast.show(message, 'info');
  },
};

export function useToast() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    toasts: items,
    show: toast.show,
    hide: toast.hide,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  };
}
