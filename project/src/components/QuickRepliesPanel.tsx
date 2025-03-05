import React from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageSquare } from 'lucide-react';

interface QuickRepliesPanelProps {
  onSelectReply: (content: string) => void;
}

export const QuickRepliesPanel: React.FC<QuickRepliesPanelProps> = ({ onSelectReply }) => {
  const { agentSettings } = useChatStore();
  
  if (!agentSettings?.quickReplies || agentSettings.quickReplies.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>暂无快捷回复。</p>
        <p className="text-sm">请在设置中添加。</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-3 flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        快捷回复
      </h3>
      <div className="space-y-2">
        {agentSettings.quickReplies.map(reply => (
          <button
            key={reply.id}
            onClick={() => onSelectReply(reply.content)}
            className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
          >
            <div className="font-medium">{reply.title}</div>
            <div className="text-gray-600 truncate">{reply.content}</div>
          </button>
        ))}
      </div>
    </div>
  );
};