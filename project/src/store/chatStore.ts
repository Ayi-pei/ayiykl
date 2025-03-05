import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import { create } from 'zustand';
import { Agent, AgentSettings, Attachment, Chat, Message, User } from '../types';

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  currentUser: User | null;
  currentAgent: Agent | null;
  blockedUsers: string[];
  agentSettings: AgentSettings | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // User actions
  initUserChat: (userName: string, agentId?: string) => { chat: Chat };
  joinChatWithCode: (accessCode: string, userName: string) => Chat | null;
  sendUserMessage: (chatId: string, content: string, attachments?: Attachment[], senderType?: 'user' | 'agent') => void;
  setUserOnlineStatus: (userId: string, isOnline: boolean) => void;

  // Auth actions
  setAuthenticated: (value: boolean) => void;

  // Agent actions
  setCurrentAgent: (agent: Agent) => void;
  acceptChat: (chatId: string, agentId: string) => void;
  sendAgentMessage: (chatId: string, content: string, attachments?: Attachment[]) => void;
  closeChat: (chatId: string) => void;
  setActiveChat: (chatId: string | null) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;

  // Settings
  updateAgentProfile: (name: string, avatar?: string) => void;
  addQuickReply: (title: string, content: string) => void;
  removeQuickReply: (id: string) => void;
  updateWelcomeMessage: (message: string) => void;

  // Utility functions
  getChatById: (chatId: string) => Chat | undefined;
  getChatByAccessCode: (code: string) => Chat | undefined;
  getActiveChatData: () => Chat | null;
  cleanupOldChats: () => void;
  isUserBlocked: (userId: string) => boolean;

  // Loading state
  setLoading: (loading: boolean) => void;
}

