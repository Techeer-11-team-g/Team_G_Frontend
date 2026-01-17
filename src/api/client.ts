import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 가져오기 헬퍼
function getTokens() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return {
        accessToken: parsed?.state?.accessToken,
        refreshToken: parsed?.state?.refreshToken,
      };
    }
  } catch {
    // 파싱 실패 시 무시
  }
  return { accessToken: null, refreshToken: null };
}

// 토큰 업데이트 헬퍼
function updateTokens(access: string, refresh: string) {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      parsed.state.accessToken = access;
      parsed.state.refreshToken = refresh;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch {
    // 실패 시 무시
  }
}

// 로그아웃 헬퍼
function clearAuth() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      parsed.state = {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      };
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch {
    // 실패 시 무시
  }
}

// 요청 인터셉터 - JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    console.log('[API] Request:', config.url, 'Token:', accessToken ? 'exists' : 'none');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 토큰 갱신 중 플래그
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// 응답 인터셉터 - 401 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 로그인/회원가입/토큰갱신 요청은 제외
      const authUrls = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];
      if (authUrls.some((url) => originalRequest.url?.includes(url))) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 이미 갱신 중이면 대기
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = getTokens();

      if (!refreshToken) {
        clearAuth();
        isRefreshing = false;
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/v1/auth/refresh`,
          { refresh: refreshToken }
        );

        const newAccessToken = data.access;
        const newRefreshToken = data.refresh;

        updateTokens(newAccessToken, newRefreshToken);
        onTokenRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
