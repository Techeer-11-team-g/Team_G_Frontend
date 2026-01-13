import { useMutation, useQuery } from '@tanstack/react-query';
import { analysisApi } from '@/api';
import type {
  AnalysisStatusResponse,
  AnalysisResultResponse,
} from '@/types/api';

interface StartAnalysisParams {
  uploadedImageId: number;
  uploadedImageUrl: string;
}

/**
 * 이미지 분석 시작 mutation
 */
export function useAnalysisMutation() {
  return useMutation({
    mutationFn: ({ uploadedImageId, uploadedImageUrl }: StartAnalysisParams) =>
      analysisApi.start(uploadedImageId, uploadedImageUrl),
    onError: (error) => {
      console.error('Analysis failed:', error);
    },
  });
}

/**
 * 분석 상태 폴링 (PENDING -> RUNNING -> DONE)
 */
export function useAnalysisStatus(analysisId: number | null, enabled = true) {
  return useQuery<AnalysisStatusResponse>({
    queryKey: ['analysis', 'status', analysisId],
    queryFn: () => analysisApi.getStatus(analysisId!),
    enabled: enabled && !!analysisId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // DONE이나 ERROR면 폴링 중지
      if (status === 'DONE' || status === 'ERROR') return false;
      return 1000; // 1초마다 폴링
    },
  });
}

/**
 * 분석 결과 조회 (status가 DONE일 때만 fetch)
 */
export function useAnalysisResult(analysisId: number | null, enabled = true) {
  return useQuery<AnalysisResultResponse>({
    queryKey: ['analysis', 'result', analysisId],
    queryFn: () => analysisApi.getResult(analysisId!),
    enabled: enabled && !!analysisId,
    staleTime: Infinity, // 결과는 변하지 않으므로 캐시 유지
  });
}
