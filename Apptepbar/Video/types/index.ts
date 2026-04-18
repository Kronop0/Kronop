export interface Video {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  earnings: number;
  duration: string;
  timestamp: number;
  isLiked?: boolean;
  isSaved?: boolean;
  category?: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  likes: number;
  replies: number;
  timestamp: number;
  isLiked?: boolean;
}
