export interface ValamUser {
  id: number | string;
  full_name: string;
  email: string;
  phone?: string;
  farm_location?: string;
  farm_size_acres?: number;
  role?: "farmer" | "admin" | "super_admin" | string;
  status?: "active" | "banned" | string;
  created_at?: string;
  district_asc?: string;
  farmer_type?: string;
  farming_experience?: string;
  main_crops_grown?: string;
  preferred_language?: string;
  onboarding_completed?: boolean;
  farming_category?: "Farmer" | "Home Gardener" | "Terrace Gardener" | "Beginner" | string;
  district?: string;
  ds_division?: string;
  gn_division?: string;
  land_size?: number;
  land_size_unit?: "Acres" | "Perches" | "Hectares" | "Square Feet" | string;
  irrigation_preference?: "Drip Irrigation" | "Sprinkler Irrigation" | "Manual Watering" | string;
  fertilizer_preference?: "Organic" | "Chemical" | string;
}

export interface AdminActivityLog {
  id: number;
  action: string;
  performed_by: string;
  performed_by_id?: number;
  details?: string;
  created_at?: string;
  date?: string;
  time?: string;
}

export interface AdminOverviewStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    banned: number;
    farmers: number;
    home_gardeners: number;
    terrace_gardeners: number;
    beginners: number;
    new_today: number;
    new_this_month: number;
  };
  crops: {
    total_supported: number;
    total_active_records: number;
    most_cultivated: string;
    recently_added: string[];
  };
  diseases: {
    total: number;
    pending: number;
    resolved: number;
  };
  system: {
    total_admins: number;
    online_users: number;
    active_sessions: number;
    total_notifications_sent: number;
  };
}

export interface DiseaseCatalogItem {
  id: number;
  disease_name: string;
  crop_name: string;
  symptoms: string;
  causes?: string;
  organic_treatment?: string;
  chemical_treatment?: string;
  prevention_tips?: string;
  image_url?: string;
  created_at?: string;
}

export interface SystemNotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  target_type: string;
  target_value?: string;
  status: string;
  created_at?: string;
}

export interface UserFeedbackItem {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  admin_reply?: string;
  status: string;
  created_at?: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  is_published: boolean;
  order_num: number;
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: ValamUser;
}

export interface Product {
  id: number | string;
  owner_id?: number | string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  unit?: string;
  quantity_available: number;
  image_url?: string;
  location?: string;
  is_active?: boolean;
}

export interface ProductListResponse {
  items: Product[];
  page?: number;
  per_page?: number;
  total?: number;
}

export interface ChatbotEntry {
  id?: number;
  question: string;
  answer: string;
  category?: string;
  created_at?: string;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  preferred_language?: string;
  farming_category?: string;
  district?: string;
  ds_division?: string;
  gn_division?: string;
  land_size?: number;
  land_size_unit?: string;
  irrigation_preference?: string;
  fertilizer_preference?: string;
  farm_location?: string;
  farm_size_acres?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface OnboardingInput {
  full_name?: string;
  farm_location?: string;
  district_asc?: string;
  farmer_type?: string;
  farming_experience?: string;
  farm_size_acres?: number;
  main_crops_grown?: string;
  preferred_language?: string;
  farming_category?: string;
  district?: string;
  ds_division?: string;
  gn_division?: string;
  land_size?: number;
  land_size_unit?: string;
  irrigation_preference?: string;
  fertilizer_preference?: string;
}

export interface Crop {
  id: number;
  user_id: number;
  crop_name: string;
  variety?: string;
  planting_date: string;
  planting_method?: string;
  land_size?: number;
  land_size_unit?: string;
  irrigation_type?: string;
  fertilizer_preference?: string;
  area_size?: string;
  current_stage: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CropStageAdvice {
  stage_id?: number;
  stage_name?: string;
  icon?: string;
  start_day?: number;
  end_day?: number;
  description?: string;
  expected_appearance?: string;
  daily_tasks?: string[];
  water_requirement?: string;
  fertilizer_recommendation?: string;
  image_url?: string;
  // Legacy compatibility fields
  week?: string;
  stage?: string;
  advice?: string;
}

export interface CropGuide {
  id: number;
  crop_name: string;
  variety?: string;
  recommended_season?: string;
  growth_stages: CropStageAdvice[];
  water_requirements?: string;
  fertilizer_guidance?: string;
  common_problems?: string;
  basic_solutions?: string;
  image_url?: string;
}

export interface PerenualPlantInfo {
  id?: number;
  crop_name: string;
  perenual_id?: number;
  scientific_name?: string;
  family?: string;
  plant_type?: string;
  growth_habit?: string;
  sunlight_requirement?: string;
  water_requirement?: string;
  maintenance_level?: string;
  soil_preference?: string;
  hardiness?: string;
  description?: string;
  image_url?: string;
  reference_images?: string[];
}

export interface AgroAdvisoryItem {
  category: string;
  title: string;
  severity: "info" | "warning" | "alert";
  advice: string;
}

export interface WeatherAdvisoryResponse {
  location: string;
  current: {
    temperature_c?: number;
    humidity_percent?: number;
    condition?: string;
    wind_kmh?: number;
    note?: string;
  };
  forecast?: {
    days?: Array<{ day: number; temperature_c: number; condition: string }>;
  };
  advisories: AgroAdvisoryItem[];
}

export interface DiseaseDiagnosis {
  id: number;
  user_id: number;
  crop_name?: string;
  image_url?: string;
  symptoms: string;
  diagnosis_result: string;
  recommendations: string;
  cause?: string;
  organic_treatment?: string;
  chemical_treatment?: string;
  prevention_advice?: string;
  language?: string;
  status?: string;
  confidence_score?: number;
  disclaimer: string;
  created_at?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  author_name: string;
  content: string;
  created_at?: string;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  author_name: string;
  author_location?: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  comment_count: number;
  created_at?: string;
  comments?: Comment[];
}

export interface ToolListing {
  id: number;
  owner_id: number;
  owner_name: string;
  tool_name: string;
  description?: string;
  category: string;
  rental_price_per_day: number;
  location: string;
  contact_phone: string;
  is_available: boolean;
  image_url?: string;
  created_at?: string;
}
