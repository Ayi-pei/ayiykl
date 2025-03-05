export interface User {
  id: string;
  name: string;
  avatar?: string;
  ip?: string;
  device?: string;
  isOnline: boolean;
  isBlocked: boolean;
  lastSeen?: number;
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  activeChats: number;
  quickReplies: QuickReply[];
  welcomeMessage: string;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  content: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  agentId?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'waiting' | 'closed';
  accessCode: string;
  userInfo?: {
    ip?: string;
    device?: string;
    isOnline: boolean;
    lastSeen?: number;
  };
}

export interface LicenseKey {
  key: string;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
  usedBy?: string;
}

export interface AgentSettings {
  id: string;
  agentName: string;
  avatar?: string;
  quickReplies: QuickReply[];
  welcomeMessage: string;
  blockedUsers: string[];
}