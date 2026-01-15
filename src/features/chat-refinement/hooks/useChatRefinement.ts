import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analysisApi } from '@/api';
import type { AnalysisResultResponse } from '@/types/api';
import type { ChatMessage } from '../types';

interface UseChatRefinementOptions {
  analysisId: number | null;
  onRefinementSuccess?: (result: AnalysisResultResponse) => void;
}

interface UseChatRefinementReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (query: string, detectedObjectId?: number) => Promise<void>;
  clearMessages: () => void;
}

export function useChatRefinement({
  analysisId,
  onRefinementSuccess,
}: UseChatRefinementOptions): UseChatRefinementReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const mutation = useMutation({
    mutationFn: analysisApi.patch,
    onSuccess: (result) => {
      const itemCount = result.items.length;
      const successMessage = `${itemCount}개의 상품을 찾았습니다! 결과를 확인해보세요.`;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                isLoading: false,
                content: successMessage,
              }
            : msg
        )
      );

      onRefinementSuccess?.(result);
      toast.success('검색 결과가 업데이트되었습니다');
    },
    onError: () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                isLoading: false,
                error: '요청 처리 중 오류가 발생했습니다.',
                content: '죄송합니다. 다시 시도해주세요.',
              }
            : msg
        )
      );
      toast.error('검색 수정에 실패했습니다');
    },
  });

  const sendMessage = useCallback(
    async (query: string, detectedObjectId?: number) => {
      if (!analysisId || !query.trim()) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query.trim(),
        timestamp: Date.now(),
        detectedObjectId,
      };

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      await mutation.mutateAsync({
        analysis_id: analysisId,
        query: query.trim(),
        detected_object_id: detectedObjectId ?? 0,
      });
    },
    [analysisId, mutation]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    sendMessage,
    clearMessages,
  };
}
