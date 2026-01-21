import { apiClient } from './client';
import type {
  // 인증
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  // 이미지 업로드
  UploadedImage,
  UploadedImagesResponse,
  UserImage,
  // 분석
  AnalysisStartResponse,
  AnalysisStatusResponse,
  AnalysisResultResponse,
  AnalysisPatchRequest,
  // 피팅
  FittingRequest,
  FittingStartResponse,
  FittingStatusResponse,
  FittingResultResponse,
  // 장바구니
  CartResponse,
  CartAddRequest,
  CartAddResponse,
  // 주문
  OrderCreateRequest,
  OrderCreateResponse,
  OrderListResponse,
  OrderDetailResponse,
  OrderCancelResponse,
  // 사용자
  OnboardingRequest,
  UserProfile,
  UserProfileUpdateRequest,
  // 히스토리
  HistoryResponse,
  // 채팅
  ChatResponse,
  ChatStatusRequest,
  ChatSession,
} from '@/types/api';

// =============================================
// 인증 API
// =============================================

export const authApi = {
  /** 회원가입 */
  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/register', request);
    return data;
  },

  /** 로그인 */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/login', request);
    return data;
  },

  /** 토큰 갱신 */
  refresh: async (request: RefreshRequest): Promise<RefreshResponse> => {
    const { data } = await apiClient.post('/api/v1/auth/refresh', request);
    return data;
  },
};

// =============================================
// 이미지 업로드 API
// =============================================

