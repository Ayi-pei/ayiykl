import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  chatId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ chatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chat = useChatStore(state => state.getChatById(chatId));

  useEffect(() => {
    // 新消息时滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) return null;

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {chat.messages.map(message => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
