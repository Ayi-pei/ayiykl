import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { User, Clock, Send, X, Ban, Image, Smile, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { Attachment } from '../types';
import { useDropzone } from 'react-dropzone';
import Emoji from 'emoji-picker-react';

interface AgentChatWindowProps {
  chatId: string;
}

export const AgentChatWindow: React.FC<AgentChatWindowProps> = ({ chatId }) => {
  const { getChatById, sendAgentMessage, closeChat, blockUser } = useChatStore();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const chat = getChatById(chatId);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: acceptedFiles => {
      handleFileUpload(acceptedFiles);
    }
  });
  
  const handleSendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || !chat) return;
    
    sendAgentMessage(chatId, message, attachments);
    setMessage('');
    setAttachments([]);
  };
  
  const handleCloseChat = () => {
    if (window.confirm('确定要关闭此聊天吗？')) {
      closeChat(chatId);
    }
  };
  
  const handleBlockUser = () => {
    if (window.confirm(`确定要拉黑 ${chat?.userName}？他们将无法再联系客服。`)) {
      blockUser(chat?.userId || '');
    }
  };
  
  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const newAttachments: Attachment[] = await Promise.all(
        files.map(async (file) => {
          // Convert file to base64 for preview
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          return {
            id: Math.random().toString(36).substring(2, 11),
            type: 'image',
            url: dataUrl,
            name: file.name,
            size: file.size
          };
        })
      );
      
      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);
  
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">聊天未找到。</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 shadow-md flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">{chat.userName}</h2>
              <span className={`h-2 w-2 rounded-full ${chat.userInfo?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>开始时间: {format(new Date(chat.createdAt), 'yyyy年MM月dd日 HH:mm')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">访问码: {chat.accessCode}</span>
            <button
              onClick={handleBlockUser}
              className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-full"
              title="拉黑用户"
            >
              <Ban className="h-5 w-5" />
            </button>
            <button
              onClick={handleCloseChat}
              className="p-2 text-red-500 hover:bg-red-100 rounded-full"
              title="关闭聊天"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {chat.messages.map(message => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isCurrentUser={message.senderType === 'agent'} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="bg-white p-2 border-t flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="relative group">
                <img 
                  src={attachment.url} 
                  alt={attachment.name} 
                  className="h-16 w-16 object-cover rounded border"
                />
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex space-x-2 items-end">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="输入您的消息..."
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                disabled={chat.status === 'closed'}
              />
              <div className="absolute bottom-2 left-2 flex space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 hover:text-blue-500"
                    disabled={chat.status === 'closed'}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute bottom-8 left-0 z-10"
                    >
                      <Emoji onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <button
                    className="text-gray-500 hover:text-blue-500"
                    disabled={chat.status === 'closed' || isUploading}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!message.trim() && attachments.length === 0) || chat.status === 'closed'}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {chat.status === 'closed' && (
            <p className="text-sm text-red-500 mt-2">此聊天已关闭。</p>
          )}
        </div>
      </div>
      
      {/* User info sidebar */}
      <div className="w-64 bg-white border-l p-4">
        <h3 className="font-semibold text-lg mb-4">用户信息</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">姓名</h4>
            <p>{chat.userName}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">状态</h4>
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${chat.userInfo?.isOnline ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></span>
              <span>{chat.userInfo?.isOnline ? '在线' : '离线'}</span>
            </div>
          </div>
          
          {chat.userInfo?.lastSeen && !chat.userInfo.isOnline && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">最后在线</h4>
              <p>{format(new Date(chat.userInfo.lastSeen), 'yyyy年MM月dd日 HH:mm')}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">IP地址</h4>
            <p>{chat.userInfo?.ip || '未知'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">设备</h4>
            <p>{chat.userInfo?.device || '未知'}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">聊天开始时间</h4>
            <p>{format(new Date(chat.createdAt), 'yyyy年MM月dd日 HH:mm')}</p>
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={handleBlockUser}
              className="w-full flex items-center justify-center space-x-2 bg-yellow-100 text-yellow-800 p-2 rounded hover:bg-yellow-200"
            >
              <Ban className="h-4 w-4" />
              <span>拉黑用户</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};