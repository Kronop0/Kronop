import { API_KEYS } from '@/constants/Config';
import { getVideoUrl } from './CloudConfig';
import { Share, Clipboard } from 'react-native';
import { API_BASE_URL } from '../../constants/network';

const KRONOP_API_URL = API_BASE_URL.replace(/\/api$/, '');

// Get JWT token helper
const getAuthHeader = () => {
  const jwtToken = process.env.EXPO_PUBLIC_JWT_TOKEN || process.env.JWT_SECRET;
  return jwtToken ? `Bearer ${jwtToken}` : '';
};

// Like/Unlike API
export const toggleLike = async (videoId: string, isCurrentlyLiked: boolean): Promise<boolean> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/live/${videoId}/like`, {
      method: isCurrentlyLiked ? 'DELETE' : 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Get likes count
export const getLikesCount = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/live/${videoId}/likes`, {
      headers: {
        'Authorization': getAuthHeader(),
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

// Get comments count
export const getCommentsCount = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/live/${videoId}/comments`, {
      headers: {
        'Authorization': getAuthHeader(),
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.count || data.comments?.length || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

// Post comment
export const postComment = async (videoId: string, text: string): Promise<boolean> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/live/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Toggle support/follow channel
export const toggleSupport = async (channelName: string, isCurrentlySupported: boolean): Promise<boolean> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/channels/${channelName}/support`, {
      method: isCurrentlySupported ? 'DELETE' : 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Share reel
export const shareReel = async (videoId: string, title: string, videoUrl: string): Promise<boolean> => {
  try {
    const shareUrl = `kronop://live/${videoId}`;
    const webUrl = `https://kronop.app/live/${videoId}`;
    const r2StreamingUrl = getVideoUrl(videoUrl);
    
    // Use React Native Share API
    const result = await Share.share({
      message: `${title}\n${r2StreamingUrl}`,
      url: r2StreamingUrl,
      title: title,
    });
    
    if (result.action === Share.sharedAction) {
      return true;
    }
    
    // Fallback: copy to clipboard using React Native Clipboard
    await Clipboard.setString(r2StreamingUrl);
    return true;
  } catch (error) {
    return false;
  }
};

// Check if user liked video
export const checkUserLiked = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/live/${videoId}/like/status`, {
      headers: {
        'Authorization': getAuthHeader(),
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.liked || false;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Get viewer count
export const getViewerCount = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/live/${videoId}/viewers`, {
      headers: {
        'Authorization': getAuthHeader(),
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};
