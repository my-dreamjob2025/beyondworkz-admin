import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import api, { getAccessToken } from "../services/api";

function getSocketBaseUrl() {
  const raw = import.meta.env.VITE_SOCKET_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  try {
    const u = new URL(apiUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:5001";
  }
}

function mapServerNotification(n) {
  if (!n) return null;
  const unread = n.unread !== false && !n.read;
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    timeLabel: n.timeLabel,
    unread,
    type: n.type,
    meta: n.meta || {},
  };
}

export function useNotifications(enabled) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const { data } = await api.get("/notifications");
      if (data?.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications.map(mapServerNotification).filter(Boolean));
        setUnreadCount(
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : data.notifications.filter((x) => x.unread !== false && !x.read).length,
        );
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || loading) return undefined;
    const token = getAccessToken();
    if (!token) return undefined;

    const socket = io(getSocketBaseUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socket.on("notification", ({ notification }) => {
      const mapped = mapServerNotification(notification);
      if (!mapped) return;
      setNotifications((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
      if (mapped.unread) setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled, loading]);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      return;
    }
    let wasUnread = false;
    setNotifications((prev) => {
      const t = prev.find((x) => x.id === id);
      wasUnread = !!t?.unread;
      return prev.map((x) => (x.id === id ? { ...x, unread: false } : x));
    });
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.post("/notifications/read-all");
    } catch {
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}
