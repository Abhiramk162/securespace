import axios, { AxiosError, AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import type {
  ApiResponse, PaginatedResponse, AuthResponse, LoginPayload, RegisterPayload,
  User, Repository, Scan, Vulnerability, Dependency, DashboardStats,
  ChatMessage, AIExplanation, Report, MonitoringConfig, DependencyGraph
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Axios instance ──────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('ss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('ss_token');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helper ───────────────────────────────────────────────────
function extractData<T>(response: any): T {
  if (response && response.data !== undefined) {
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  }
  return response as T;
}

// ─── Auth API ─────────────────────────────────────────────────
export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<any>('/api/auth/register', payload);
    const data = extractData<any>(res);
    const token = data.access_token || data.token;
    if (token) Cookies.set('ss_token', token, { expires: 7, secure: false, sameSite: 'lax' });
    return { token, user: data.user };
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<any>('/api/auth/login', payload);
    const data = extractData<any>(res);
    const token = data.access_token || data.token;
    const days = payload.rememberMe ? 30 : 7;
    if (token) Cookies.set('ss_token', token, { expires: days, secure: false, sameSite: 'lax' });
    return { token, user: data.user };
  },

  demoLogin: async (): Promise<AuthResponse> => {
    const res = await api.post<any>('/api/auth/demo-login');
    const data = extractData<any>(res);
    const token = data.access_token || data.token;
    if (token) Cookies.set('ss_token', token, { expires: 7, secure: false, sameSite: 'lax' });
    return { token, user: data.user };
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
    Cookies.remove('ss_token');
  },

  me: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/api/auth/me');
    return extractData(res);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>('/api/auth/profile', data);
    return extractData(res);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/api/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/api/auth/reset-password', { token, password });
  },

  githubOAuth: (): void => {
    window.location.href = `${API_URL}/api/auth/github`;
  },

  googleOAuth: (): void => {
    window.location.href = `${API_URL}/api/auth/google`;
  },

  completeOnboarding: async (data: {
    role: string;
    interests: string[];
    notifications: { critical: boolean; high: boolean; weekly: boolean };
  }): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/api/auth/onboarding', data);
    return extractData(res);
  },
};

// ─── Repositories API ─────────────────────────────────────────
export const reposApi = {
  list: async (): Promise<Repository[]> => {
    const res = await api.get<ApiResponse<Repository[]>>('/api/repos');
    return extractData(res);
  },

  get: async (id: string): Promise<Repository> => {
    const res = await api.get<ApiResponse<Repository>>(`/api/repos/${id}`);
    return extractData(res);
  },

  add: async (data: { url?: string; githubFullName?: string }): Promise<Repository> => {
    const res = await api.post<ApiResponse<Repository>>('/api/repos', data);
    return extractData(res);
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/repos/${id}`);
  },

  triggerScan: async (id: string): Promise<Scan> => {
    const res = await api.post<ApiResponse<Scan>>(`/api/repos/${id}/scan`);
    return extractData(res);
  },

  getScanStatus: async (repoId: string, scanId: string): Promise<Scan> => {
    const res = await api.get<ApiResponse<Scan>>(`/api/repos/${repoId}/scans/${scanId}`);
    return extractData(res);
  },

  listScans: async (repoId: string): Promise<Scan[]> => {
    const res = await api.get<ApiResponse<Scan[]>>(`/api/repos/${repoId}/scans`);
    return extractData(res);
  },

  listGitHub: async (): Promise<Array<{ fullName: string; description: string; language: string; stars: number }>> => {
    const res = await api.get<ApiResponse<any[]>>('/api/repos/github/list');
    return extractData(res);
  },
};

// ─── Vulnerabilities API ──────────────────────────────────────
export const vulnsApi = {
  list: async (params?: {
    repoId?: string;
    severity?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    isFixed?: boolean;
  }): Promise<PaginatedResponse<Vulnerability>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<Vulnerability>>>('/api/vulns', { params });
    return extractData(res);
  },

  get: async (id: string): Promise<Vulnerability> => {
    const res = await api.get<ApiResponse<Vulnerability>>(`/api/vulns/${id}`);
    return extractData(res);
  },

  stats: async (repoId?: string): Promise<{
    total: number; critical: number; high: number; medium: number; low: number;
  }> => {
    const res = await api.get<ApiResponse<any>>('/api/vulns/stats', { params: { repoId } });
    return extractData(res);
  },

  markFixed: async (id: string): Promise<void> => {
    await api.patch(`/api/vulns/${id}/fixed`);
  },
};

// ─── Dependencies API ─────────────────────────────────────────
export const depsApi = {
  list: async (repoId: string, params?: { page?: number; pageSize?: number; outdatedOnly?: boolean }): Promise<PaginatedResponse<Dependency>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<Dependency>>>(`/api/deps/${repoId}`, { params });
    return extractData(res);
  },

  graph: async (repoId: string): Promise<DependencyGraph> => {
    const res = await api.get<ApiResponse<DependencyGraph>>(`/api/deps/${repoId}/graph`);
    return extractData(res);
  },
};

// ─── Dashboard API ────────────────────────────────────────────
export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const res = await api.get<ApiResponse<DashboardStats>>('/api/dashboard/stats');
    return extractData(res);
  },
};

// ─── AI API ───────────────────────────────────────────────────
export const aiApi = {
  chat: async (messages: Array<{ role: string; content: string }>, context?: {
    repoId?: string; vulnId?: string;
  }): Promise<{ reply: string; relatedVulns?: string[] }> => {
    const res = await api.post<ApiResponse<any>>('/api/ai/chat', { messages, context });
    return extractData(res);
  },

  explain: async (vulnId: string): Promise<AIExplanation> => {
    const res = await api.post<ApiResponse<AIExplanation>>(`/api/ai/explain/${vulnId}`);
    return extractData(res);
  },

  fix: async (vulnId: string): Promise<{ suggestion: string; codeExample?: string }> => {
    const res = await api.post<ApiResponse<any>>(`/api/ai/fix/${vulnId}`);
    return extractData(res);
  },
};

// ─── Reports API ─────────────────────────────────────────────
export const reportsApi = {
  list: async (): Promise<Report[]> => {
    const res = await api.get<ApiResponse<Report[]>>('/api/reports');
    return extractData(res);
  },

  generate: async (data: {
    repositoryId?: string;
    type: Report['type'];
    format: Report['format'];
    scanId?: string;
  }): Promise<Report> => {
    const res = await api.post<ApiResponse<Report>>('/api/reports/generate', data);
    return extractData(res);
  },

  download: async (id: string): Promise<Blob> => {
    const res = await api.get(`/api/reports/${id}/download`, { responseType: 'blob' });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/reports/${id}`);
  },
};

// ─── Monitoring API ───────────────────────────────────────────
export const monitoringApi = {
  get: async (repoId: string): Promise<MonitoringConfig> => {
    const res = await api.get<ApiResponse<MonitoringConfig>>(`/api/monitoring/${repoId}`);
    return extractData(res);
  },

  update: async (repoId: string, config: Partial<MonitoringConfig>): Promise<MonitoringConfig> => {
    const res = await api.put<ApiResponse<MonitoringConfig>>(`/api/monitoring/${repoId}`, config);
    return extractData(res);
  },
};

export default api;
