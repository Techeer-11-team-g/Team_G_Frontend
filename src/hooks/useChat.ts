import { useState, useCallback, useEffect } from 'react';
import { chatApi } from '@/api';
import type {
  ChatResponse,
  ChatResponseType,
  ChatProduct,
  ChatSuggestion,
} from '@/types/api';

// =============================================
// Types
// =============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: ChatResponseType;
  data?: ChatResponse['response']['data'];
  suggestions?: ChatSuggestion[];
  imagePreview?: string;
}

export type ContentPanelView = 'welcome' | 'products' | 'fitting' | 'cart';

export interface ContentPanelData {
  view: ContentPanelView;
  products?: ChatProduct[];
  fittingImageUrl?: string;
  fittingProduct?: ChatProduct;
  cartItems?: ChatResponse['response']['data']['items'];
  totalPrice?: number;
}

export type AgentState = 'idle' | 'thinking' | 'searching' | 'presenting' | 'error';

// =============================================
// Constants
// =============================================

const SESSION_STORAGE_KEY = 'chat_session_id';
const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 20;

// =============================================
// Hook
// =============================================

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [contentPanelData, setContentPanelData] = useState<ContentPanelData>({
    view: 'welcome',
  });
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Persist session ID
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  // Poll for async operation completion
  const pollUntilComplete = useCallback(
    async (initialResponse: ChatResponse): Promise<ChatResponse> => {
      const { type, data } = initialResponse.response;

      // Determine polling type and ID
      let pollType: 'analysis' | 'fitting';
      let pollId: number;

      if (type === 'analysis_pending') {
        pollType = 'analysis';
        pollId = data.analysis_id!;
        setAgentState('searching');
      } else if (type === 'fitting_pending' || type === 'batch_fitting_pending') {
        pollType = 'fitting';
        pollId = data.fitting_id || data.fitting_ids?.[0] || 0;
        setAgentState('thinking');
      } else {
        return initialResponse;
      }

      // Poll until complete
      for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

        try {
          const statusResponse = await chatApi.checkStatus({
            type: pollType,
            id: pollId,
            session_id: initialResponse.session_id,
          });

          // Check if still pending
          if (!statusResponse.response.type.includes('pending')) {
            return statusResponse;
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }

      throw new Error('Polling timeout');
    },
    []
  );

  // Update content panel based on response type
  const updateContentPanel = useCallback((response: ChatResponse['response']) => {
    const { type, data } = response;

    switch (type) {
      case 'search_results':
        setContentPanelData({
          view: 'products',
          products: data.products,
        });
        setAgentState('presenting');
        break;

      case 'no_results':
        setContentPanelData({ view: 'welcome' });
        setAgentState('idle');
        break;

      case 'fitting_result':
        setContentPanelData({
          view: 'fitting',
          fittingImageUrl: data.fitting_image_url,
          fittingProduct: data.product,
        });
        setAgentState('presenting');
        break;

      case 'cart_list':
        setContentPanelData({
          view: 'cart',
          cartItems: data.items,
          totalPrice: data.total_price,
        });
        setAgentState('presenting');
        break;

      case 'cart_added':
      case 'order_created':
        // Keep current view but update state
        setAgentState('presenting');
        break;

      case 'error':
        setAgentState('error');
        break;

      // Handle "ask" types - need input to respond
      case 'ask_size':
      case 'ask_selection':
      case 'ask_body_info':
      case 'ask_user_image':
      case 'ask_search_first':
      case 'size_recommendation':
      case 'greeting':
      case 'help':
      case 'general':
        // Keep current content panel, but ensure input is visible
        setAgentState('presenting');
        break;

      default:
        // Keep current content panel, set to presenting to show input
        setAgentState('presenting');
        break;
    }
  }, []);

  // Send text message
  const sendMessage = useCallback(
    async (message: string, image?: File) => {
      if (!message.trim() && !image) return;

      setIsLoading(true);
      setError(null);
      setAgentState('thinking');

      // Add user message to chat
      const userMessage: ChatMessage = {
        role: 'user',
        content: message || '(이미지 업로드)',
        imagePreview: image ? URL.createObjectURL(image) : undefined,
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Send to API
        let response: ChatResponse;
        if (image) {
          response = await chatApi.sendWithImage(
            message || '이거랑 비슷한 거 찾아줘',
            image,
            sessionId || undefined
          );
        } else {
          response = await chatApi.send(message, sessionId || undefined);
        }

        // Save session ID
        if (!sessionId) {
          setSessionId(response.session_id);
        }

        // Handle async operations (polling)
        let finalResponse = response;
        if (response.response.type.includes('pending')) {
          finalResponse = await pollUntilComplete(response);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: finalResponse.response.text,
          type: finalResponse.response.type,
          data: finalResponse.response.data,
          suggestions: finalResponse.response.suggestions,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Update content panel
        updateContentPanel(finalResponse.response);
      } catch (err) {
        console.error('Chat error:', err);
        setError('오류가 발생했어요. 다시 시도해주세요.');
        setAgentState('error');

        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '오류가 발생했어요. 다시 시도해주세요.',
            type: 'error',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, pollUntilComplete, updateContentPanel]
  );

  // Send image only
  const sendImage = useCallback(
    async (image: File) => {
      await sendMessage('', image);
    },
    [sendMessage]
  );

  // Handle suggestion click
  const handleSuggestion = useCallback(
    (action: string) => {
      const actionMessages: Record<string, string> = {
        fitting: '피팅해줘',
        add_cart: '담아줘',
        view_cart: '장바구니 보여줘',
        checkout: '주문할게',
        search: '검색하고 싶어',
        refine: '다른 조건으로 찾아줘',
        retry: '다시 해줘',
        select_1: '1번',
        select_2: '2번',
        select_3: '3번',
        select_4: '4번',
      };

      const message = actionMessages[action] || action;
      sendMessage(message);
    },
    [sendMessage]
  );

  // Clear session
  const clearSession = useCallback(async () => {
    if (sessionId) {
      try {
        await chatApi.deleteSession(sessionId);
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }

    setMessages([]);
    setSessionId(null);
    setContentPanelData({ view: 'welcome' });
    setAgentState('idle');
    setError(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, [sessionId]);

  // Reset to idle (without clearing session)
  const reset = useCallback(() => {
    setMessages([]);
    setContentPanelData({ view: 'welcome' });
    setAgentState('idle');
    setError(null);
  }, []);

  return {
    // State
    messages,
    sessionId,
    isLoading,
    contentPanelData,
    agentState,
    error,

    // Actions
    sendMessage,
    sendImage,
    handleSuggestion,
    clearSession,
    reset,
  };
}
