export interface ValamUser {
  id: number | string;
  full_name: string;
  email: string;
  phone?: string;
  farm_location?: string;
  farm_size_acres?: number;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: ValamUser;
}

export interface Product {
  id: number | string;
  name: string;
  category?: string;
  price: number;
  quantity_available: number;
}

export interface ProductListResponse {
  items: Product[];
  page?: number;
  per_page?: number;
  total?: number;
}

export interface ChatbotEntry {
  question: string;
  answer: string;
  category?: string;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  farm_location?: string;
  farm_size_acres?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}
