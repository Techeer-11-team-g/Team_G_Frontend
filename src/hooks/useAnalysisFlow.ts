import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAnalysisStatus, useAnalysisResult } from '@/features/analysis';
import { uploadedImagesApi } from '@/api';
import type { LocalAnalysisResult } from '@/types/local';
import type { AnalyzedItem, AnalysisResultResponse, UploadedImage, HistoryItem } from '@/types/api';

type AnalysisStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | null;

interface UseAnalysisFlowReturn {
  // State
  image: string | null;
  isAnalyzing: boolean;
  analysisResult: LocalAnalysisResult | undefined;
  error: string | null;
  history: UploadedImage[];
  isLoadingHistory: boolean;
  hasMoreHistory: boolean;
  isFetchingMoreHistory: boolean;
  // 폴링 상태
  status: AnalysisStatus;
  progress: number;
  // 채팅 리파인먼트용
  currentAnalysisId: number | null;

  // Actions
  startAnalysis: (base64Image: string) => Promise<void>;
  reset: () => void;
  loadFromHistory: (item: UploadedImage) => void;
  updateAnalysisResult: (newResult: AnalysisResultResponse) => void;
  refetchHistory: () => void;
  fetchMoreHistory: () => void;
}

export function useAnalysisFlow(): UseAnalysisFlowReturn {
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [localResult, setLocalResult] = useState<LocalAnalysisResult | undefined>(undefined);

  // History API query with infinite scroll
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isFetchingNextPage: isFetchingMoreHistory,
    hasNextPage: hasMoreHistory,
    fetchNextPage,
    refetch: refetchHistory,
  } = useInfiniteQuery({
    queryKey: ['uploadedImages'],
    queryFn: ({ pageParam }) => uploadedImagesApi.list(pageParam, 10),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 1000 * 60, // 1분
  });

  // 모든 페이지의 아이템을 평탄화
  const history = useMemo(
    () => historyData?.pages.flatMap((page) => page.items) ?? [],
    [historyData]
  );

  const fetchMoreHistory = useCallback(() => {
    if (hasMoreHistory && !isFetchingMoreHistory) {
      fetchNextPage();
    }
  }, [hasMoreHistory, isFetchingMoreHistory, fetchNextPage]);

  // 업로드 진행 상태
  const [isUploading, setIsUploading] = useState(false);

  // Analysis API hooks - auto_analyze=true 이므로 analysisId가 있으면 바로 폴링 시작
  const { data: statusData } = useAnalysisStatus(analysisId, !!analysisId);
  const { data: apiResult } = useAnalysisResult(
    analysisId,
    statusData?.status === 'DONE'
  );

  // 현재 상태 및 진행률
  const status: AnalysisStatus = statusData?.status ?? (isUploading ? 'PENDING' : null);
  const progress = statusData?.progress ?? 0;

  // Loading state
  const isAnalyzing =
    isUploading ||
    (!!analysisId && statusData?.status !== 'DONE' && statusData?.status !== 'FAILED');

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
          sizes: item.match.product.sizes,
          detected_object_id: item.detected_object_id,
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

      // 분석 완료 토스트
      toast.success(`${convertedItems.length}개 아이템을 찾았습니다`, {
        description: '상품을 탭하여 자세히 확인하세요',
      });

      // 히스토리 갱신
      refetchHistory();
    }
  }, [apiResult, refetchHistory]);

  // Handle errors
  useEffect(() => {
    if (statusData?.status === 'FAILED') {
      setError('분석 처리 중 오류가 발생했습니다.');
      toast.error('분석 처리 중 오류가 발생했습니다');
    }
  }, [statusData?.status]);

  const startAnalysis = useCallback(
    async (base64Image: string) => {
      setError(null);
      setAnalysisId(null);
      setLocalResult(undefined);
      setImage(base64Image);
      setIsUploading(true);

      try {
        // Convert base64 to File for upload
        const blob = await fetch(base64Image).then((r) => r.blob());
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

        console.log('[Analysis] 1. Uploading image with auto_analyze=true...');
        // Upload image with auto_analyze=true - analysis starts automatically
        const uploadedImage = await uploadedImagesApi.upload(file);
        console.log('[Analysis] 2. Upload success, analysis_id:', uploadedImage.analysis_id);

        // auto_analyze=true이므로 바로 analysis_id를 받음
        if (uploadedImage.analysis_id) {
          setAnalysisId(uploadedImage.analysis_id);
        } else {
          throw new Error('analysis_id not found in response');
        }
      } catch (err) {
        console.error('[Analysis] Error:', err);
        setError('이미지 업로드에 실패했습니다.');
        toast.error('이미지 업로드에 실패했습니다', {
          description: '다시 시도해주세요',
        });
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setImage(null);
    setAnalysisId(null);
    setLocalResult(undefined);
    setError(null);
    setIsUploading(false);
  }, []);

  const loadFromHistory = useCallback(
    async (item: UploadedImage) => {
      setError(null);
      setLocalResult(undefined);
      setImage(item.uploaded_image_url);

      // analysis_id 설정 (채팅 리파인먼트용)
      if (item.analysis_id) {
        setAnalysisId(item.analysis_id);
      } else {
        setAnalysisId(null);
      }

      try {
        // 이미 분석된 결과 조회
        const historyResult = await uploadedImagesApi.getHistory(item.uploaded_image_id);

        // HistoryItem을 AnalyzedItem으로 변환
        const convertedItems: AnalyzedItem[] = historyResult.items.map((historyItem: HistoryItem) => ({
          id: historyItem.detected_object_id.toString(),
          label: historyItem.category_name,
          category: mapCategoryName(historyItem.category_name),
          box_2d: [historyItem.bbox.x1, historyItem.bbox.y1, historyItem.bbox.x2, historyItem.bbox.y2] as [number, number, number, number],
          description: '',
          aesthetic: '',
          candidates: historyItem.match ? [{
            brand: historyItem.match.product.brand_name,
            name: historyItem.match.product.product_name,
            price: `₩${historyItem.match.product.selling_price.toLocaleString()}`,
            image: historyItem.match.product.image_url,
            source_url: historyItem.match.product.product_url,
            match_type: 'Exact' as const,
            color_vibe: '',
            product_id: historyItem.match.product_id,
            sizes: historyItem.match.product.sizes,
            detected_object_id: historyItem.detected_object_id,
          }] : [],
        }));

        const result: LocalAnalysisResult = {
          id: item.analysis_id?.toString() || item.uploaded_image_id.toString(),
          image: item.uploaded_image_url,
          items: convertedItems,
          summary: `${convertedItems.length}개 아이템`,
          timestamp: Date.now(),
        };

        setLocalResult(result);
      } catch (err) {
        console.error('[History] Error:', err);
        setError('히스토리 조회에 실패했습니다.');
      }
    },
    []
  );

  const updateAnalysisResult = useCallback(
    (newApiResult: AnalysisResultResponse) => {
      if (!image) return;

      const convertedItems: AnalyzedItem[] = newApiResult.items.map((item) => ({
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
          sizes: item.match.product.sizes,
          detected_object_id: item.detected_object_id,
        }] : [],
      }));

      const result: LocalAnalysisResult = {
        id: newApiResult.analysis_id.toString(),
        image: image,
        items: convertedItems,
        summary: `${convertedItems.length}개 아이템 업데이트됨`,
        timestamp: Date.now(),
      };

      setLocalResult(result);
    },
    [image]
  );

  return {
    image,
    isAnalyzing,
    analysisResult: localResult,
    error,
    history,
    isLoadingHistory,
    hasMoreHistory: hasMoreHistory ?? false,
    isFetchingMoreHistory,
    status,
    progress,
    currentAnalysisId: analysisId,
    startAnalysis,
    reset,
    loadFromHistory,
    updateAnalysisResult,
    refetchHistory,
    fetchMoreHistory,
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
