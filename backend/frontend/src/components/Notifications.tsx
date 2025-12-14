import React, { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import useNotificationSocket, {
  NotificationPayload,
} from "./hooks/useNotificationSocket";

interface Notification extends NotificationPayload {
  id: number;
  created_at: string;
}

interface Props {
  userId: string;
}

const NotificationBell: React.FC<Props> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Fetch notifications (using fetch, not axios)
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    const res = await fetch("/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setNotifications(data);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle WebSocket new notification
  useNotificationSocket(userId, (newNotif) => {
    const notif: Notification = {
      id: Date.now(), // fallback if backend does not send id
      created_at: new Date().toISOString(),
      ...newNotif,
    };

    setNotifications((prev) => [notif, ...prev]);
  });

  return (
    <div className="relative">
      <button className="relative" onClick={() => setOpen(!open)}>
        <Bell className="text-gray-700" size={22} />

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg p-3 z-50">
          <h4 className="font-semibold mb-2">Notifications</h4>

          {notifications.length === 0 && (
            <p className="text-sm text-gray-500">No notifications</p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-2 border-b last:border-0 hover:bg-gray-100 rounded cursor-pointer"
            >
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-gray-600">{n.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
