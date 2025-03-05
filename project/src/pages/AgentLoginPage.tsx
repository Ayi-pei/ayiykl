import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLicenseStore } from '../store/licenseStore';
import { UserCheck, Key, Shield } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export const AgentLoginPage: React.FC = () => {
  const [agentName, setAgentName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { isLicenseValid, activateLicense } = useLicenseStore();
  const { setAuthenticated } = useChatStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Check for special admin login
      if (agentName === 'adminayi' && licenseKey === 'admin888') {
        setAuthenticated(true);
        navigate('/admin');
        return;
      }

      if (!agentName.trim() || !licenseKey.trim()) {
        throw new Error('请填写所有必填字段');
      }

      if (licenseKey.trim().length !== 16) {
        setError('无效的许可密钥格式');
        return;
      }

      // Validate license key
      if (!isLicenseValid(licenseKey)) {
        throw new Error('许可密钥无效或已过期');
      }

      setIsLoading(true);

      // Generate a simple agent ID
      const agentId = `agent_${Date.now()}`;

      // Activate license key
      const activated = await activateLicense(licenseKey, agentId);
      if (!activated) {
        throw new Error('密钥激活失败，可能已被其他客服使用');
      }

      // Navigate to agent dashboard with agent info
      setAuthenticated(true);
      navigate('/agent/dashboard', {
        state: { agentId, agentName }
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : '登录失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-12 w-12 text-blue-600 mr-2" />
          <h1 className="text-3xl font-semibold text-gray-800">客服登录</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客服姓名
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              许可密钥
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="请输入您的许可密钥"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition duration-300 ease-in-out ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                登录中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserCheck className="h-5 w-5 mr-2" />
                登录
              </div>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
};
