import { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../types';

interface MessageListProps {
  messages: ChatMessageType[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
          <MessageCircle size={28} className="text-black/30" />
        </div>
        <h3 className="text-[15px] font-semibold text-black/70 mb-2">
          AI 스타일리스트
        </h3>
        <p className="text-[13px] text-black/40 text-center max-w-[250px]">
          원하는 스타일이나 색상을 말씀해주세요. 더 나은 상품을 찾아드릴게요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
