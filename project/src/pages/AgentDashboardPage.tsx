import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AgentDashboard } from '../components/AgentDashboard';

export const AgentDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get agent info from location state
  const agentId = location.state?.agentId;
  const agentName = location.state?.agentName;
  
  useEffect(() => {
    // Redirect to login if no agent info
    if (!agentId || !agentName) {
      navigate('/agent/login');
    }
  }, [agentId, agentName, navigate]);
  
  const handleLogout = () => {
    navigate('/agent/login');
  };
  
  if (!agentId || !agentName) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <AgentDashboard 
      agentId={agentId} 
      agentName={agentName} 
      onLogout={handleLogout} 
    />
  );
};