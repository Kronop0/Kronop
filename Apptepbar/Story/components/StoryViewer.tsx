// Re-export from compact version
export { StoryViewerComponent as StoryViewer } from './StoryViewer4';

// Types for backward compatibility
export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  videoUrl?: string;
  url?: string;
  fallbackUrl?: string;
  story_type: 'image' | 'video';
  type?: 'image' | 'video';
  useLocalAsset?: boolean;
  timestamp?: Date;
  thumbnailUrl?: string;
  duration?: number;
}

export interface StoryViewerProps {
  visible: boolean;
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onProfilePress?: (story: Story) => void;
  currentUserId?: string;
}
