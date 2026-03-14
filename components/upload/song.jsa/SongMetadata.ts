// SongMetadata.ts - Advanced metadata extraction using FFmpeg
import { FFmpegKit, FFmpegKitConfig } from 'ffmpeg-kit-react-native';
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

    // Use FFmpeg to probe the file for technical metadata
    const probeCommand = `-i "${fileUri}" -f ffmetadata -`;

    console.log('🔍 Running FFmpeg probe command:', probeCommand);

    // Execute probe command to get file information
    const session = await FFmpegKit.execute(`-i "${fileUri}" -f null -`);

    // Get detailed information using ffprobe-like approach
    const infoSession = await FFmpegKit.execute(`-i "${fileUri}" 2>&1 | grep -E "(Duration|bitrate|Hz|size)" || echo "probe_failed"`);

    // Parse the output for metadata
    let duration = 0;
    let bitrate = 0;
    let sampleRate = 0;
    let fileSize = 0;

    try {
      const output = await infoSession.getOutput();
      console.log('🔍 FFmpeg probe output:', output);

      // Parse duration (format: Duration: 00:03:24.56)
      const durationMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseInt(durationMatch[3]);
        const centiseconds = parseInt(durationMatch[4]);
        duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
      }

      // Parse bitrate (format: bitrate: 128 kb/s)
      const bitrateMatch = output.match(/bitrate:\s*(\d+)\s*kb\/s/);
      if (bitrateMatch) {
        bitrate = parseInt(bitrateMatch[1]);
      }

      // Parse sample rate (format: 44100 Hz)
      const sampleRateMatch = output.match(/(\d+)\s*Hz/);
      if (sampleRateMatch) {
        sampleRate = parseInt(sampleRateMatch[1]);
      }

      // Get file size from FileSystem
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      fileSize = (fileInfo.exists && 'size' in fileInfo) ? (fileInfo as any).size : 0;

    } catch (probeError) {
      console.warn('⚠️ FFmpeg probe failed, using fallback values:', probeError);
      // Fallback values if probe fails
      duration = 0;
      bitrate = 128; // default
      sampleRate = 44100; // default
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      fileSize = (fileInfo.exists && 'size' in fileInfo) ? (fileInfo as any).size : 0;
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
