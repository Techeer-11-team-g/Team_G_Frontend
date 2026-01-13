import { apiClient } from './client';
import type {
  // 이미지 업로드
  UploadedImage,
  UploadedImagesResponse,
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
} from '@/types/api';

// =============================================
// 이미지 업로드 API
// =============================================

export const uploadedImagesApi = {
  /** 이미지 업로드 */
  upload: async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/api/v1/uploaded-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** 업로드 이미지 이력 조회 */
  list: async (cursor?: number, limit = 10): Promise<UploadedImagesResponse> => {
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
// 분석 API
// =============================================

export const analysisApi = {
  /** 이미지 분석 시작 */
  start: async (uploadedImageId: number, uploadedImageUrl: string): Promise<AnalysisStartResponse> => {
    const { data } = await apiClient.post('/api/v1/analyses', {
      uploaded_image_id: uploadedImageId,
      uploaded_image_url: uploadedImageUrl,
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
    const { data } = await apiClient.post('/api/v1/orders', request);
    return data;
  },

  /** 주문 목록 조회 */
  list: async (status?: string, cursor?: string, limit?: number): Promise<OrderListResponse> => {
    const { data } = await apiClient.get('/api/v1/orders', {
      params: { status, cursor, limit },
    });
    return data;
  },

  /** 주문 상세 조회 */
  get: async (orderId: number): Promise<OrderDetailResponse> => {
    const { data } = await apiClient.get(`/api/v1/orders/${orderId}`);
    return data;
  },

  /** 주문 취소 */
  cancel: async (orderId: number): Promise<OrderCancelResponse> => {
    const { data } = await apiClient.patch(`/api/v1/orders/${orderId}`, {
      order_status: 'cancelled',
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
