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
  CropStageAdvice,
  StageCompostAdvice,
  DiseaseDiagnosis,
  LoginInput,
  OnboardingInput,
  ProductListResponse,
  RegisterInput,
  ToolListing,
  PerenualPlantInfo,
  AdminActivityLog,
  AdminOverviewStats,
  DiseaseCatalogItem,
  SystemNotificationItem,
  UserFeedbackItem,
  FAQItem,
  ValamUser,
  WeatherAdvisoryResponse,
  ManagedCropItem,
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

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.refresh);
}

function updateStoredUser(user: ValamUser) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.access);
  localStorage.removeItem(STORAGE_KEYS.refresh);
  localStorage.removeItem(STORAGE_KEYS.user);
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!res.ok) {
        clearSession();
        return null;
      }

      const json = await res.json();
      const newToken = json?.data?.access_token;
      if (newToken) {
        localStorage.setItem(STORAGE_KEYS.access, newToken);
        if (json.data.user) {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(json.data.user));
        }
        return newToken;
      }
      clearSession();
      return null;
    } catch {
      clearSession();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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

  // Handle 401 Token Expiration with Automatic Refresh
  if (res.status === 401 && auth && path !== "/auth/login" && path !== "/auth/refresh") {
    const newToken = await attemptTokenRefresh();
    if (newToken) {
      // Retry request with fresh access token
      headers["Authorization"] = `Bearer ${newToken}`;
      try {
        res = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch {
        throw new Error(
          `Could not reach the Valam API on retry. Make sure the backend server is running.`
        );
      }
    }
  }

  let payload: { message?: string; data?: T; msg?: string } | null = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const errMsg = payload?.message || payload?.msg || `Request failed (${res.status})`;
    if (res.status === 401 && auth) {
      clearSession();
    }
    throw new Error(errMsg);
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

  async deleteAccount(userId: number | string): Promise<void> {
    await apiRequest(`/users/${userId}`, {
      method: "DELETE",
      auth: true,
    });
    clearSession();
  },

  // Crop Management
  async getCrops(): Promise<{ items: Crop[]; total: number }> {
    return apiRequest<{ items: Crop[]; total: number }>("/crops", { auth: true });
  },

  async addCrop(data: {
    crop_name: string;
    variety?: string;
    planting_date: string;
    planting_method?: string;
    land_size?: number;
    land_size_unit?: string;
    irrigation_type?: string;
    fertilizer_preference?: string;
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

  async getCatalogueCrops(): Promise<{ items: ManagedCropItem[]; total: number }> {
    try {
      return await apiRequest<{ items: ManagedCropItem[]; total: number }>("/catalogue/crops");
    } catch {
      return { items: [], total: 0 };
    }
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

  async updateCropGuide(id: number, data: Partial<CropGuide>): Promise<CropGuide> {
    return apiRequest<CropGuide>(`/crop-guides/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteCropGuide(id: number): Promise<void> {
    await apiRequest(`/crop-guides/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async getPerenualPlantInfo(cropName: string): Promise<PerenualPlantInfo> {
    const params = new URLSearchParams({ crop_name: cropName });
    return apiRequest<PerenualPlantInfo>(`/crops/plant-info?${params.toString()}`);
  },

  async getCropLifecycleImage(data: {
    crop_name: string;
    stage: string;
    variety?: string;
    crop_id?: number;
    crop_age?: number;
  }): Promise<{
    id?: number;
    crop_name: string;
    stage: string;
    image_url: string;
    prompt_used?: string;
    source?: string;
  }> {
    return apiRequest<{
      id?: number;
      crop_name: string;
      stage: string;
      image_url: string;
      prompt_used?: string;
      source?: string;
    }>("/crops/lifecycle-image", {
      method: "POST",
      body: data,
    });
  },

  // Admin Management Endpoints
  async getAdminStats(): Promise<AdminOverviewStats> {
    return apiRequest<AdminOverviewStats>("/admin/stats", { auth: true });
  },

  async getAdminUsers(params: { search?: string; category?: string; district?: string; status?: string; page?: number; per_page?: number } = {}): Promise<{ items: ValamUser[]; total: number; pages: number }> {
    const qp = new URLSearchParams();
    if (params.search) qp.set("search", params.search);
    if (params.category) qp.set("category", params.category);
    if (params.district) qp.set("district", params.district);
    if (params.status) qp.set("status", params.status);
    if (params.page) qp.set("page", String(params.page));
    if (params.per_page) qp.set("per_page", String(params.per_page));
    return apiRequest<{ items: ValamUser[]; total: number; pages: number }>(`/admin/users?${qp.toString()}`, { auth: true });
  },

  async createAdminUser(data: Partial<ValamUser> & { password?: string }): Promise<ValamUser> {
    return apiRequest<ValamUser>("/admin/users", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async updateAdminUserProfile(userId: number | string, data: Partial<ValamUser>): Promise<ValamUser> {
    return apiRequest<ValamUser>(`/admin/users/${userId}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async resetUserPassword(userId: number | string, password: string): Promise<void> {
    await apiRequest(`/admin/users/${userId}/reset-password`, {
      method: "PUT",
      auth: true,
      body: { password },
    });
  },

  async banUser(userId: number | string, status?: string, reason?: string): Promise<ValamUser> {
    return apiRequest<ValamUser>(`/admin/users/${userId}/ban`, {
      method: "PUT",
      auth: true,
      body: { status, reason },
    });
  },

  async deleteAdminUser(userId: number | string): Promise<void> {
    await apiRequest(`/admin/users/${userId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async getAdminAccounts(): Promise<ValamUser[]> {
    return apiRequest<ValamUser[]>("/admin/accounts", { auth: true });
  },

  async createAdminAccount(data: { full_name: string; email: string; password: string; role?: string }): Promise<ValamUser> {
    return apiRequest<ValamUser>("/admin/accounts", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async updateAdminAccount(id: number | string, data: Partial<ValamUser> & { password?: string }): Promise<ValamUser> {
    return apiRequest<ValamUser>(`/admin/accounts/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteAdminAccount(id: number | string): Promise<void> {
    await apiRequest(`/admin/accounts/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  // Disease Catalog & Reports
  async getDiseaseCatalog(): Promise<DiseaseCatalogItem[]> {
    return apiRequest<DiseaseCatalogItem[]>("/admin/diseases", { auth: true });
  },

  async createDiseaseEntry(data: Partial<DiseaseCatalogItem>): Promise<DiseaseCatalogItem> {
    return apiRequest<DiseaseCatalogItem>("/admin/diseases", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async updateDiseaseEntry(id: number, data: Partial<DiseaseCatalogItem>): Promise<DiseaseCatalogItem> {
    return apiRequest<DiseaseCatalogItem>(`/admin/diseases/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteDiseaseEntry(id: number): Promise<void> {
    await apiRequest(`/admin/diseases/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async getFarmerDiseaseReports(): Promise<DiseaseDiagnosis[]> {
    return apiRequest<DiseaseDiagnosis[]>("/admin/disease-reports", { auth: true });
  },

  async updateFarmerDiseaseReport(id: number, data: { status?: string; recommendations?: string }): Promise<DiseaseDiagnosis> {
    return apiRequest<DiseaseDiagnosis>(`/admin/disease-reports/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  // System Notifications
  async getSystemNotifications(): Promise<SystemNotificationItem[]> {
    return apiRequest<SystemNotificationItem[]>("/admin/notifications", { auth: true });
  },

  async createSystemNotification(data: Partial<SystemNotificationItem>): Promise<SystemNotificationItem> {
    return apiRequest<SystemNotificationItem>("/admin/notifications", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async deleteSystemNotification(id: number): Promise<void> {
    await apiRequest(`/admin/notifications/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  // Feedback & FAQs
  async getUserFeedback(): Promise<UserFeedbackItem[]> {
    return apiRequest<UserFeedbackItem[]>("/admin/feedback", { auth: true });
  },

  async replyUserFeedback(id: number, data: { admin_reply?: string; status?: string }): Promise<UserFeedbackItem> {
    return apiRequest<UserFeedbackItem>(`/admin/feedback/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteUserFeedback(id: number): Promise<void> {
    await apiRequest(`/admin/feedback/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async getAllAdminFAQs(): Promise<FAQItem[]> {
    return apiRequest<FAQItem[]>("/admin/faqs/all", { auth: true });
  },

  async createFAQItem(data: Partial<FAQItem>): Promise<FAQItem> {
    return apiRequest<FAQItem>("/admin/faqs", {
      method: "POST",
      auth: true,
      body: data,
    });
  },

  async updateFAQItem(id: number, data: Partial<FAQItem>): Promise<FAQItem> {
    return apiRequest<FAQItem>(`/admin/faqs/${id}`, {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async deleteFAQItem(id: number): Promise<void> {
    await apiRequest(`/admin/faqs/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  // System Settings
  async getSystemSettings(): Promise<Record<string, string>> {
    return apiRequest<Record<string, string>>("/admin/settings", { auth: true });
  },

  async updateSystemSettings(data: Record<string, string>): Promise<void> {
    await apiRequest("/admin/settings", {
      method: "PUT",
      auth: true,
      body: data,
    });
  },

  async getAdminLogs(page: number = 1): Promise<{ items: AdminActivityLog[]; total: number }> {
    return apiRequest<{ items: AdminActivityLog[]; total: number }>(`/admin/logs?page=${page}`, { auth: true });
  },

  // Weather Advisory
  async getWeatherAdvisory(location: string = "Vavuniya,LK"): Promise<WeatherAdvisoryResponse> {
    const params = new URLSearchParams({ location });
    return apiRequest<WeatherAdvisoryResponse>(`/weather/advisory?${params.toString()}`);
  },

  // AI Assistant & Disease Diagnosis
  async askChatbot(
    question: string,
    category?: string,
    language?: string,
    pageContext?: Record<string, any>
  ): Promise<ChatbotEntry> {
    return apiRequest<ChatbotEntry>("/chatbot/ask", {
      method: "POST",
      auth: true,
      body: { question, category, language, page_context: pageContext },
    });
  },

  async getChatHistory(): Promise<{ items: ChatbotEntry[]; total: number }> {
    return apiRequest<{ items: ChatbotEntry[]; total: number }>("/chatbot/history", { auth: true });
  },

  async analyzeDisease(data: { symptoms: string; crop_name?: string; image_url?: string; language?: string }): Promise<DiseaseDiagnosis> {
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

  // Gemini AI Features (Backend Integration)
  async askFarmingAssistant(question: string, language: string = "English"): Promise<{ answer: string }> {
    return apiRequest<{ answer: string }>("/ai/farming-assistant", {
      method: "POST",
      body: { question, language },
    });
  },

  async getDiseaseExplanation(data: {
    crop: string;
    disease: string;
    analysis?: string;
    symptoms?: string;
    language?: string;
  }): Promise<{ explanation: string }> {
    return apiRequest<{ explanation: string }>("/ai/disease-explanation", {
      method: "POST",
      body: data,
    });
  },

  async translateText(text: string, target_language: string = "English"): Promise<{ translated_text: string }> {
    return apiRequest<{ translated_text: string }>("/ai/translate", {
      method: "POST",
      body: { text, target_language },
    });
  },

  async suggestAgronomyPlan(params: {
    crop_name: string;
    variety?: string;
    planting_method?: string;
    fertilizer_type?: string;
    season?: string;
    district?: string;
  }): Promise<{
    crop_name: string;
    variety?: string;
    total_days: number;
    planting_method?: string;
    fertilizer_type?: string;
    recommended_season?: string;
    water_requirements?: string;
    irrigation_method?: string;
    fertilizer_guidance?: string;
    common_problems?: string;
    basic_solutions?: string;
    growth_stages: CropStageAdvice[];
    stage_composts: StageCompostAdvice[];
  }> {
    return apiRequest("/crop-guides/suggest-agronomy", {
      method: "POST",
      auth: true,
      body: params,
    });
  },
};
