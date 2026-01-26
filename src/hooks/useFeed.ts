import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { feedApi } from '@/api';
import { toast } from 'sonner';
import type { FeedResponse, StylesResponse } from '@/types/api';

export const feedKeys = {
  all: ['feed'] as const,
  discover: (style?: string | null) => [...feedKeys.all, 'discover', style ?? 'all'] as const,
  history: () => [...feedKeys.all, 'history'] as const,
  styles: () => [...feedKeys.all, 'styles'] as const,
};

/** 공개 피드 조회 - staleTime 3분 */
export function useDiscoverFeed(style?: string | null) {
  return useQuery<FeedResponse>({
    queryKey: feedKeys.discover(style),
    queryFn: () => feedApi.getPublicFeed({ limit: 30, style: style || undefined }),
    staleTime: 1000 * 60 * 3, // 3분
  });
}

/** 내 히스토리 조회 - staleTime 10분 */
export function useHistoryFeed() {
  return useQuery<FeedResponse>({
    queryKey: feedKeys.history(),
    queryFn: () => feedApi.getMyHistory({ limit: 30 }),
    staleTime: 1000 * 60 * 10, // 10분
  });
}

/** 스타일 목록 조회 - staleTime 30분 (거의 안 바뀜) */
export function useStyles() {
  return useQuery<StylesResponse>({
    queryKey: feedKeys.styles(),
    queryFn: feedApi.getStyles,
    staleTime: 1000 * 60 * 30, // 30분
  });
}

/** 공개/비공개 토글 - optimistic update */
export function useVisibilityToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, isPublic }: { itemId: number; isPublic: boolean }) =>
      feedApi.toggleVisibility(itemId, { is_public: isPublic }),
    onMutate: async ({ itemId, isPublic }) => {
      // 진행중인 쿼리 취소 (optimistic 데이터 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: feedKeys.history() });

      // 이전 데이터 스냅샷
      const previous = queryClient.getQueryData<FeedResponse>(feedKeys.history());

      // 캐시 즉시 업데이트
      queryClient.setQueryData<FeedResponse>(feedKeys.history(), (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, is_public: isPublic } : item
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // 실패 시 롤백
      if (context?.previous) {
        queryClient.setQueryData(feedKeys.history(), context.previous);
      }
      toast.error('변경에 실패했습니다');
    },
    onSuccess: (_, { isPublic }) => {
      toast.success(isPublic ? '공개로 변경되었습니다' : '비공개로 변경되었습니다');
    },
    onSettled: () => {
      // 서버 상태와 동기화
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}
