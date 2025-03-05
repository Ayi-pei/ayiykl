import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserChat } from '../components/UserChat';
import { useChatStore } from '../store/chatStore';

export const UserChatPage: React.FC = () => {
  const location = useLocation();
  const { initUserChat } = useChatStore();
  const [chatId, setChatId] = useState<string | null>(null);

  // 从 URL 获取客服参数
  const params = new URLSearchParams(location.search);
  const agentId = params.get('agent');
  const token = params.get('token');

  useEffect(() => {
    if (agentId && token) {
      // 自动创建聊天
      const { chat } = initUserChat('访客', agentId);
      setChatId(chat.id);
    }
    return () => {
      // 清理工作，比如设置用户离线等
    };
  }, [agentId, token, initUserChat]);

  // 如果没有必要的参数，重定向到首页
  if (!agentId || !token) {
    return <Navigate to="/" replace />;
  }

  // 等待聊天创建完成
  if (!chatId) {
    return <div>正在连接客服...</div>;
  }

  return <UserChat chatId={chatId} />;
};
