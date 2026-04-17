// Powered by OnSpace.AI
// Mock comment data for the live comments overlay

export interface LiveComment {
  id: string;
  username: string;
  channelName: string;
  text: string;
  avatarColor: string;
  avatarLetter: string;
  timestamp: number;
}

export const MOCK_COMMENTS: Omit<LiveComment, 'id' | 'timestamp'>[] = [
  { username: 'rahul_gamer', channelName: 'Rahul Gaming', text: 'Bhai ekdum fire hai aaj! 🔥', avatarColor: '#FF6B6B', avatarLetter: 'R' },
  { username: 'priya_live', channelName: 'Priya Vlogs', text: 'Kal bhi aana live pe!', avatarColor: '#A855F7', avatarLetter: 'P' },
  { username: 'arjun_tech', channelName: 'Arjun Tech', text: 'Settings kya hai bhai?', avatarColor: '#22C55E', avatarLetter: 'A' },
  { username: 'sneha_01', channelName: 'Sneha Creates', text: '❤️❤️❤️', avatarColor: '#F59E0B', avatarLetter: 'S' },
  { username: 'vikas_bro', channelName: 'Vikas Bro', text: 'Kab se deekh raha hu yaar 😍', avatarColor: '#06B6D4', avatarLetter: 'V' },
  { username: 'ananya_sings', channelName: 'Ananya Sings', text: 'Yeh scene toh bahut acha tha!', avatarColor: '#EC4899', avatarLetter: 'A' },
  { username: 'deepak_plays', channelName: 'Deepak Plays', text: 'Aur batao aur batao 😂', avatarColor: '#8B5CF6', avatarLetter: 'D' },
  { username: 'kavya_art', channelName: 'Kavya Art', text: 'Super content! 👏', avatarColor: '#10B981', avatarLetter: 'K' },
  { username: 'mohit_xyz', channelName: 'Mohit XYZ', text: 'Bhai follow kar liya! ✅', avatarColor: '#F97316', avatarLetter: 'M' },
  { username: 'ritika_07', channelName: 'Ritika 07', text: 'Love from Delhi! 💜', avatarColor: '#3B82F6', avatarLetter: 'R' },
  { username: 'aman_creator', channelName: 'Aman Creator', text: 'Ek tip do bhai please!', avatarColor: '#EF4444', avatarLetter: 'A' },
  { username: 'pooja_live', channelName: 'Pooja Live', text: 'Background music kya hai?', avatarColor: '#14B8A6', avatarLetter: 'P' },
];
