// pages/api/notifications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_BASE_URL, normalizeApiBaseUrl } from '../../lib/api';

/**
 * Proxy endpoint for fetching system notifications for the logged‑in user.
 * The frontend NotificationDropdown component requests `/api/notifications`.
 * This handler forwards the request to the backend Flask admin endpoint
 * `/admin/notifications` and returns the JSON payload unchanged.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const backendUrl = normalizeApiBaseUrl(
    process.env.BACKEND_URL || API_BASE_URL || "http://localhost:5000/api"
  );
  const target = `${backendUrl}/admin/notifications`;

  // Preserve pagination parameters if present
  const url = new URL(target);
  if (query.page) url.searchParams.append('page', String(query.page));
  if (query.limit) url.searchParams.append('limit', String(query.limit));

  try {
    const response = await fetch(url.toString(), {
      method: method ?? "GET",
      headers: {
        // Forward any cookies (e.g., JWT) from the client to the backend
        cookie: req.headers.cookie ?? "",
        authorization: req.headers.authorization ?? "",
      },
      credentials: "include",
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}
