// Powered by OnSpace.AI
import { Conversation } from './chatService';

const ME = 'me';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participantName: 'Arjun Sharma',
    participantAvatar: 'https://i.pravatar.cc/150?img=11',
    lastMessage: 'Bhai aaj React Native mein kuch amazing bana raha hoon!',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 1000),
    unreadCount: 3,
    online: true,
    messages: [
      { id: 'm1', text: 'Hey bhai, kya haal hai?', senderId: 'arjun', timestamp: new Date(Date.now() - 30 * 60 * 1000), read: true, delivered: true },
      { id: 'm2', text: 'Sab badhiya! Tu bata, kya chal raha hai?', senderId: ME, timestamp: new Date(Date.now() - 28 * 60 * 1000), read: true, delivered: true },
      { id: 'm3', text: 'Bhai aaj React Native mein kuch amazing bana raha hoon!', senderId: 'arjun', timestamp: new Date(Date.now() - 5 * 60 * 1000), read: false, delivered: true },
      { id: 'm4', text: 'Dark mode, animations, aur clean code — ekdum zabardast!', senderId: 'arjun', timestamp: new Date(Date.now() - 4 * 60 * 1000), read: false, delivered: true },
      { id: 'm5', text: 'OnSpace platform pe kaam karo, bahut badhiya hai!', senderId: 'arjun', timestamp: new Date(Date.now() - 2 * 60 * 1000), read: false, delivered: true },
    ],
  },
  {
    id: '2',
    participantName: 'Priya Mehta',
    participantAvatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Okay sure, kal milte hain 👍',
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
    unreadCount: 0,
    online: true,
    messages: [
      { id: 'm1', text: 'Hi! Aaj TypeScript use kiya pehli baar', senderId: 'priya', timestamp: new Date(Date.now() - 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm2', text: 'Wah! Kaisa laga? Mujhe bhi seekhna hai', senderId: ME, timestamp: new Date(Date.now() - 55 * 60 * 1000), read: true, delivered: true },
      { id: 'm3', text: 'Bilkul shocked hoon! Itna clean code hota hai', senderId: 'priya', timestamp: new Date(Date.now() - 45 * 60 * 1000), read: true, delivered: true },
      { id: 'm4', text: 'Haan bilkul, kal milte hain aur practice karte hain', senderId: ME, timestamp: new Date(Date.now() - 20 * 60 * 1000), read: true, delivered: true },
      { id: 'm5', text: 'Okay sure, kal milte hain 👍', senderId: 'priya', timestamp: new Date(Date.now() - 15 * 60 * 1000), read: true, delivered: true },
    ],
  },
  {
    id: '3',
    participantName: 'Rahul Verma',
    participantAvatar: 'https://i.pravatar.cc/150?img=15',
    lastMessage: 'Code bhej de please, dekh leta hoon',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 1,
    online: false,
    messages: [
      { id: 'm1', text: 'Bhai ek bug aa raha hai mujhe', senderId: 'rahul', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm2', text: 'Kya error aa raha hai? Screenshot bhej', senderId: ME, timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm3', text: 'Code bhej de please, dekh leta hoon', senderId: 'rahul', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false, delivered: true },
    ],
  },
  {
    id: '4',
    participantName: 'Sneha Patel',
    participantAvatar: 'https://i.pravatar.cc/150?img=47',
    lastMessage: 'Aaj project submit kar diya 🎉',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    unreadCount: 0,
    online: false,
    messages: [
      { id: 'm1', text: 'Hello! Kya project complete ho gaya?', senderId: ME, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm2', text: 'Haan almost done hai, thodi der mein submit karti hoon', senderId: 'sneha', timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm3', text: 'Aaj project submit kar diya 🎉', senderId: 'sneha', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), read: true, delivered: true },
    ],
  },
  {
    id: '5',
    participantName: 'Vikram Singh',
    participantAvatar: 'https://i.pravatar.cc/150?img=33',
    lastMessage: 'Meeting kal subah 10 baje hai',
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unreadCount: 2,
    online: false,
    messages: [
      { id: 'm1', text: 'Bhai kal client meeting hai', senderId: 'vikram', timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm2', text: 'Kitne baje?', senderId: ME, timestamp: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm3', text: 'Meeting kal subah 10 baje hai', senderId: 'vikram', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), read: false, delivered: true },
      { id: 'm4', text: 'Presentation ready kar lena', senderId: 'vikram', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), read: false, delivered: true },
    ],
  },
  {
    id: '6',
    participantName: 'Kavya Nair',
    participantAvatar: 'https://i.pravatar.cc/150?img=44',
    lastMessage: 'Thanks bhai! Bahut help mili 😊',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    unreadCount: 0,
    online: true,
    messages: [
      { id: 'm1', text: 'Bhai UI design mein help chahiye', senderId: 'kavya', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm2', text: 'Haan bata, kya problem hai?', senderId: ME, timestamp: new Date(Date.now() - 2.3 * 24 * 60 * 60 * 1000), read: true, delivered: true },
      { id: 'm3', text: 'Thanks bhai! Bahut help mili 😊', senderId: 'kavya', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), read: true, delivered: true },
    ],
  },
];
