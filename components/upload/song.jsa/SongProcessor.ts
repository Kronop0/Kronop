// SongProcessor.ts - Handles video-to-audio conversion using FFmpeg Kit
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';

export interface ProcessedSongResult {
  processedUri: string;
  originalUri: string;
  mimeType: string;
  wasProcessed: boolean;
}

/**
 * Processes a song file: extracts audio from video if needed, or passes through audio files unchanged
 * @param fileUri - The URI of the input file
 * @param mimeType - The MIME type of the input file
 * @returns Promise<ProcessedSongResult>
 */
export async function processSongFile(fileUri: string, mimeType: string): Promise<ProcessedSongResult> {
  try {
    console.log('🎵 Processing song file:', { fileUri, mimeType });

    // If it's already audio, pass through unchanged
    if (mimeType.startsWith('audio/')) {
      console.log('✅ File is already audio, passing through unchanged');
      return {
        processedUri: fileUri,
        originalUri: fileUri,
        mimeType,
        wasProcessed: false
      };
    }

    // If it's video, extract audio using FFmpeg
    if (mimeType.startsWith('video/')) {
      console.log('🎬 Video file detected, extracting audio...');

      // Create output path in cache directory
      const timestamp = Date.now();
      const outputPath = `${(FileSystem as any).documentDirectory}extracted_audio_${timestamp}.mp3`;

      // FFmpeg command: extract audio stream without re-encoding (fast)
      // -i input -c:a copy -vn output.mp3
      const command = `-i "${fileUri}" -c:a copy -vn "${outputPath}"`;

      console.log('🚀 Running FFmpeg command:', command);

      // Execute FFmpeg command
      const session = await FFmpegKit.execute(command);

      // Check if execution was successful
      const returnCode = await session.getReturnCode();
      if (returnCode.isValueCancel() || returnCode.isValueError()) {
        const output = await session.getOutput();
        throw new Error(`FFmpeg failed: ${output}`);
      }

      console.log('✅ Audio extracted successfully from video');

      return {
        processedUri: outputPath,
        originalUri: fileUri,
        mimeType: 'audio/mpeg',
        wasProcessed: true
      };
    }

    // Unsupported file type
    throw new Error(`Unsupported file type: ${mimeType}. Only audio/* and video/* are supported.`);

  } catch (error: unknown) {
    console.error('❌ Song processing error:', error);
    const err = error as Error;
    throw new Error(`Failed to process song file: ${err.message}`);
  }
}

// CommonJS exports for compatibility with song.js require()
module.exports = {
  processSongFile
};
