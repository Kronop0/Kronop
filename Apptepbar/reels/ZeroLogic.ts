import { API_KEYS } from '@/constants/Config';
import { getVideoUrl, getReelUrl } from './cloudin';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const KRONOP_API_URL = 'https://kronop-76zy.onrender.com';

// R2 S3 Client Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY!,
  },
});

// Fetch reels directly from R2 bucket
export const fetchReelsFromR2 = async () => {
  console.log('🎬 Fetching reels directly from R2 bucket...');
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.EXPO_PUBLIC_BUCKET_REELS!,
      Prefix: 'Reels/',
      MaxKeys: 20,
    });

    const response = await r2Client.send(command);
    console.log('📡 R2 Response:', response.KeyCount || 0, 'objects found');

    if (response.Contents && response.Contents.length > 0) {
      // Filter for video files and create reel data
      const videoFiles = response.Contents.filter(obj => 
        obj.Key && (obj.Key.endsWith('.mp4') || obj.Key.endsWith('.mov') || obj.Key.endsWith('.mp4'))
      );

      console.log('🎬 Found video files:', videoFiles.length);
      videoFiles.forEach((file, index) => {
        console.log(`📹 Video ${index + 1}:`, file.Key);
      });

      const reels = videoFiles.map((file, index) => {
        const fileName = file.Key!.split('/').pop() || `reel_${index}`;
        const fileWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        
        return {
          id: fileWithoutExt,
          _id: fileWithoutExt,
          videoUrl: fileName,
          url: fileName,
          filename: fileName,
          title: fileWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Amazing reel: ${fileWithoutExt.replace(/[-_]/g, ' ')}`,
          username: 'Kronop',
          channelName: 'Kronop',
          channelLogo: `https://picsum.photos/seed/${fileWithoutExt}/200/200.jpg`,
          likes: Math.floor(Math.random() * 5000) + 100,
          comments: Math.floor(Math.random() * 500) + 10,
          shares: Math.floor(Math.random() * 200) + 5,
          views: Math.floor(Math.random() * 50000) + 1000,
          isLiked: false,
          isVerified: true,
          timestamp: file.LastModified ? file.LastModified.getTime() : Date.now(),
          created_at: file.LastModified || new Date(),
        };
      });

      console.log('✅ Reels fetched from R2:', reels.length);
      return reels;
    } else {
      console.log('⚠️ No reels found in R2 bucket');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching reels from R2:', error);
    return [];
  }
};

// Like/Unlike API
export const toggleLike = async (videoId: string, isCurrentlyLiked: boolean): Promise<boolean> => {
  console.log('❤️ Toggling like:', videoId, isCurrentlyLiked);
  
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/like`, {
      method: isCurrentlyLiked ? 'DELETE' : 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/likes`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/comments`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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
    const r2StreamingUrl = getReelUrl(videoUrl); // Use getReelUrl for proper R2 integration
    
    console.log('🎬 R2 Streaming URL:', r2StreamingUrl);
    
    // Try native share first
    if (navigator.share) {
      await navigator.share({
        title: title,
        url: r2StreamingUrl,
      });
      console.log('✅ Shared via native share');
      return true;
    }
    
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(r2StreamingUrl);
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
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/like/status`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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

// Check if user supports channel
export const checkUserSupports = async (channelName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/channels/${channelName}/support/status`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.supported || false;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// Get viewer count
export const getViewerCount = async (videoId: string): Promise<number> => {
  try {
    const response = await fetch(`${KRONOP_API_URL}/api/reels/${videoId}/viewers`, {
      headers: {
        'Authorization': `Bearer ${API_KEYS.KRONOP_API_URL}`,
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
