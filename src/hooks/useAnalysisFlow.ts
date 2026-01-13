import { useState, useEffect, useCallback } from 'react';
import { useAnalysisMutation, useAnalysisStatus, useAnalysisResult } from '@/features/analysis';
import { uploadedImagesApi } from '@/api';
import type { LocalHistoryItem, LocalAnalysisResult } from '@/types/local';
import type { AnalyzedItem } from '@/types/api';

const HISTORY_KEY = 'whats_on_history_v4';
const MAX_HISTORY = 5;

interface UseAnalysisFlowReturn {
  // State
  image: string | null;
  isAnalyzing: boolean;
  analysisResult: LocalAnalysisResult | undefined;
  error: string | null;
  history: LocalHistoryItem[];

  // Actions
  startAnalysis: (base64Image: string) => Promise<void>;
  reset: () => void;
  loadFromHistory: (item: LocalHistoryItem) => void;
}

export function useAnalysisFlow(): UseAnalysisFlowReturn {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [localResult, setLocalResult] = useState<LocalAnalysisResult | undefined>(undefined);

  // Analysis API hooks
  const analysisMutation = useAnalysisMutation();
  const { data: statusData } = useAnalysisStatus(
    analysisId,
    !!analysisId && analysisMutation.isSuccess
  );
  const { data: apiResult } = useAnalysisResult(
    analysisId,
    statusData?.status === 'DONE'
  );

  // Loading state
  const isAnalyzing =
    analysisMutation.isPending ||
    (!!analysisId && statusData?.status !== 'DONE' && statusData?.status !== 'ERROR');

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

  // Convert API result to local format when analysis completes
  useEffect(() => {
    if (apiResult && image) {
      // Convert API response to local format
      const convertedItems: AnalyzedItem[] = apiResult.items.map((item) => ({
        id: item.detected_object_id.toString(),
        label: item.category_name,
        category: mapCategoryName(item.category_name),
        box_2d: [item.bbox.x1, item.bbox.y1, item.bbox.x2, item.bbox.y2] as [number, number, number, number],
        description: '',
        aesthetic: '',
        candidates: item.match ? [{
          brand: item.match.product.brand_name,
          name: item.match.product.product_name,
          price: `₩${item.match.product.selling_price.toLocaleString()}`,
          image: item.match.product.image_url,
          source_url: item.match.product.product_url,
          match_type: 'Exact' as const,
          color_vibe: '',
          product_id: item.match.product_id,
        }] : [],
      }));

      const result: LocalAnalysisResult = {
        id: apiResult.analysis_id.toString(),
        image: image,
        items: convertedItems,
        summary: `${convertedItems.length}개 아이템 탐색됨`,
        timestamp: Date.now(),
      };

      setLocalResult(result);

      // Save to history
      const newItem: LocalHistoryItem = {
        id: Date.now().toString(),
        type: 'analysis',
        image: image,
        summary: `${convertedItems.length}개 탐색됨`,
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY);
      setHistory(updatedHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    }
  }, [apiResult]);

  // Handle errors
  useEffect(() => {
    if (analysisMutation.isError) {
      setError('분석에 실패했습니다. 다시 시도해주세요.');
    }
    if (statusData?.status === 'ERROR') {
      setError('분석 처리 중 오류가 발생했습니다.');
    }
  }, [analysisMutation.isError, statusData?.status]);

  const startAnalysis = useCallback(
    async (base64Image: string) => {
      setError(null);
      setAnalysisId(null);
      setLocalResult(undefined);
      setImage(base64Image);

      try {
        // Convert base64 to File for upload
        const blob = await fetch(base64Image).then((r) => r.blob());
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

        // Upload image first
        const uploadedImage = await uploadedImagesApi.upload(file);

        // Start analysis with uploaded image
        const result = await analysisMutation.mutateAsync({
          uploadedImageId: uploadedImage.uploaded_image_id,
          uploadedImageUrl: uploadedImage.uploaded_image_url,
        });
        setAnalysisId(result.analysis_id);
      } catch {
        // Error handled in useEffect
        setError('이미지 업로드에 실패했습니다.');
      }
    },
    [analysisMutation]
  );

  const reset = useCallback(() => {
    setImage(null);
    setAnalysisId(null);
    setLocalResult(undefined);
    setError(null);
    analysisMutation.reset();
  }, [analysisMutation]);

  const loadFromHistory = useCallback(
    (item: LocalHistoryItem) => {
      startAnalysis(item.image);
    },
    [startAnalysis]
  );

  return {
    image,
    isAnalyzing,
    analysisResult: localResult,
    error,
    history,
    startAnalysis,
    reset,
    loadFromHistory,
  };
}

// Helper function to map category names
function mapCategoryName(categoryName: string): 'top' | 'bottom' | 'skirt' | 'outer' | 'bag' | 'shoes' | 'hat' {
  const mapping: Record<string, 'top' | 'bottom' | 'skirt' | 'outer' | 'bag' | 'shoes' | 'hat'> = {
    'top': 'top',
    'bottom': 'bottom',
    'skirt': 'skirt',
    'outer': 'outer',
    'bag': 'bag',
    'shoes': 'shoes',
    'hat': 'hat',
    '상의': 'top',
    '하의': 'bottom',
    '스커트': 'skirt',
    '아우터': 'outer',
    '가방': 'bag',
    '신발': 'shoes',
    '모자': 'hat',
  };
  return mapping[categoryName.toLowerCase()] || 'top';
}
