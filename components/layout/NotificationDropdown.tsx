// NotificationDropdown.tsx
import { useEffect, useRef, useState } from "react";
import { X, RefreshCcw } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message?: string;
  read?: boolean;
}

interface ApiResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

interface Props {
  onClose: () => void;
}

/**
 * Dropdown that displays a list of notifications.
 * - Fetches from `/api/notifications?page={page}&limit={limit}`.
 * - Manual refresh via Refresh button.
 * - Pagination controls (Prev/Next).
 */
export default function NotificationDropdown({ onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${pageNumber}&limit=${limit}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // Support both paginated response {notifications, total, page} and plain array
        if (Array.isArray(data)) {
          setNotifications(data);
          setTotal(data.length);
          setPage(pageNumber);
        } else {
          setNotifications(data.notifications || []);
          setTotal(data.total || (data.notifications?.length ?? 0));
          setPage(data.page || pageNumber);
        }
      } else {
        console.error("Failed to load notifications:", res.status);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }
// End of fetchNotifications
  // Load when page changes
  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div
      id="notification-dropdown"
      ref={dropdownRef}
      className="notification-dropdown absolute right-4 top-16 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
      style={{ maxHeight: "420px", overflowY: "auto" }}
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-800">Notifications</h4>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={() => fetchNotifications(page)}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Refresh notifications"
          >
            <RefreshCcw size={16} className="text-gray-500" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close notifications"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        {loading ? (
          <p className="text-center text-gray-500 text-sm py-4">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-2 rounded-md mb-2 ${n.read ? "bg-gray-50" : "bg-indigo-50"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                  )}
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
  }