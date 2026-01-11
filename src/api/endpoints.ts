import { apiClient } from './client';
import type { AnalysisResult, Order, TryOnResult, HistoryItem } from '@/types/api';

// =============================================
// Analysis API
// =============================================

export const analysisApi = {
  /** 이미지 분석 요청 */
  analyze: async (imageBase64: string): Promise<{ id: string }> => {
    const { data } = await apiClient.post('/analyses', { image: imageBase64 });
    return data;
  },

  /** 분석 결과 조회 */
  getResult: async (analysisId: string): Promise<AnalysisResult> => {
    const { data } = await apiClient.get(`/analyses/${analysisId}/result`);
    return data;
  },

  /** 분석 상태 폴링 */
  getStatus: async (analysisId: string): Promise<{ status: 'pending' | 'processing' | 'done' | 'error' }> => {
    const { data } = await apiClient.get(`/analyses/${analysisId}/status`);
    return data;
  },
};

// =============================================
// Try-On API
// =============================================

export const tryOnApi = {
  /** 가상 피팅 요청 */
  request: async (userPhoto: string, productId: string): Promise<{ jobId: string }> => {
    const { data } = await apiClient.post('/tryon', { userPhoto, productId });
    return data;
  },

  /** 피팅 결과 조회 */
  getResult: async (jobId: string): Promise<TryOnResult> => {
    const { data } = await apiClient.get(`/tryon/${jobId}/result`);
    return data;
  },

  /** 피팅 상태 폴링 */
  getStatus: async (jobId: string): Promise<{ status: 'pending' | 'processing' | 'done' | 'error' }> => {
    const { data } = await apiClient.get(`/tryon/${jobId}/status`);
    return data;
  },
};

// =============================================
// Orders API
// =============================================

export const ordersApi = {
  /** 주문 생성 */
  create: async (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const { data } = await apiClient.post('/orders', orderData);
    return data;
  },

  /** 주문 목록 조회 */
  list: async (): Promise<Order[]> => {
    const { data } = await apiClient.get('/orders');
    return data;
  },

  /** 주문 상세 조회 */
  get: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data;
  },
};

// =============================================
// History API
// =============================================

export const historyApi = {
  /** 히스토리 목록 조회 */
  list: async (type?: 'analysis' | 'tryon'): Promise<HistoryItem[]> => {
    const { data } = await apiClient.get('/history', { params: { type } });
    return data;
  },

  /** 히스토리 삭제 */
  delete: async (historyId: string): Promise<void> => {
    await apiClient.delete(`/history/${historyId}`);
  },
};
