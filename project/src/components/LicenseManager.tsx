import React, { useState } from 'react';
import { useLicenseStore } from '../store/licenseStore';

export const LicenseManager: React.FC = () => {
  const [expiryDays, setExpiryDays] = useState(30); // 默认30天
  const { generateLicenseKey } = useLicenseStore();

  const handleGenerateLicense = () => {
    const key = generateLicenseKey(expiryDays); // 使用管理员设置的天数
    // ... 处理生成的许可证密钥
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          许可证有效期（天）
        </label>
        <input
          type="number"
          min="1"
          max="3650"  // 最长10年
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <button
        onClick={handleGenerateLicense}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        生成许可证
      </button>
    </div>
  );
};
