import * as FileSystem from 'expo-file-system';

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  genre: string;
  tags: string[];
  duration?: number; // in seconds
  bitrate?: number; // in kbps
  sampleRate?: number; // in Hz
  fileSize?: number; // in bytes
  fileType: 'audio';
  wasProcessed?: boolean;
  originalFileName?: string;
  processedFileName?: string;
}

/**
 * Extracts metadata from an audio file (fallback extraction)
 * @param fileUri - URI of the audio file
 * @param userMetadata - User-provided metadata to merge
 * @returns Promise<SongMetadata>
 */
export async function extractSongMetadata(fileUri: string, userMetadata: Partial<SongMetadata>): Promise<SongMetadata> {
  console.log('📊 Using fallback metadata for:', fileUri);
  return getFallbackMetadata(fileUri, userMetadata);
}

/**
 * Helper function to get fallback metadata
 */
async function getFallbackMetadata(fileUri: string, userMetadata: Partial<SongMetadata>): Promise<SongMetadata> {
  console.log('🔄 Using fallback metadata extraction...');

  // Get basic file info
  const fileName = fileUri.split('/').pop() || 'unknown.mp3';
  const isProcessed = userMetadata.wasProcessed || false;

  let fileSize = 0;
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    fileSize = (fileInfo.exists && 'size' in fileInfo) ? (fileInfo as any).size : 0;
  } catch (error) {
    console.warn('⚠️ Could not get file size:', error);
  }

  return {
    title: userMetadata.title || (isProcessed ? 'Converted Audio' : 'Unknown Title'),
    artist: userMetadata.artist || 'Unknown Artist',
    album: userMetadata.album || '',
    genre: userMetadata.genre || 'Other',
    tags: Array.isArray(userMetadata.tags) ? userMetadata.tags : [],
    duration: 0, // Unknown without FFprobe
    bitrate: 128, // Default
    sampleRate: 44100, // Default
    fileSize,
    fileType: 'audio',
    wasProcessed: isProcessed,
    originalFileName: userMetadata.originalFileName || (isProcessed ? '' : fileName),
    processedFileName: isProcessed ? fileName : undefined
  };
}

/**
 * Validates and enhances song metadata
 * @param metadata - Input metadata
 * @returns SongMetadata
 */
export function validateSongMetadata(metadata: Partial<SongMetadata>): SongMetadata {
  return {
    title: metadata.title?.trim() || 'Unknown Title',
    artist: metadata.artist?.trim() || 'Unknown Artist',
    album: metadata.album?.trim() || '',
    genre: metadata.genre || 'Other',
    tags: Array.isArray(metadata.tags) ? metadata.tags.filter(tag => tag.trim()) : [],
    duration: metadata.duration || 0,
    bitrate: metadata.bitrate || 128,
    sampleRate: metadata.sampleRate || 44100,
    fileSize: metadata.fileSize || 0,
    fileType: 'audio',
    wasProcessed: metadata.wasProcessed || false,
    originalFileName: metadata.originalFileName || '',
    processedFileName: metadata.processedFileName
  };
}

// CommonJS exports for compatibility with song.js require()
module.exports = {
  extractSongMetadata,
  validateSongMetadata
};
