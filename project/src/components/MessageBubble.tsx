import React from 'react';
import { Message } from '../types';
import { User } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const currentAgent = useChatStore(state => state.currentAgent);
  const isAgent = message.senderType === 'agent';
  const isSystem = message.senderType === 'system';

  return (
    <div className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4`}>
      {isAgent && (
        <div className="flex-shrink-0 mr-3">
          {currentAgent?.avatar ? (
            <img
              src={currentAgent.avatar}
              alt={currentAgent.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-8 h-8 p-1.5 bg-gray-100 rounded-full text-gray-600" />
          )}
        </div>
      )}
      
      <div
        className={`max-w-[70%] ${
          isSystem
            ? 'bg-gray-100 text-gray-600 mx-auto'
            : isAgent
            ? 'bg-white text-gray-800'
            : 'bg-blue-600 text-white'
        } rounded-lg px-4 py-2 shadow-sm`}
      >
        {isAgent && <div className="text-xs text-gray-500 mb-1">{currentAgent?.name}</div>}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.attachments?.map(attachment => (
          <img
            key={attachment.id}
            src={attachment.url}
            alt={attachment.name}
            className="mt-2 max-w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};