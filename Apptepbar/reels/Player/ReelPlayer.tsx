import React, { useState } from 'react';
import { View } from 'react-native';
import { VideoView } from 'expo-video';
import { useReelChunking, useReelPlayerSetup, styles } from './ReelPlayer2';

interface ReelPlayerProps {
  videoUrl: string;
  isPlaying?: boolean;
  nextVideoUrl?: string; // Add next video URL for pre-fetch
}

const ReelPlayer: React.FC<ReelPlayerProps> = ({
  videoUrl,
  isPlaying = true,
  nextVideoUrl
}) => {
  console.log('🚀 Ultra-Fast ReelPlayer with Chunking:', videoUrl);

  const [localVideoUri, setLocalVideoUri] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);

  // Use chunking logic from ReelPlayer2
  const { streamLogicRef, cleanup } = useReelChunking(videoUrl, nextVideoUrl, setLocalVideoUri, setIsBuffering);
  
  // Use player setup logic from ReelPlayer2 - ONLY when localUri is available
  const { player, showControls } = useReelPlayerSetup(localVideoUri, isPlaying);

  // ONLY LOCAL FILE - NO DIRECT URL FALLBACK
  const finalVideoUrl = localVideoUri || null; // Wait for local file, don't fallback to direct URL

  return (
    <View style={styles.container}>
      <VideoView 
        player={player} 
        style={styles.video}
        contentFit="cover" // Perfect fit without distortion
        allowsFullscreen={false}
        // NO NATIVE CONTROLS - पूरी तरह से disable
        allowsPictureInPicture={false}
        nativeControls={false}
      />
    </View>
  );
};

export default ReelPlayer;
