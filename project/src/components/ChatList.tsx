import React from 'react';
import { Chat } from '../types';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  isWaiting: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  activeChat, 
  onSelectChat,
  isWaiting
}) => {
  if (chats.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-2">
        暂无聊天。
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {chats.map(chat => (
        <div 
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`
            p-2 rounded-md cursor-pointer transition-colors
            ${activeChat === chat.id 
              ? 'bg-blue-700' 
              : 'hover:bg-gray-700'
            }
          `}
        >
          <div className="flex justify-between items-center">
            <div className="font-medium">{chat.userName}</div>
            <div className="text-xs text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true, locale: zhCN })}
            </div>
          </div>
          <div className="text-sm text-gray-400 flex items-center mt-1">
            <MessageCircle className="h-3 w-3 mr-1" />
            {chat.messages.length} 条消息
            {isWaiting && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-yellow-900 rounded-full text-xs">
                等待中
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};