export const uploadedImagesApi = {
  /** 이미지 업로드 (auto_analyze=true로 분석 자동 시작) */
  upload: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_analyze', 'true');
    const { data } = await apiClient.post('/api/v1/uploaded-images', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  /** 업로드 이미지 이력 조회 */
  list: async (cursor?: string, limit = 10): Promise<UploadedImagesResponse> => {
    const { data } = await apiClient.get('/api/v1/uploaded-images', {
      params: { cursor, limit },
    });
    return data;
  },

  /** 통합 히스토리 조회 */
  getHistory: async (
    uploadedImageId: number,
    cursor?: string,
    limit = 10
  ): Promise<HistoryResponse> => {
    const { data } = await apiClient.get(`/api/v1/uploaded-images/${uploadedImageId}`, {
      params: { cursor, limit },
    });
    return data;
  },
};

// =============================================
// 유저 이미지 API (전신 사진)
// =============================================

export const userImagesApi = {
  /** 유저 전신 사진 업로드 */
  upload: async (file: File): Promise<UserImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/api/v1/user-images', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },
};

// =============================================
// 분석 API
// =============================================

export const analysisApi = {
  /** 이미지 분석 시작 */
  start: async (uploadedImageId: number): Promise<AnalysisStartResponse> => {
    const { data } = await apiClient.post('/api/v1/analyses', {
      uploaded_image_id: uploadedImageId,
    });
    return data;
  },

  /** 분석 상태 조회 */
  getStatus: async (analysisId: number): Promise<AnalysisStatusResponse> => {
    const { data } = await apiClient.get(`/api/v1/analyses/${analysisId}/status`);
    return data;
  },

  /** 분석 결과 조회 */
  getResult: async (analysisId: number): Promise<AnalysisResultResponse> => {
    const { data } = await apiClient.get(`/api/v1/analyses/${analysisId}`);
    return data;
  },

  /** 자연어 기반 결과 수정 */
  patch: async (request: AnalysisPatchRequest): Promise<AnalysisResultResponse> => {
    const { data } = await apiClient.patch('/api/v1/analyses', request);
    return data;
  },
};

// =============================================
// 가상 피팅 API
// =============================================

export const fittingApi = {
  /** 가상 피팅 요청 */
  request: async (request: FittingRequest): Promise<FittingStartResponse> => {
    const { data } = await apiClient.post('/api/v1/fitting-images', request);
    return data;
  },

  /** 피팅 상태 조회 */
  getStatus: async (fittingImageId: number): Promise<FittingStatusResponse> => {
    const { data } = await apiClient.get(`/api/v1/fitting-images/${fittingImageId}/status`);
    return data;
  },

  /** 피팅 결과 조회 */
  getResult: async (fittingImageId: number): Promise<FittingResultResponse> => {
    const { data } = await apiClient.get(`/api/v1/fitting-images/${fittingImageId}`);
    return data;
  },
};

// =============================================
// 장바구니 API
// =============================================

export const cartApi = {
  /** 장바구니 조회 */
  get: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get('/api/v1/cart-items');
    return data;
  },

  /** 장바구니 상품 추가 */
  add: async (request: CartAddRequest): Promise<CartAddResponse> => {
    const { data } = await apiClient.post('/api/v1/cart-items', request);
    return data;
  },

  /** 장바구니 상품 삭제 */
  remove: async (cartItemId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/cart-items/${cartItemId}`);
  },
};

// =============================================
// 주문 API
// =============================================

export const ordersApi = {
  /** 주문 생성 */
  create: async (request: OrderCreateRequest): Promise<OrderCreateResponse> => {
    const { data } = await apiClient.post('/api/v1/orders/', request);
    return data;
  },

  /** 주문 목록 조회 */
  list: async (status?: string, cursor?: string, limit?: number): Promise<OrderListResponse> => {
    const { data } = await apiClient.get('/api/v1/orders/', {
      params: { status, cursor, limit },
    });
    return data;
  },

  /** 주문 상세 조회 */
  get: async (orderId: number): Promise<OrderDetailResponse> => {
    const { data } = await apiClient.get(`/api/v1/orders/${orderId}/`);
    return data;
  },

  /** 주문 취소 */
  cancel: async (orderId: number): Promise<OrderCancelResponse> => {
    const { data } = await apiClient.patch(`/api/v1/orders/${orderId}/`, {
      order_status: 'canceled',
    });
    return data;
  },
};

// =============================================
// 사용자 API
// =============================================

export const usersApi = {
  /** 사용자 필수 정보 등록 (온보딩) */
  onboarding: async (request: OnboardingRequest): Promise<UserProfile> => {
    const { data } = await apiClient.patch('/api/v1/users/onboarding', request);
    return data;
  },

  /** 사용자 정보 조회 */
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get('/api/v1/users/profile');
    return data;
  },

  /** 사용자 정보 수정 */
  updateProfile: async (request: UserProfileUpdateRequest): Promise<UserProfile> => {
    const { data } = await apiClient.patch('/api/v1/users/profile', request);
    return data;
  },
};

// =============================================
// 채팅 API (통합 인터페이스)
// =============================================

export const chatApi = {
  /** 채팅 메시지 전송 (텍스트 전용) */
  send: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    const { data } = await apiClient.post('/api/v1/chat', {
      message,
      session_id: sessionId,
    });
    return data;
  },

  /** 채팅 메시지 전송 (이미지 포함) */
  sendWithImage: async (
    message: string,
    image: File,
    sessionId?: string
  ): Promise<ChatResponse> => {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('image', image);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }
    const { data } = await apiClient.post('/api/v1/chat', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },

  /** 비동기 작업 상태 확인 */
  checkStatus: async (request: ChatStatusRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post('/api/v1/chat/status', request);
    return data;
  },

  /** 세션 정보 조회 */
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const { data } = await apiClient.get(`/api/v1/chat/sessions/${sessionId}`);
    return data;
  },

  /** 세션 삭제 (대화 초기화) */
  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/chat/sessions/${sessionId}`);
  },
};

// =============================================
// 피드 API (Pinterest 스타일)
// =============================================

import type {
  FeedResponse,
  VisibilityToggleRequest,
} from '@/types/api';

export const feedApi = {
  /** 공개 피드 조회 */
  getPublicFeed: async (params?: {
    limit?: number;
    cursor?: string;
    category?: string;
  }): Promise<FeedResponse> => {
    const { data } = await apiClient.get('/api/v1/feed', { params });
    return data;
  },

  /** 내 히스토리 조회 */
  getMyHistory: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<FeedResponse> => {
    const { data } = await apiClient.get('/api/v1/my-history', { params });
    return data;
  },

  /** 공개/비공개 토글 */
  toggleVisibility: async (
    imageId: number,
    request: VisibilityToggleRequest
  ): Promise<void> => {
    await apiClient.patch(`/api/v1/uploaded-images/${imageId}/visibility`, request);
  },
};
