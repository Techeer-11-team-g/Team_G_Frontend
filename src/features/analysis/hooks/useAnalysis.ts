import { useMutation, useQuery } from '@tanstack/react-query';
import { analysisApi } from '@/api';
import type { AnalysisResult } from '@/types/api';

/**
 * 이미지 분석 요청 mutation
 */
export function useAnalysisMutation() {
  return useMutation({
    mutationFn: (imageBase64: string) => analysisApi.analyze(imageBase64),
    onError: (error) => {
      console.error('Analysis failed:', error);
    },
  });
}

/**
 * 분석 상태 폴링 (pending -> processing -> done)
 */
export function useAnalysisStatus(analysisId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['analysis', 'status', analysisId],
    queryFn: () => analysisApi.getStatus(analysisId!),
    enabled: enabled && !!analysisId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // done이나 error면 폴링 중지
      if (status === 'done' || status === 'error') return false;
      return 1000; // 1초마다 폴링
    },
  });
}

/**
 * 분석 결과 조회 (status가 done일 때만 fetch)
 */
export function useAnalysisResult(analysisId: string | null, enabled = true) {
  return useQuery<AnalysisResult>({
    queryKey: ['analysis', 'result', analysisId],
    queryFn: () => analysisApi.getResult(analysisId!),
    enabled: enabled && !!analysisId,
    staleTime: Infinity, // 결과는 변하지 않으므로 캐시 유지
  });
}

