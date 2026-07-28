// =========================================================
// VALAM — typed API client (talks to the Flask backend)
// Ported 1:1 from js/api.js, keeping the same storage keys and
// endpoints so an existing browser session survives the migration.
// =========================================================
import type {
  AuthSession,
  ChatbotEntry,
  LoginInput,
  ProductListResponse,
  RegisterInput,
  ValamUser,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const STORAGE_KEYS = {
  access: "valam_access_token",
  refresh: "valam_refresh_token",
  user: "valam_user",
} as const;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.access);
}

function getStoredUser(): ValamUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  return raw ? (JSON.parse(raw) as ValamUser) : null;
}

function isLoggedIn(): boolean {
  return !!getToken();
}

function setSession({ access_token, refresh_token, user }: AuthSession) {
  localStorage.setItem(STORAGE_KEYS.access, access_token);
  localStorage.setItem(STORAGE_KEYS.refresh, refresh_token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.access);
  localStorage.removeItem(STORAGE_KEYS.refresh);
  localStorage.removeItem(STORAGE_KEYS.user);
}

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = false }: ApiRequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      `Could not reach the Valam API. Make sure the backend server is running on ${API_BASE_URL}.`
    );
  }

  let payload: { message?: string; data?: T } | null = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    throw new Error(payload?.message || `Request failed (${res.status})`);
  }

  return payload?.data as T;
}

export const ValamAPI = {
  isLoggedIn,
  getStoredUser,
  clearSession,

  async register(input: RegisterInput): Promise<AuthSession> {
    const data = await apiRequest<AuthSession>("/auth/register", {
      method: "POST",
      body: input,
    });
    setSession(data);
    return data;
  },

  async login(input: LoginInput): Promise<AuthSession> {
    const data = await apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: input,
    });
    setSession(data);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest("/auth/logout", { method: "POST", auth: true });
    } catch {
      /* token may already be invalid/expired — clear local session regardless */
    }
    clearSession();
  },

  async me(): Promise<ValamUser> {
    return apiRequest<ValamUser>("/auth/me", { auth: true });
  },

  async getProducts(
    { search, page = 1, per_page = 20 }: { search?: string; page?: number; per_page?: number } = {}
  ): Promise<ProductListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
    });
    if (search) params.set("search", search);
    return apiRequest<ProductListResponse>(`/products?${params.toString()}`);
  },

  async askChatbot(question: string, category?: string): Promise<ChatbotEntry> {
    return apiRequest<ChatbotEntry>("/chatbot/ask", {
      method: "POST",
      auth: true,
      body: { question, category },
    });
  },
};
