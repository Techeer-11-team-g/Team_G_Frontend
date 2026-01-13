import { useMutation, useQuery } from '@tanstack/react-query';
import { fittingApi } from '@/api';
import type {
  FittingRequest,
  FittingStartResponse,
  FittingStatusResponse,
  FittingResultResponse,
} from '@/types/api';

/**
 * 가상 피팅 요청 mutation
 */
export function useTryOnMutation() {
  return useMutation<FittingStartResponse, Error, FittingRequest>({
    mutationFn: (request: FittingRequest) => fittingApi.request(request),
    onError: (error) => {
      console.error('Try-on request failed:', error);
    },
  });
}

/**
 * 피팅 상태 폴링 (PENDING -> RUNNING -> DONE)
 */
export function useTryOnStatus(fittingImageId: number | null, enabled = true) {
  return useQuery<FittingStatusResponse>({
    queryKey: ['tryon', 'status', fittingImageId],
    queryFn: () => fittingApi.getStatus(fittingImageId!),
    enabled: enabled && !!fittingImageId,
    refetchInterval: (query) => {
      const status = query.state.data?.fitting_image_status;
      if (status === 'DONE' || status === 'ERROR') return false;
      return 1500; // 1.5초마다 폴링
    },
  });
}

/**
 * 피팅 결과 조회 (status가 DONE일 때만 fetch)
 */
export function useTryOnResult(fittingImageId: number | null, enabled = true) {
  return useQuery<FittingResultResponse>({
    queryKey: ['tryon', 'result', fittingImageId],
    queryFn: () => fittingApi.getResult(fittingImageId!),
    enabled: enabled && !!fittingImageId,
    staleTime: Infinity,
  });
}
