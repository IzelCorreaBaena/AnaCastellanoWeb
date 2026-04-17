import { useState, useEffect, useCallback } from 'react';
import { http } from '@services/http';
import type { NotificationsSummary } from '@app-types/models';

const EMPTY: NotificationsSummary = {
  pendingReservations: 0,
  unreadMessages: 0,
  total: 0,
};

const POLL_INTERVAL_MS = 60_000;

export function useNotifications(enabled = true): {
  notifications: NotificationsSummary;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<NotificationsSummary>(EMPTY);

  const refresh = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    try {
      const res = await http.get<NotificationsSummary>('/notifications');
      setData(res.data);
    } catch {
      // Silently ignore — user may be logged out or endpoint unavailable.
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [enabled, refresh]);

  return { notifications: data, refresh };
}
