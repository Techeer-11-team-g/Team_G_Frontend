import { useState, useEffect, useCallback } from 'react';
import { useAnalysisMutation, useAnalysisStatus, useAnalysisResult } from '@/features/analysis';
import type { HistoryItem, AnalysisResult } from '@/types/api';

const HISTORY_KEY = 'whats_on_history_v4';
const MAX_HISTORY = 5;

interface UseAnalysisFlowReturn {
  // State
  image: string | null;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | undefined;
  error: string | null;
  history: HistoryItem[];

  // Actions
  startAnalysis: (base64Image: string) => Promise<void>;
  reset: () => void;
  loadFromHistory: (item: HistoryItem) => void;
}

export function useAnalysisFlow(): UseAnalysisFlowReturn {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // Analysis API hooks
  const analysisMutation = useAnalysisMutation();
  const { data: statusData } = useAnalysisStatus(
    analysisId,
    !!analysisId && analysisMutation.isSuccess
  );
  const { data: analysisResult } = useAnalysisResult(
    analysisId,
    statusData?.status === 'done'
  );

  // Loading state
  const isAnalyzing =
    analysisMutation.isPending ||
    (!!analysisId && statusData?.status !== 'done' && statusData?.status !== 'error');

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save to history when analysis completes
  useEffect(() => {
    if (analysisResult && image) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        type: 'analysis',
        image: image,
        summary: `${analysisResult.items.length}개 탐색됨`,
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY);
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  }, [analysisResult]);

  // Handle errors
  useEffect(() => {
    if (analysisMutation.isError) {
      setError('분석에 실패했습니다. 다시 시도해주세요.');
    }
    if (statusData?.status === 'error') {
      setError('분석 처리 중 오류가 발생했습니다.');
    }
  }, [analysisMutation.isError, statusData?.status]);

  const startAnalysis = useCallback(
    async (base64Image: string) => {
      setError(null);
      setAnalysisId(null);
      setImage(base64Image);

      try {
        const result = await analysisMutation.mutateAsync(base64Image);
        setAnalysisId(result.id);
      } catch {
        // Error handled in useEffect
      }
    },
    [analysisMutation]
  );

  const reset = useCallback(() => {
    setImage(null);
    setAnalysisId(null);
    setError(null);
    analysisMutation.reset();
  }, [analysisMutation]);

  const loadFromHistory = useCallback(
    (item: HistoryItem) => {
      startAnalysis(item.image);
    },
    [startAnalysis]
  );

  return {
    image,
    isAnalyzing,
    analysisResult,
    error,
    history,
    startAnalysis,
    reset,
    loadFromHistory,
  };
}
