import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/api';
import type {
  OrderListResponse,
  OrderDetailResponse,
  OrderCancelResponse,
  OrderCreateRequest,
  OrderCreateResponse,
} from '@/types/api';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  list: (status?: string) => [...orderKeys.all, 'list', status] as const,
  detail: (orderId: number) => [...orderKeys.all, 'detail', orderId] as const,
};

// 주문 목록 조회
export function useOrders(status?: string) {
  return useQuery<OrderListResponse>({
    queryKey: orderKeys.list(status),
    queryFn: () => ordersApi.list(status),
    staleTime: 1000 * 60 * 10, // 10분
  });
}

// 주문 상세 조회
export function useOrderDetail(orderId: number | null) {
  return useQuery<OrderDetailResponse>({
    queryKey: orderKeys.detail(orderId!),
    queryFn: () => ordersApi.get(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 10, // 10분
  });
}

// 주문 취소
export function useOrderCancel() {
  const queryClient = useQueryClient();

  return useMutation<OrderCancelResponse, Error, number>({
    mutationFn: (orderId) => ordersApi.cancel(orderId),
    onSuccess: () => {
      // 주문 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// 주문 생성
export function useOrderCreate() {
  const queryClient = useQueryClient();

  return useMutation<OrderCreateResponse, Error, OrderCreateRequest>({
    mutationFn: (request) => ordersApi.create(request),
    onSuccess: () => {
      // 주문 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      // 장바구니 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
