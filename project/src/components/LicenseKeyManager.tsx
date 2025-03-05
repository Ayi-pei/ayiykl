import React, { useState } from 'react';
import { useLicenseStore } from '../store/licenseStore';
import { Key, Plus, Trash, Check, X, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

export const LicenseKeyManager: React.FC = () => {
  const { licenseKeys, generateLicenseKey, deactivateLicense, cleanupExpiredLicenses } = useLicenseStore();
  const [expiresInDays, setExpiresInDays] = useState(30);
  
  const handleGenerateKey = () => {
    if (expiresInDays < 1 || expiresInDays > 365) {
      alert('有效期必须在1-365天之间');
      return;
    }
    generateLicenseKey(expiresInDays);
  };
  
  const handleDeactivateKey = (key: string) => {
    if (window.confirm('确定要停用这个许可密钥吗？')) {
      deactivateLicense(key);
    }
  };
  
  const handleCleanupExpired = () => {
    if (window.confirm('确定要清理过期的许可密钥吗？')) {
      cleanupExpiredLicenses();
    }
  };

  // 检查密钥是否即将过期（7天内）
  const isExpiringSoon = (expiresAt: number) => {
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    return expiresAt <= sevenDaysFromNow && expiresAt > Date.now();
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Key className="h-6 w-6 mr-2" />
          许可密钥管理
        </h1>
        <button
          onClick={handleCleanupExpired}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          清理过期密钥
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">生成新的许可密钥</h2>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              有效期（天）
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                到期时间: {format(addDays(new Date(), expiresInDays), 'yyyy年MM月dd日')}
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerateKey}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            生成密钥
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                许可密钥
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                过期时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                使用者
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {licenseKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  没有找到许可密钥。生成一个开始使用。
                </td>
              </tr>
            ) : (
              licenseKeys.map((license) => {
                const isExpiring = isExpiringSoon(license.expiresAt);
                return (
                  <tr key={license.key} className={isExpiring ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {license.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(license.createdAt), 'yyyy年MM月dd日')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isExpiring ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {format(new Date(license.expiresAt), 'yyyy年MM月dd日')}
                      {isExpiring && ' (即将过期)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(license.expiresAt).getTime() > Date.now() ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <Check className="h-4 w-4 mr-1" />
                          有效
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <X className="h-4 w-4 mr-1" />
                          已过期
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {license.usedBy || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {new Date(license.expiresAt).getTime() > Date.now() && !license.usedBy && (
                        <button
                          onClick={() => handleDeactivateKey(license.key)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};