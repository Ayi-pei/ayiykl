import { Ban, MessageSquare, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { BlockedUsersPanel } from './BlockedUsersPanel';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { QuickRepliesPanel } from './QuickRepliesPanel';

interface AgentChatWindowProps {
  chatId: string;
  onClose: () => void;
}

export const AgentChatWindow: React.FC<AgentChatWindowProps> = ({ chatId, onClose }) => {
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    getChatById,
    sendAgentMessage,
    closeChat,
    blockUser,
    isUserBlocked
  } = useChatStore();

  const chat = getChatById(chatId);

  useEffect(() => {
    // 滚动到底部
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">聊天已结束或不存在</p>
      </div>
    );
  }

  const handleCloseChat = () => {
    if (window.confirm('确定要结束此对话吗？')) {
      closeChat(chatId);
      onClose();
    }
  };

  const handleBlockUser = () => {
    if (window.confirm('确定要拉黑此用户吗？')) {
      blockUser(chat.userId);
    }
  };

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendAgentMessage(chatId, content);
    }
  };

  const getUserStatus = () => {
    if (isUserBlocked(chat.userId)) {
      return <span className="text-red-500">已拉黑</span>;
    }
    return chat.userInfo?.isOnline ? (
      <span className="text-green-500">在线</span>
    ) : (
      <span className="text-gray-500">离线</span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* 聊天窗口头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-medium">{chat.userName}</h3>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              {getUserStatus()}
              <span>·</span>
              <span>{chat.userInfo?.device}</span>
              <span>·</span>
              <span>{chat.userInfo?.ip}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="快捷回复"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={handleBlockUser}
            disabled={isUserBlocked(chat.userId)}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title="拉黑用户"
          >
            <Ban className="h-5 w-5" />
          </button>
          <button
            onClick={handleCloseChat}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="结束对话"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 聊天内容区域 */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4"
          >
            <MessageList chatId={chatId} />
          </div>
          <div className="p-4 border-t">
            <MessageInput chatId={chatId} />
          </div>
        </div>

        {/* 快捷回复面板 */}
        {showQuickReplies && (
          <div className="w-64 border-l">
            <QuickRepliesPanel
              onSelect={handleSendMessage}
              onClose={() => setShowQuickReplies(false)}
            />
          </div>
        )}

        {/* 已拉黑用户面板 */}
        {showBlockedUsers && (
          <div className="w-64 border-l">
            <BlockedUsersPanel
              onClose={() => setShowBlockedUsers(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
