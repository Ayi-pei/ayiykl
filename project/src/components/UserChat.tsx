import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { User, LogOut } from 'lucide-react';

interface UserChatProps {
  chatId: string;
}

export const UserChat: React.FC<UserChatProps> = ({ chatId }) => {
  const { getChatById, sendUserMessage, setUserOnlineStatus, currentAgent } = useChatStore();
  const chat = getChatById(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 发送欢迎消息
  useEffect(() => {
    if (chat && currentAgent?.welcomeMessage && chat.messages.length === 1) {
      sendUserMessage(chatId, currentAgent.welcomeMessage, [], 'agent');
    }
  }, [chat, currentAgent, chatId, sendUserMessage]);

  // 处理在线状态
  useEffect(() => {
    if (chat) {
      setUserOnlineStatus(chat.userId, true);
      return () => setUserOnlineStatus(chat.userId, false);
    }
  }, [chat, setUserOnlineStatus]);

  // 处理退出
  const handleExit = () => {
    if (window.confirm('确定要结束对话吗？')) {
      window.close();
    }
  };

  if (!chat) {
    return <div>聊天已结束或不存在</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 顶部栏 - 显示客服信息 */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {currentAgent?.avatar ? (
            <img
              src={currentAgent.avatar}
              alt={currentAgent.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 p-2 bg-gray-100 rounded-full text-gray-600" />
          )}
          <div>
            <h2 className="font-semibold">{currentAgent?.name || '在线客服'}</h2>
            <p className="text-sm text-green-500">在线</p>
          </div>
        </div>

        <button
          onClick={handleExit}
          className="text-gray-600 hover:text-red-600 flex items-center space-x-1"
        >
          <LogOut className="w-5 h-5" />
          <span>结束对话</span>
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <MessageList chatId={chatId} />
      </div>

      {/* 消息输入框 */}
      <div className="p-4 bg-white border-t">
        <MessageInput chatId={chatId} />
      </div>
    </div>
  );
};
