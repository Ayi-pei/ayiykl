import React from 'react';
import { useChatStore } from '../store/chatStore';
import { Ban, UserCheck } from 'lucide-react';

export const BlockedUsersPanel: React.FC = () => {
  const { blockedUsers, unblockUser } = useChatStore();
  
  const handleUnblock = (userId: string) => {
    if (window.confirm('确定要解除对此用户的拉黑吗？')) {
      unblockUser(userId);
    }
  };
  
  if (blockedUsers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Ban className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>没有已拉黑的用户。</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-3 flex items-center">
        <Ban className="h-4 w-4 mr-2" />
        已拉黑用户
      </h3>
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
    </div>
  );
};