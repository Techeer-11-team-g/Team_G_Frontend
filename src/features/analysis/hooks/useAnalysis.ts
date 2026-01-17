import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { analysisApi } from '@/api';
import type {
  AnalysisStatusResponse,
  AnalysisResultResponse,
} from '@/types/api';

interface StartAnalysisParams {
  uploadedImageId: number;
}

// 폴링 설정
const POLLING_INTERVAL = 1000; // 1초
const MAX_POLLING_TIME = 300000; // 5분

/**
 * 이미지 분석 시작 mutation
 */
export function useAnalysisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uploadedImageId }: StartAnalysisParams) =>
      analysisApi.start(uploadedImageId),
    onSuccess: (data) => {
      // 분석 시작 시 상태 쿼리 초기화
      queryClient.setQueryData(['analysis', 'status', data.analysis_id], {
        analysis_id: data.analysis_id,
        status: 'PENDING',
        progress: 0,
        updated_at: new Date().toISOString(),
      });
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
    },
  });
}

/**
 * 분석 상태 폴링 (PENDING -> RUNNING -> DONE)
 * - 1초마다 상태 확인
 * - DONE 또는 FAILED 시 폴링 중지
 * - 5분 타임아웃
 */
export function useAnalysisStatus(analysisId: number | null, enabled = true) {
  const startTime = Date.now();

  return useQuery<AnalysisStatusResponse>({
    queryKey: ['analysis', 'status', analysisId],
    queryFn: async () => {
      // 타임아웃 체크
      if (Date.now() - startTime > MAX_POLLING_TIME) {
        throw new Error('분석 시간이 초과되었습니다');
      }
      return analysisApi.getStatus(analysisId!);
    },
    enabled: enabled && analysisId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // DONE이나 FAILED면 폴링 중지
      if (status === 'DONE' || status === 'FAILED') return false;
      return POLLING_INTERVAL;
    },
    refetchIntervalInBackground: false, // 백그라운드에서는 폴링 중지
    retry: 3, // 실패 시 3번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * 분석 결과 조회 (status가 DONE일 때만 fetch)
 */
export function useAnalysisResult(analysisId: number | null, enabled = true) {
  return useQuery<AnalysisResultResponse>({
    queryKey: ['analysis', 'result', analysisId],
    queryFn: () => analysisApi.getResult(analysisId!),
    enabled: enabled && analysisId !== null,
    staleTime: Infinity, // 결과는 변하지 않으므로 캐시 유지
    retry: 2,
  });
}

/**
 * 통합 분석 훅
 * 분석 시작 -> 상태 폴링 -> 결과 조회를 하나로 통합
 */
export function useAnalysisWithPolling() {
  const mutation = useAnalysisMutation();
  const analysisId = mutation.data?.analysis_id ?? null;

  const { data: statusData, error: statusError } = useAnalysisStatus(
    analysisId,
    mutation.isSuccess
  );

  const isDone = statusData?.status === 'DONE';
  const isFailed = statusData?.status === 'FAILED';

  const { data: result, error: resultError } = useAnalysisResult(
    analysisId,
    isDone
  );

  const reset = useCallback(() => {
    mutation.reset();
  }, [mutation]);

  return {
    // 상태
    analysisId,
    status: statusData?.status ?? null,
    progress: statusData?.progress ?? 0,
    result,

    // 플래그
    isStarting: mutation.isPending,
    isPolling: mutation.isSuccess && !isDone && !isFailed,
    isDone,
    isError: isFailed || !!statusError || !!resultError,

    // 에러
    error: mutation.error || statusError || resultError,

    // 액션
    start: mutation.mutateAsync,
    reset,
  };
}
