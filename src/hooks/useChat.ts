import { useState, useCallback, useEffect } from 'react';
import { chatApi } from '@/api';
import { getAdaptiveInterval } from '@/utils/polling';
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

export type ContentPanelView = 'welcome' | 'products' | 'imageAnalysis' | 'fitting' | 'cart';

export interface ContentPanelData {
  view: ContentPanelView;
  products?: ChatProduct[];
  fittingImageUrl?: string;
  fittingProduct?: ChatProduct;
  cartItems?: ChatResponse['response']['data']['items'];
  totalPrice?: number;
  // Image analysis specific
  uploadedImageUrl?: string;
  uploadedImageId?: number;
  isImageAnalysis?: boolean;
}

export type AgentState = 'idle' | 'thinking' | 'searching' | 'presenting' | 'error';

// =============================================
// Constants
// =============================================

const SESSION_STORAGE_KEY = 'chat_session_id';
const CHAT_STATE_KEY = 'chat_state';
const MAX_POLLING_TIME = 60000; // 60초

// Helper to get saved chat state
const getSavedChatState = (): { messages: ChatMessage[]; contentPanelData: ContentPanelData } | null => {
  try {
    const saved = sessionStorage.getItem(CHAT_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Filter out blob URLs (they don't persist across sessions)
      if (parsed.messages) {
        parsed.messages = parsed.messages.map((msg: ChatMessage) => ({
          ...msg,
          imagePreview: msg.imagePreview?.startsWith('blob:') ? undefined : msg.imagePreview,
        }));
      }
      if (parsed.contentPanelData?.uploadedImageUrl?.startsWith('blob:')) {
        parsed.contentPanelData.uploadedImageUrl = undefined;
      }

      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved chat state:', e);
  }
  return null;
};

// =============================================
// Hook
// =============================================

export function useChat() {
  // Load saved state on init
  const savedState = getSavedChatState();

  const [messages, setMessages] = useState<ChatMessage[]>(savedState?.messages || []);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [contentPanelData, setContentPanelData] = useState<ContentPanelData>(
    savedState?.contentPanelData || { view: 'welcome' }
  );
  const [agentState, setAgentState] = useState<AgentState>(
    savedState?.contentPanelData?.view === 'products' ? 'presenting' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);

  // Persist session ID
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  // Persist chat state (messages and content panel data)
  useEffect(() => {
    // Only save if there's meaningful content
    if (messages.length > 0 || contentPanelData.view !== 'welcome') {
      try {
        sessionStorage.setItem(
          CHAT_STATE_KEY,
          JSON.stringify({ messages, contentPanelData })
        );
      } catch (e) {
        console.error('Failed to save chat state:', e);
      }
    }
  }, [messages, contentPanelData]);

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

      // Adaptive polling until complete
      const pollStart = Date.now();
      while (Date.now() - pollStart < MAX_POLLING_TIME) {
        const elapsed = Date.now() - pollStart;
        await new Promise((resolve) => setTimeout(resolve, getAdaptiveInterval(elapsed)));

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
  const updateContentPanel = useCallback((
    response: ChatResponse['response'],
    uploadedImageUrl?: string
  ) => {
    const { type, data } = response;

    switch (type) {
      case 'search_results': {
        // Check if this is image analysis (has bbox data or uploaded_image_url)
        const hasImageAnalysis =
          uploadedImageUrl ||
          data.uploaded_image_url ||
          data.products?.some((p) => p.bbox);

        if (hasImageAnalysis) {
          setContentPanelData({
            view: 'imageAnalysis',
            products: data.products,
            // Prefer server URL over blob URL (blob URLs don't persist across sessions)
            uploadedImageUrl: data.uploaded_image_url || uploadedImageUrl,
            uploadedImageId: data.uploaded_image_id,
            isImageAnalysis: true,
          });
        } else {
          setContentPanelData({
            view: 'products',
            products: data.products,
            isImageAnalysis: false,
          });
        }
        setAgentState('presenting');
        break;
      }

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

      // Track the uploaded image URL for image analysis view
      const uploadedImagePreview = image ? URL.createObjectURL(image) : undefined;

      // Add user message to chat
      const userMessage: ChatMessage = {
        role: 'user',
        content: message || '(이미지 업로드)',
        imagePreview: uploadedImagePreview,
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

        // Update content panel (pass image URL if this was an image upload)
        updateContentPanel(finalResponse.response, uploadedImagePreview);
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
    sessionStorage.removeItem(CHAT_STATE_KEY);
  }, [sessionId]);

  // Reset to idle (without clearing session)
  const reset = useCallback(() => {
    setMessages([]);
    setContentPanelData({ view: 'welcome' });
    setAgentState('idle');
    setError(null);
    sessionStorage.removeItem(CHAT_STATE_KEY);
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
