// =========================================================
// VALAM — typed API client (talks to the Flask backend)
// =========================================================
import type {
  AuthSession,
  ChatbotEntry,
  Comment,
  CommunityPost,
  Crop,
  CropGuide,
  DiseaseDiagnosis,
  LoginInput,
  OnboardingInput,
  ProductListResponse,
  RegisterInput,
  ToolListing,
  ValamUser,
  WeatherAdvisoryResponse,
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

function updateStoredUser(user: ValamUser) {
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

  // Auth & Profile
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
      /* token expired or invalid */
    }
    clearSession();
  },

  async me(): Promise<ValamUser> {
    const user = await apiRequest<ValamUser>("/auth/me", { auth: true });
    updateStoredUser(user);
    return user;
  },

  async saveOnboarding(input: OnboardingInput): Promise<ValamUser> {
    const user = await apiRequest<ValamUser>("/users/onboarding", {
      method: "POST",
      auth: true,
      body: input,
    });
    updateStoredUser(user);
    return user;
  },

  async updateProfile(input: Partial<ValamUser>): Promise<ValamUser> {
    const user = await apiRequest<ValamUser>("/users/profile", {
      method: "PUT",
      auth: true,
      body: input,
    });
    updateStoredUser(user);
    return user;
  },

  // Crop Management
  async getCrops(): Promise<{ items: Crop[]; total: number }> {
    return apiRequest<{ items: Crop[]; total: number }>("/crops", { auth: true });
  },

  async addCrop(data: {
    crop_name: string;
    variety?: string;
    planting_date: string;
    area_size?: string;
    current_stage?: string;
    notes?: string;
  }): Promise<Crop> {
    return apiRequest<Crop>("/crops", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async updateCrop(id: number, data: Partial<Crop>): Promise<Crop> {
    return apiRequest<Crop>(`/crops/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteCrop(id: number): Promise<void> {
    await apiRequest(`/crops/${id}`, { method: "DELETE", auth: true });
  },

  // Crop Guides & Calendar
  async getCropGuides(
    { crop_name, season, page = 1 }: { crop_name?: string; season?: string; page?: number } = {}
  ): Promise<{ items: CropGuide[]; total: number }> {
    const params = new URLSearchParams({ page: String(page) });
    if (crop_name) params.set("crop_name", crop_name);
    if (season) params.set("season", season);
    return apiRequest<{ items: CropGuide[]; total: number }>(`/crop-guides?${params.toString()}`);
  },

  async getCropGuideDetail(id: number): Promise<CropGuide> {
    return apiRequest<CropGuide>(`/crop-guides/${id}`);
  },

  async createCropGuide(data: Partial<CropGuide>): Promise<CropGuide> {
    return apiRequest<CropGuide>("/crop-guides", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  // Weather Advisory
  async getWeatherAdvisory(location: string = "Vavuniya,LK"): Promise<WeatherAdvisoryResponse> {
    const params = new URLSearchParams({ location });
    return apiRequest<WeatherAdvisoryResponse>(`/weather/advisory?${params.toString()}`);
  },

  // AI Assistant & Disease Diagnosis
  async askChatbot(question: string, category?: string): Promise<ChatbotEntry> {
    return apiRequest<ChatbotEntry>("/chatbot/ask", {
      method: "POST",
      auth: true,
      body: { question, category },
    });
  },

  async getChatHistory(): Promise<{ items: ChatbotEntry[]; total: number }> {
    return apiRequest<{ items: ChatbotEntry[]; total: number }>("/chatbot/history", { auth: true });
  },

  async analyzeDisease(data: { symptoms: string; crop_name?: string; image_url?: string }): Promise<DiseaseDiagnosis> {
    return apiRequest<DiseaseDiagnosis>("/diagnosis/analyze", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async getDiagnosisHistory(): Promise<DiseaseDiagnosis[]> {
    return apiRequest<DiseaseDiagnosis[]>("/diagnosis/history", { auth: true });
  },

  // Community Forum
  async getCommunityPosts(
    { category, search, page = 1 }: { category?: string; search?: string; page?: number } = {}
  ): Promise<{ items: CommunityPost[]; total: number }> {
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    return apiRequest<{ items: CommunityPost[]; total: number }>(`/community/posts?${params.toString()}`);
  },

  async getCommunityPostDetail(id: number): Promise<CommunityPost> {
    return apiRequest<CommunityPost>(`/community/posts/${id}`);
  },

  async createCommunityPost(data: { title: string; content: string; category?: string; image_url?: string }): Promise<CommunityPost> {
    return apiRequest<CommunityPost>("/community/posts", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async addCommunityComment(postId: number, content: string): Promise<Comment> {
    return apiRequest<Comment>(`/community/posts/${postId}/comments`, {
      method: "POST",
      auth: true,
      body: { content },
    });
  },

  async deleteCommunityPost(id: number): Promise<void> {
    await apiRequest(`/community/posts/${id}`, { method: "DELETE", auth: true });
  },

  // Farming Tools Lending
  async getTools(
    { category, search, page = 1 }: { category?: string; search?: string; page?: number } = {}
  ): Promise<{ items: ToolListing[]; total: number }> {
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    return apiRequest<{ items: ToolListing[]; total: number }>(`/tools?${params.toString()}`);
  },

  async getToolDetail(id: number): Promise<ToolListing> {
    return apiRequest<ToolListing>(`/tools/${id}`);
  },

  async createToolListing(data: {
    tool_name: string;
    description?: string;
    category?: string;
    rental_price_per_day: number;
    location?: string;
    contact_phone?: string;
    image_url?: string;
  }): Promise<ToolListing> {
    return apiRequest<ToolListing>("/tools", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async updateToolListing(id: number, data: Partial<ToolListing>): Promise<ToolListing> {
    return apiRequest<ToolListing>(`/tools/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteToolListing(id: number): Promise<void> {
    await apiRequest(`/tools/${id}`, { method: "DELETE", auth: true });
  },

  // Products Marketplace
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
};
