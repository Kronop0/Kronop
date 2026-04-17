// Powered by OnSpace.AI
export interface Friend {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
}

export const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: 'Priya Sharma', username: '@priya_s', avatarUrl: 'https://i.pravatar.cc/150?img=1', isOnline: true },
  { id: '2', name: 'Rahul Verma', username: '@rahul_v', avatarUrl: 'https://i.pravatar.cc/150?img=3', isOnline: true },
  { id: '3', name: 'Ananya Singh', username: '@ananya_k', avatarUrl: 'https://i.pravatar.cc/150?img=5', isOnline: false },
  { id: '4', name: 'Arjun Mehta', username: '@arjun_m', avatarUrl: 'https://i.pravatar.cc/150?img=7', isOnline: true },
  { id: '5', name: 'Neha Kapoor', username: '@neha_k', avatarUrl: 'https://i.pravatar.cc/150?img=9', isOnline: true },
  { id: '6', name: 'Vikram Rao', username: '@vikram_r', avatarUrl: 'https://i.pravatar.cc/150?img=11', isOnline: false },
  { id: '7', name: 'Sneha Gupta', username: '@sneha_g', avatarUrl: 'https://i.pravatar.cc/150?img=13', isOnline: true },
  { id: '8', name: 'Karan Joshi', username: '@karan_j', avatarUrl: 'https://i.pravatar.cc/150?img=15', isOnline: true },
];
