// SongMetadata.ts - Advanced metadata extraction using FFmpeg
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { FFprobeKit } from 'ffmpeg-kit-react-native';
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
 * Extracts comprehensive metadata from an audio file using FFmpeg probe
 * @param fileUri - URI of the audio file
 * @param userMetadata - User-provided metadata to merge
 * @returns Promise<SongMetadata>
 */
export async function extractSongMetadata(fileUri: string, userMetadata: Partial<SongMetadata>): Promise<SongMetadata> {
  try {
    console.log('📊 Extracting metadata from:', fileUri);

    // Check if FFprobeKit is available
    if (!FFprobeKit) {
      console.warn('⚠️ FFprobeKit not available, using fallback metadata');
      return getFallbackMetadata(fileUri, userMetadata);
    }

    // Use FFprobeKit to get comprehensive media information
    console.log('🔍 Using FFprobeKit to get media information...');

    // Parse the output for metadata
    let duration = 0;
    let bitrate = 0;
    let sampleRate = 0;
    let fileSize = 0;

    try {
      // Get media information using FFprobeKit
      const mediaInfoSession = await FFprobeKit.getMediaInformation(fileUri);
      const mediaInfoJson = await mediaInfoSession.getMediaInformation();

      console.log('🔍 FFprobeKit media info:', mediaInfoJson);

      if (mediaInfoJson && typeof mediaInfoJson === 'object') {
        const info = mediaInfoJson as any; // Type assertion for FFprobeKit API

        // Extract duration
        if (info.duration) {
          duration = parseFloat(info.duration);
        }

        // Extract bitrate
        if (info.bitrate) {
          bitrate = Math.round(parseInt(info.bitrate) / 1000); // Convert to kbps
        }

        // Extract streams information
        if (info.streams && Array.isArray(info.streams)) {
          const audioStream = info.streams.find((stream: any) => stream.codec_type === 'audio');
          if (audioStream) {
            // Extract sample rate
            if (audioStream.sample_rate) {
              sampleRate = parseInt(audioStream.sample_rate);
            }
          }
        }
      }

      // Get file size from FileSystem
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      fileSize = (fileInfo.exists && 'size' in fileInfo) ? (fileInfo as any).size : 0;

    } catch (probeError) {
      console.warn('⚠️ FFprobeKit failed, using fallback values:', probeError);
      return getFallbackMetadata(fileUri, userMetadata);
    }

    // Extract filename information
    const fileName = fileUri.split('/').pop() || 'unknown.mp3';
    const isProcessed = userMetadata.wasProcessed || false;

    // Create complete metadata object
    const metadata: SongMetadata = {
      title: userMetadata.title || (isProcessed ? 'Converted Audio' : 'Unknown Title'),
      artist: userMetadata.artist || 'Unknown Artist',
      album: userMetadata.album || '',
      genre: userMetadata.genre || 'Other',
      tags: Array.isArray(userMetadata.tags) ? userMetadata.tags : [],
      duration,
      bitrate,
      sampleRate,
      fileSize,
      fileType: 'audio',
      wasProcessed: isProcessed,
      originalFileName: userMetadata.originalFileName || (isProcessed ? '' : fileName),
      processedFileName: isProcessed ? fileName : undefined
    };

    console.log('✅ Metadata extracted:', {
      duration: `${duration}s`,
      bitrate: `${bitrate}kbps`,
      sampleRate: `${sampleRate}Hz`,
      fileSize: `${fileSize} bytes`,
      wasProcessed: isProcessed
    });

    return metadata;

  } catch (error: unknown) {
    console.error('❌ Metadata extraction error:', error);
    const err = error as Error;

    // Return basic metadata on error
    return {
      title: userMetadata.title || 'Unknown Title',
      artist: userMetadata.artist || 'Unknown Artist',
      album: userMetadata.album || '',
      genre: userMetadata.genre || 'Other',
      tags: Array.isArray(userMetadata.tags) ? userMetadata.tags : [],
      duration: 0,
      bitrate: 128,
      sampleRate: 44100,
      fileSize: 0,
      fileType: 'audio',
      wasProcessed: userMetadata.wasProcessed || false,
      originalFileName: userMetadata.originalFileName || '',
      processedFileName: userMetadata.wasProcessed ? 'converted_audio.mp3' : undefined
    };
  }
}

/**
 * Helper function to get fallback metadata when FFmpeg/FFprobe fails
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
