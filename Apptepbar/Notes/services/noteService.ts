// Powered by OnSpace.AI
// Note data service — pure data layer, no React

export interface NoteUser {
  id: string;
  name: string;
  handle: string;
  avatarUri: string;
  isVerified: boolean;
}

export interface NoteData {
  id: string;
  user: NoteUser;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  supporters: number;
  isLiked: boolean;
  isSupported: boolean;
}

export const getMockNotes = (): NoteData[] => [
  {
    id: 'note-001',
    user: {
      id: 'user-001',
      name: 'Arjun Sharma',
      handle: '@arjun_dev',
      avatarUri: 'https://i.pravatar.cc/150?img=12',
      isVerified: true,
    },
    content:
      'React Native ke saath kuch naya ban raha hai aaj! OnSpace pe ek amazing note card banaya — dark mode, animations, aur clean code. Developers ke liye best platform hai yaar. Agar tum bhi kuch bana rahe ho toh zaroor share karo, community se bahut kuch seekhne ko milta hai. #ReactNative #OnSpace #BuildInPublic',
    timestamp: '10:42 AM · Apr 12, 2026',
    likes: 1248,
    comments: 87,
    shares: 312,
    supporters: 56,
    isLiked: false,
    isSupported: false,
  },
  {
    id: 'note-002',
    user: {
      id: 'user-002',
      name: 'Priya Mehta',
      handle: '@priya_codes',
      avatarUri: 'https://i.pravatar.cc/150?img=47',
      isVerified: true,
    },
    content:
      'Aaj pehli baar TypeScript use kiya React Native ke saath aur bilkul shocked hoon! Itna clean aur readable code hota hai. Pehle toh darr lag raha tha but ab lagta hai bina types ke coding adhuri hai. Tumhe bhi zaroor try karna chahiye, ek baar start karo toh band nahi hoga. Trust me on this!',
    timestamp: '9:15 AM · Apr 12, 2026',
    likes: 934,
    comments: 64,
    shares: 201,
    supporters: 38,
    isLiked: false,
    isSupported: false,
  },
  {
    id: 'note-003',
    user: {
      id: 'user-003',
      name: 'Rahul Verma',
      handle: '@rahul_ui',
      avatarUri: 'https://i.pravatar.cc/150?img=33',
      isVerified: false,
    },
    content:
      'Dark mode UI design karte waqt ek cheez yaad rakhna — sirf background kaala karna dark mode nahi hota! Contrast ratios, surface elevations, aur color semantics sab milke dark mode banate hain. Maine 3 ghante laga diye ek perfect dark card banane mein aur result dekh ke dil khush ho gaya. Design is patience.',
    timestamp: '8:03 AM · Apr 12, 2026',
    likes: 567,
    comments: 43,
    shares: 178,
    supporters: 22,
    isLiked: true,
    isSupported: false,
  },
  {
    id: 'note-004',
    user: {
      id: 'user-004',
      name: 'Sneha Joshi',
      handle: '@sneha_builds',
      avatarUri: 'https://i.pravatar.cc/150?img=25',
      isVerified: true,
    },
    content:
      'Expo Router v3 ne sab badal diya bhai! File-based routing itna smooth hai ki ab manually navigation configure karna feel hi nahi hota. Nested routes, dynamic params, modals — sab kuch ek hi system mein. Agar abhi bhi React Navigation manually kar rahe ho, toh ek baar Expo Router zaroor try karo.',
    timestamp: '7:30 AM · Apr 12, 2026',
    likes: 2103,
    comments: 156,
    shares: 489,
    supporters: 91,
    isLiked: false,
    isSupported: true,
  },
  {
    id: 'note-005',
    user: {
      id: 'user-005',
      name: 'Karan Kapoor',
      handle: '@karan_mobile',
      avatarUri: 'https://i.pravatar.cc/150?img=68',
      isVerified: false,
    },
    content:
      'Animation seekhna mushkil lagta hai pehle, lekin react-native-reanimated ek baar samajh aaye toh sab kuch fun lagta hai. Aaj ek smooth card flip animation banaya sirf 20 lines mein. Trick hai shared values aur worklets ko sahi se use karna. Chhota sa tip: useAnimatedStyle ke andar heavy logic mat daalo.',
    timestamp: '6:45 AM · Apr 12, 2026',
    likes: 789,
    comments: 52,
    shares: 234,
    supporters: 44,
    isLiked: false,
    isSupported: false,
  },
];

export const formatCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
};
