import { Ban, UserCheck, X } from 'lucide-react';
import React from 'react';
import { useChatStore } from '../store/chatStore';

interface BlockedUsersPanelProps {
  onClose: () => void;
}

export const BlockedUsersPanel: React.FC<BlockedUsersPanelProps> = ({ onClose }) => {
  const { blockedUsers, unblockUser } = useChatStore();

  const handleUnblock = (userId: string) => {
    if (window.confirm('确定要解除对此用户的拉黑吗？')) {
      unblockUser(userId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 面板头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium flex items-center">
          <Ban className="h-4 w-4 mr-2" />
          已拉黑用户
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {blockedUsers.length === 0 ? (
          <div className="text-center text-gray-500">
            <Ban className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>没有已拉黑的用户。</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map(userId => (
              <div key={userId} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                <span className="text-sm truncate">{userId}</span>
                <button
                  onClick={() => handleUnblock(userId)}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-xs"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  解除拉黑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