// Helper to get user device and IP info
const getUserDeviceInfo = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    device: `${result.browser.name || 'Unknown'} on ${result.os.name || 'Unknown'}`,
    // IP would normally be obtained from the server
    ip: '127.0.0.1' // Placeholder
  };
};

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  currentUser: null,
  currentAgent: null,
  blockedUsers: [],
  agentSettings: null,
  isLoading: false,
  isAuthenticated: false,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),

  initUserChat: (userName: string, agentId?: string) => {
    const userId = nanoid();
    const deviceInfo = getUserDeviceInfo();
    const accessCode = nanoid(8);

    const newChat: Chat = {
      id: nanoid(),
      userId,
      userName,
      accessCode,
      messages: [{
        id: nanoid(),
        senderId: 'system',
        senderType: 'system',
        content: '正在为您连接客服...',
        timestamp: Date.now(),
        status: 'delivered'
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'waiting',
      agentId,
      userInfo: {
        ip: deviceInfo.ip,
        device: deviceInfo.device,
        isOnline: true
      }
    };

    set((state) => ({
      chats: [...state.chats, newChat],
      currentUser: {
        id: userId,
        name: userName,
        ip: deviceInfo.ip,
        device: deviceInfo.device,
        isOnline: true,
        isBlocked: false
      }
    }));

    return { chat: newChat };
  },

  joinChatWithCode: (accessCode, userName) => {
    const chat = get().getChatByAccessCode(accessCode);
    if (!chat) return null;

    const deviceInfo = getUserDeviceInfo();

    // Check if user is blocked
    if (get().isUserBlocked(chat.userId)) {
      return null;
    }

    // If chat exists but is closed, reopen it
    if (chat.status === 'closed') {
      set((state) => ({
        chats: state.chats.map(c =>
          c.id === chat.id
            ? {
                ...c,
                status: 'waiting',
                messages: [
                  ...c.messages,
                  {
                    id: nanoid(),
                    senderId: 'system',
                    senderType: 'system',
                    content: `${userName} has rejoined the chat.`,
                    timestamp: Date.now(),
                    status: 'delivered'
                  }
                ],
                updatedAt: Date.now(),
                userInfo: {
                  ...c.userInfo,
                  isOnline: true,
                  lastSeen: Date.now()
                }
              }
            : c
        ),
        currentUser: {
          id: chat.userId,
          name: userName,
          ip: deviceInfo.ip,
          device: deviceInfo.device,
          isOnline: true,
          isBlocked: false
        }
      }));
    } else {
      set((state) => ({
        chats: state.chats.map(c =>
          c.id === chat.id
            ? {
                ...c,
                userInfo: {
                  ...c.userInfo,
                  isOnline: true,
                  lastSeen: Date.now()
                }
              }
            : c
        ),
        currentUser: {
          id: chat.userId,
          name: userName,
          ip: deviceInfo.ip,
          device: deviceInfo.device,
          isOnline: true,
          isBlocked: false
        }
      }));
    }

    return chat;
  },

  sendUserMessage: (chatId, content, attachments = [], senderType = 'user') => {
    const chat = get().getChatById(chatId);
    if (!chat) return;

    const newMessage: Message = {
      id: nanoid(),
      senderId: senderType === 'user' ? chat.userId : (chat.agentId || 'system'),
      senderType,
      content,
      timestamp: Date.now(),
      status: 'sent',
      attachments
    };

    set(state => ({
      chats: state.chats.map(c =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              updatedAt: Date.now()
            }
          : c
      )
    }));
  },

  setUserOnlineStatus: (userId, isOnline) => {
    set((state) => ({
      chats: state.chats.map(chat =>
        chat.userId === userId
          ? {
              ...chat,
              userInfo: {
                ...chat.userInfo,
                isOnline,
                lastSeen: isOnline ? undefined : Date.now()
              }
            }
          : chat
      )
    }));
  },

  setCurrentAgent: (agent) => {
    set({ currentAgent: agent });

    // Initialize agent settings if not already set
    if (!get().agentSettings) {
      set({
        agentSettings: {
          id: agent.id,
          agentName: agent.name,
          avatar: agent.avatar,
          quickReplies: agent.quickReplies || [],
          welcomeMessage: agent.welcomeMessage || 'Welcome! How can I help you today?',
          blockedUsers: []
        }
      });
    }
  },

  acceptChat: (chatId, agentId) => {
    const chat = get().getChatById(chatId);
    if (!chat) return;

    // Check if user is blocked
    if (get().isUserBlocked(chat.userId)) {
      return;
    }

    const welcomeMessage = get().agentSettings?.welcomeMessage || 'Welcome! How can I help you today?';

    set((state) => ({
      chats: state.chats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              agentId,
              status: 'active',
              messages: [
                ...chat.messages,
                {
                  id: nanoid(),
                  senderId: 'system',
                  senderType: 'system',
                  content: `An agent has joined the chat.`,
                  timestamp: Date.now(),
                  status: 'delivered'
                },
                {
                  id: nanoid(),
                  senderId: agentId,
                  senderType: 'agent',
                  content: welcomeMessage,
                  timestamp: Date.now() + 100, // Slight delay after system message
                  status: 'sent'
                }
              ],
              updatedAt: Date.now()
            }
          : chat
      )
    }));
  },

  sendAgentMessage: (chatId, content, attachments = []) => {
    const agent = get().currentAgent;
    if (!agent) return;

    const newMessage: Message = {
      id: nanoid(),
      senderId: agent.id,
      senderType: 'agent',
      content,
      timestamp: Date.now(),
      status: 'sent',
      attachments
    };

    set((state) => ({
      chats: state.chats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              updatedAt: Date.now()
            }
          : chat
      )
    }));
  },

  closeChat: (chatId) => {
    set((state) => ({
      chats: state.chats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              status: 'closed',
              messages: [
                ...chat.messages,
                {
                  id: nanoid(),
                  senderId: 'system',
                  senderType: 'system',
                  content: 'This chat has been closed.',
                  timestamp: Date.now(),
                  status: 'delivered'
                }
              ],
              updatedAt: Date.now()
            }
          : chat
      ),
      activeChat: state.activeChat === chatId ? null : state.activeChat
    }));
  },

  setActiveChat: (chatId) => {
    set({ activeChat: chatId });
  },

  blockUser: (userId) => {
    set((state) => {
      const blockedUsers = [...(state.agentSettings?.blockedUsers || []), userId];

      return {
        blockedUsers: [...state.blockedUsers, userId],
        agentSettings: state.agentSettings
          ? { ...state.agentSettings, blockedUsers }
          : null,
        // Close any active chats with this user
        chats: state.chats.map(chat =>
          chat.userId === userId && chat.status !== 'closed'
            ? {
                ...chat,
                status: 'closed',
                messages: [
                  ...chat.messages,
                  {
                    id: nanoid(),
                    senderId: 'system',
                    senderType: 'system',
                    content: 'This chat has been closed by the agent.',
                    timestamp: Date.now(),
                    status: 'delivered'
                  }
                ],
                updatedAt: Date.now()
              }
            : chat
        ),
        activeChat: state.activeChat && state.chats.find(c => c.id === state.activeChat)?.userId === userId
          ? null
          : state.activeChat
      };
    });
  },

  unblockUser: (userId) => {
    set((state) => ({
      blockedUsers: state.blockedUsers.filter(id => id !== userId),
      agentSettings: state.agentSettings
        ? {
            ...state.agentSettings,
            blockedUsers: (state.agentSettings.blockedUsers || []).filter(id => id !== userId)
          }
        : null
    }));
  },

  updateAgentProfile: (name, avatar) => {
    set((state) => ({
      currentAgent: state.currentAgent
        ? { ...state.currentAgent, name, avatar }
        : null,
      agentSettings: state.agentSettings
        ? { ...state.agentSettings, agentName: name, avatar }
        : null
    }));
  },

  addQuickReply: (title, content) => {
    const newQuickReply = {
      id: nanoid(),
      title,
      content
    };

    set((state) => ({
      currentAgent: state.currentAgent
        ? {
            ...state.currentAgent,
            quickReplies: [...(state.currentAgent.quickReplies || []), newQuickReply]
          }
        : null,
      agentSettings: state.agentSettings
        ? {
            ...state.agentSettings,
            quickReplies: [...(state.agentSettings.quickReplies || []), newQuickReply]
          }
        : null
    }));
  },

  removeQuickReply: (id) => {
    set((state) => ({
      currentAgent: state.currentAgent
        ? {
            ...state.currentAgent,
            quickReplies: (state.currentAgent.quickReplies || []).filter(qr => qr.id !== id)
          }
        : null,
      agentSettings: state.agentSettings
        ? {
            ...state.agentSettings,
            quickReplies: (state.agentSettings.quickReplies || []).filter(qr => qr.id !== id)
          }
        : null
    }));
  },

  updateWelcomeMessage: (message) => {
    set((state) => ({
      currentAgent: state.currentAgent
        ? { ...state.currentAgent, welcomeMessage: message }
        : null,
      agentSettings: state.agentSettings
        ? { ...state.agentSettings, welcomeMessage: message }
        : null
    }));
  },

  getChatById: (chatId) => {
    return get().chats.find(chat => chat.id === chatId);
  },

  getChatByAccessCode: (code) => {
    return get().chats.find(chat => chat.accessCode === code);
  },

  getActiveChatData: () => {
    const { activeChat, chats } = get();
    if (!activeChat) return null;
    return chats.find(chat => chat.id === activeChat) || null;
  },

  // 仅清理状态为 closed 且最后更新时间超过24小时的聊天记录
  cleanupOldChats: () => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    set((state) => ({
      chats: state.chats.filter(chat => chat.status !== 'closed' || chat.updatedAt > oneDayAgo)
    }));
  },

  isUserBlocked: (userId) => {
    return get().blockedUsers.includes(userId) ||
           (get().agentSettings?.blockedUsers || []).includes(userId);
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
