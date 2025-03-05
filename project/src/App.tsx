import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AgentLoginPage } from './pages/AgentLoginPage';
import { AgentDashboardPage } from './pages/AgentDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { useChatStore } from './store/chatStore';

function App() {
  const { cleanupOldChats } = useChatStore();

  useEffect(() => {
    // Initial cleanup
    cleanupOldChats();

    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      cleanupOldChats();
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(cleanupInterval);
  }, [cleanupOldChats]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AgentLoginPage />} />
        <Route
          path="/agent/dashboard"
          element={
            <ProtectedRoute>
              <AgentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// 添加路由守卫组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useChatStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default App;
