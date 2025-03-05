import { MessageSquare, X } from 'lucide-react';
import React from 'react';
import { useChatStore } from '../store/chatStore';

interface QuickRepliesPanelProps {
  onSelect: (content: string) => void;
  onClose: () => void;
}

export const QuickRepliesPanel: React.FC<QuickRepliesPanelProps> = ({ onSelect, onClose }) => {
  const { agentSettings } = useChatStore();

  if (!agentSettings?.quickReplies || agentSettings.quickReplies.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            快捷回复
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>暂无快捷回复。</p>
            <p className="text-sm">请在设置中添加。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          快捷回复
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {agentSettings.quickReplies.map(reply => (
            <button
              key={reply.id}
              onClick={() => onSelect(reply.content)}
              className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
            >
              <div className="font-medium">{reply.title}</div>
              <div className="text-gray-600 truncate">{reply.content}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
