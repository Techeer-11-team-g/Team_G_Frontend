import { useState } from 'react';
import type { AnalysisResultResponse, AnalyzedItem } from '@/types/api';
import { useChatRefinement } from '../hooks/useChatRefinement';
import { DEFAULT_PROMPTS } from '../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { SuggestedChips } from './SuggestedChips';
import { ChatInput } from './ChatInput';

interface ChatRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: number;
  detectedObjects: AnalyzedItem[];
  onRefinementComplete: (newResult: AnalysisResultResponse) => void;
}

export function ChatRefinementModal({
  isOpen,
  onClose,
  analysisId,
  onRefinementComplete,
}: ChatRefinementModalProps) {
  const [inputValue, setInputValue] = useState('');

  const { messages, isLoading, sendMessage } = useChatRefinement({
    analysisId,
    onRefinementSuccess: onRefinementComplete,
  });

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    const query = inputValue.trim();
    setInputValue('');
    await sendMessage(query);
  };

  const handlePromptSelect = async (prompt: { queryTemplate: string }) => {
    await sendMessage(prompt.queryTemplate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-background flex flex-col animate-in slide-in-from-bottom duration-500">
      <ChatHeader onClose={onClose} />

      <MessageList messages={messages} />

      <SuggestedChips
        prompts={DEFAULT_PROMPTS}
        onSelect={handlePromptSelect}
        isVisible={messages.length === 0}
      />

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
