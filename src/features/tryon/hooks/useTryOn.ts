import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fittingApi } from '@/api';
import type {
  FittingRequest,
  FittingStartResponse,
  FittingStatusResponse,
  FittingResultResponse,
} from '@/types/api';

// 폴링 설정
const POLLING_INTERVAL = 1500; // 1.5초
const MAX_POLLING_TIME = 300000; // 5분

/**
 * 가상 피팅 요청 mutation
 */
export function useTryOnMutation() {
  const queryClient = useQueryClient();

  return useMutation<FittingStartResponse, Error, FittingRequest>({
    mutationFn: (request: FittingRequest) => fittingApi.request(request),
    onSuccess: (data) => {
      // 피팅 시작 시 상태 쿼리 초기화
      queryClient.setQueryData(['tryon', 'status', data.fitting_image_id], {
        fitting_image_status: 'PENDING',
        progress: 0,
        updated_at: new Date().toISOString(),
      });
    },
    onError: (error) => {
      console.error('Try-on request failed:', error);
    },
  });
}

/**
 * 피팅 상태 폴링 (PENDING -> RUNNING -> DONE)
 * - 1.5초마다 상태 확인
 * - DONE 또는 ERROR 시 폴링 중지
 * - 5분 타임아웃
 */
export function useTryOnStatus(fittingImageId: number | null, enabled = true) {
  const startTime = Date.now();

  return useQuery<FittingStatusResponse>({
    queryKey: ['tryon', 'status', fittingImageId],
    queryFn: async () => {
      // 타임아웃 체크
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        throw new Error('피팅 처리 시간이 초과되었습니다');
      }
      return fittingApi.getStatus(fittingImageId!);
    },
    enabled: enabled && fittingImageId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.fitting_image_status;
      if (status === 'DONE' || status === 'FAILED') return false;
      return POLLING_INTERVAL;
    },
    refetchIntervalInBackground: false, // 백그라운드에서는 폴링 중지
    retry: 3, // 실패 시 3번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * 피팅 결과 조회 (status가 DONE일 때만 fetch)
 */
export function useTryOnResult(fittingImageId: number | null, enabled = true) {
  return useQuery<FittingResultResponse>({
    queryKey: ['tryon', 'result', fittingImageId],
    queryFn: () => fittingApi.getResult(fittingImageId!),
    enabled: enabled && fittingImageId !== null,
    staleTime: Infinity,
    retry: 2,
  });
}

/**
 * 통합 피팅 훅
 * 피팅 시작 -> 상태 폴링 -> 결과 조회를 하나로 통합
 */
export function useFittingWithPolling() {
  const mutation = useTryOnMutation();
  const fittingImageId = mutation.data?.fitting_image_id ?? null;

  const { data: statusData, error: statusError } = useTryOnStatus(
    fittingImageId,
    mutation.isSuccess
  );

  const isDone = statusData?.fitting_image_status === 'DONE';
  const isError = statusData?.fitting_image_status === 'FAILED';

  const { data: result, error: resultError } = useTryOnResult(
    fittingImageId,
    isDone
  );

  const reset = useCallback(() => {
    mutation.reset();
  }, [mutation]);

  return {
    // 상태
    fittingImageId,
    status: statusData?.fitting_image_status ?? null,
    progress: statusData?.progress ?? 0,
    result,
    resultImageUrl: result?.fitting_image_url ?? null,

    // 플래그
    isStarting: mutation.isPending,
    isPolling: mutation.isSuccess && !isDone && !isError,
    isDone,
    isError: isError || !!statusError || !!resultError,

    // 에러
    error: mutation.error || statusError || resultError,

    // 액션
    start: mutation.mutateAsync,
    reset,
  };
}
