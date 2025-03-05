import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';

interface MessageInputProps {
  chatId: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ chatId, disabled }) => {
  const [message, setMessage] = useState('');
  const sendUserMessage = useChatStore(state => state.sendUserMessage);

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    sendUserMessage(chatId, message.trim());
    setMessage('');
  };

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        placeholder="输入消息..."
        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};
