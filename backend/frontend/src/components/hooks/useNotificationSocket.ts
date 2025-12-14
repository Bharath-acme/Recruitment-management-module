import { useEffect } from "react";

export interface NotificationPayload {
  id?: number;
  title: string;
  message: string;
  requisition_id?: number;
  type?: string;
  created_at?: string;
}

export default function useNotificationSocket(
  userId: string | undefined,
  onMessage: (data: NotificationPayload) => void
) {
  useEffect(() => {
    if (!userId) return;

    const WS_URL =
      window.location.hostname === "localhost"
        ? `ws://localhost:8000/ws/notifications/${userId}`
        : `wss://${window.location.hostname}/ws/notifications/${userId}`;

    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("🔌 WebSocket connected");
    };

    socket.onmessage = (event: MessageEvent) => {
      console.log("📩 New WS message:", event.data);

      try {
        const data: NotificationPayload = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.warn("Invalid WS JSON message:", e);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [userId, onMessage]);
}
