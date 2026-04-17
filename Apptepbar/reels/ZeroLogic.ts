import { API_KEYS } from '@/constants/Config';
import { getVideoUrl, getReelUrl } from './cloudin';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Share, Clipboard } from 'react-native';
import { API_BASE_URL } from '../../constants/network';

const KRONOP_API_URL = API_BASE_URL.replace(/\/api$/, '');

// R2 S3 Client Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY!,
  },
});

// Fetch reels from Render.com API
export const fetchReelsFromAPI = async () => {
  console.log('🎬 Fetching reels from Render.com API...');

  try {
    const response = await fetch(`${KRONOP_API_URL}/api/reels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 API Response Status:', response.status);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('📡 API Response Data:', data);

    if (data.success && data.data && Array.isArray(data.data)) {
      const reels = data.data.map((reel: any) => ({
        id: reel.id || reel._id,
        _id: reel._id || reel.id,
        videoUrl: reel.videoUrl || reel.url,
        url: reel.url || reel.videoUrl,
        filename: reel.filename || reel.title,
        title: reel.title,
        description: reel.description,
        username: reel.username || reel.user?.name,
        channelName: reel.channelName || reel.user?.name,
        channelLogo: reel.channelLogo || reel.user?.avatar,
        likes: reel.likes || 0,
        comments: reel.comments || 0,
        shares: reel.shares || 0,
        views: reel.views || 0,
        isLiked: reel.isLiked || false,
        isVerified: reel.isVerified || false,
        timestamp: reel.timestamp || reel.created_at,
        created_at: reel.created_at || new Date(),
      }));

      console.log('✅ Reels fetched from API:', reels.length);
      console.log('🎯 FINAL REELS LIST:');
      reels.forEach((reel, index) => {
        console.log(`🎬 Reel ${index + 1}: ${reel.id} (${reel.title}) - URL: ${reel.videoUrl}`);
      });
      return reels;
    } else {
      console.log('⚠️ No reels data in API response');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching reels from API:', error);
    return [];
  }
};

// Keep old function for fallback
export const fetchReelsFromR2 = fetchReelsFromAPI;

// Like/Unlike API
export const toggleLike = async (videoId: string, isCurrentlyLiked: boolean): Promise<boolean> => {
  console.log('❤️ Toggling like:', videoId, isCurrentlyLiked);
  
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/like`, {
      method: isCurrentlyLiked ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Like toggle response:', response.status);
    return response.ok;
  } catch (error) {
    console.error('💥 Like toggle error:', error);
    return false;
  }
};

// Get likes count
export const getLikesCount = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/likes`);
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/comments`);
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/comments`, {
      method: 'POST',
      headers: {
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
  console.log('🔗 Sharing reel:', videoId);
  
  try {
    const shareUrl = `kronop://reels/${videoId}`;
    const webUrl = `https://kronop.app/reels/${videoId}`;
    const r2StreamingUrl = getReelUrl(videoUrl);
    
    console.log('🎬 R2 Streaming URL:', r2StreamingUrl);
    
    // Use React Native Share API
    const result = await Share.share({
      message: `${title}\n${r2StreamingUrl}`,
      url: r2StreamingUrl,
      title: title,
    });
    
    if (result.action === Share.sharedAction) {
      console.log('✅ Shared successfully');
      return true;
    }
    
    // Fallback: copy to clipboard using React Native Clipboard
    await Clipboard.setString(r2StreamingUrl);
    console.log('✅ Copied to clipboard');
    return true;
  } catch (error) {
    console.error('💥 Share error:', error);
    return false;
  }
};

// Check if user liked video
export const checkUserLiked = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/like/status`);
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/viewers`);
    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};
