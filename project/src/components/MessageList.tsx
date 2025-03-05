import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="space-y-4">
      {messages.map(message => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isCurrentUser={message.senderId === currentUserId} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};