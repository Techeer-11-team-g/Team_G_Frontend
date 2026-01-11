import { useMutation, useQuery } from '@tanstack/react-query';
import { tryOnApi } from '@/api';
import type { TryOnResult } from '@/types/api';

/**
 * 가상 피팅 요청 mutation
 */
export function useTryOnMutation() {
  return useMutation({
    mutationFn: ({ userPhoto, productId }: { userPhoto: string; productId: string }) =>
      tryOnApi.request(userPhoto, productId),
    onError: (error) => {
      console.error('Try-on request failed:', error);
    },
  });
}

/**
 * 피팅 상태 폴링 (pending -> processing -> done)
 */
export function useTryOnStatus(jobId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['tryon', 'status', jobId],
    queryFn: () => tryOnApi.getStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'done' || status === 'error') return false;
      return 1500; // 1.5초마다 폴링
    },
  });
}

/**
 * 피팅 결과 조회 (status가 done일 때만 fetch)
 */
export function useTryOnResult(jobId: string | null, enabled = true) {
  return useQuery<TryOnResult>({
    queryKey: ['tryon', 'result', jobId],
    queryFn: () => tryOnApi.getResult(jobId!),
    enabled: enabled && !!jobId,
    staleTime: Infinity,
  });
}

