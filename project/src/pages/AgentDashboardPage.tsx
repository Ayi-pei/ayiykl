import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentDashboard } from '../components/AgentDashboard';
import { useChatStore } from '../store/chatStore';
import { useLicenseStore } from '../store/licenseStore';

export const AgentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentAgent, setAuthenticated } = useChatStore();
  const { licenseKey } = useLicenseStore();

  // 如果没有登录，重定向到登录页
  if (!currentAgent) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    setAuthenticated(false);
    navigate('/login');
  };

  return (
    <AgentDashboard
      agentId={currentAgent.id}
      agentName={currentAgent.name}
      licenseKey={licenseKey}
      onLogout={handleLogout}
    />
  );
};
