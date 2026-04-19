// Powered by OnSpace.AI
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Conversation, Message } from '../services/chatService';
import { MOCK_CONVERSATIONS } from '../services/mockData';

export interface BlockedUser { id: string; name: string; avatar: string; }

interface ChatContextType {
  conversations: Conversation[];
  blockedUsers: BlockedUser[];
  sendMessage: (conversationId: string, text: string, senderId?: string) => void;
  markAsRead: (conversationId: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  deleteMessages: (conversationId: string, messageIds: string[]) => void;
  blockUser: (conversationId: string) => void;
  unblockUser: (userId: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const sendMessage = useCallback((conversationId: string, text: string, senderId = 'me') => {
    const newMsg: Message = { id: `msg_${Date.now()}`, text, senderId, timestamp: new Date(), read: false, delivered: true };
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastMessageTime: new Date() } : c)
    );
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c)
    );
  }, []);

  const getConversation = useCallback((id: string) => conversations.find(c => c.id === id), [conversations]);

  const deleteMessages = useCallback((conversationId: string, messageIds: string[]) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        const msgs = c.messages.filter(m => !messageIds.includes(m.id));
        return { ...c, messages: msgs, lastMessage: msgs[msgs.length - 1]?.text ?? '' };
      })
    );
  }, []);

  const blockUser = useCallback((conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;
    setBlockedUsers(prev => {
      if (prev.find(u => u.id === conversationId)) return prev;
      return [...prev, { id: conversationId, name: conv.participantName, avatar: conv.participantAvatar }];
    });
  }, [conversations]);

  const unblockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  return (
    <ChatContext.Provider value={{ conversations, blockedUsers, sendMessage, markAsRead, getConversation, deleteMessages, blockUser, unblockUser }}>
      {children}
    </ChatContext.Provider>
  );
}
