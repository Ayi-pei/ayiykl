import { LogOut, MessageCircle, Settings, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { AgentChatWindow } from './AgentChatWindow';
import { AgentSettingsModal } from './AgentSettingsModal';
import { ChatList } from './ChatList';

interface AgentDashboardProps {
  agentId: string;
  agentName: string;
  licenseKey: string;
  onLogout: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agentId,
  agentName,
  licenseKey,
  onLogout
}) => {
  const {
    chats,
    activeChat,
    setActiveChat,
    setCurrentAgent,
    acceptChat,
    updateAgentProfile,
    setAuthenticated
  } = useChatStore();

  const [showSettings, setShowSettings] = useState(false);
  const [agentAvatar, setAgentAvatar] = useState<string | undefined>(undefined);

  // Filter chats by status
  const waitingChats = chats.filter(chat => chat.status === 'waiting');
  const activeChats = chats.filter(chat =>
    chat.status === 'active' && chat.agentId === agentId
  );

  useEffect(() => {
    // Set current agent when component mounts
    setCurrentAgent({
      id: agentId,
      name: agentName,
      avatar: agentAvatar,
      status: 'online',
      activeChats: activeChats.length,
      quickReplies: [],
      welcomeMessage: '您好！我能为您提供什么帮助？'
    });

    // Clean up old chats
    const cleanup = setInterval(() => {
      useChatStore.getState().cleanupOldChats();
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(cleanup);
  }, [agentId, agentName, agentAvatar, setCurrentAgent, activeChats.length]);

  const handleAcceptChat = (chatId: string) => {
    acceptChat(chatId, agentId);
    setActiveChat(chatId);
  };

  const handleUpdateProfile = (name: string, avatar?: string) => {
    updateAgentProfile(name, avatar);
    setAgentAvatar(avatar);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    onLogout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {agentAvatar ? (
                <img
                  src={agentAvatar}
                  alt={agentName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 p-1 bg-gray-700 rounded-full" />
              )}
              <div>
                <h1 className="text-lg font-semibold">{agentName}</h1>
                <p className="text-xs text-gray-400">在线</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-2 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              等待中 ({waitingChats.length})
            </h2>
            <ChatList
              chats={waitingChats}
              activeChat={activeChat}
              onSelectChat={handleAcceptChat}
              isWaiting={true}
            />
          </div>

          <div className="p-4">
            <h2 className="text-lg font-medium mb-2 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              进行中 ({activeChats.length})
            </h2>
            <ChatList
              chats={activeChats}
              activeChat={activeChat}
              onSelectChat={setActiveChat}
              isWaiting={false}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {activeChat ? (
          <AgentChatWindow chatId={activeChat} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">未选择聊天</h2>
              <p className="text-gray-600">
                从侧边栏选择一个聊天或接受一个等待中的聊天开始。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <AgentSettingsModal
          onClose={() => setShowSettings(false)}
          onUpdateProfile={handleUpdateProfile}
          initialName={agentName}
          initialAvatar={agentAvatar}
          licenseKey={licenseKey}
        />
      )}
    </div>
  );
};
