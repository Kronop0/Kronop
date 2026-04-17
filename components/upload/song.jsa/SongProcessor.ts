// SongProcessor.ts - Handles file processing (FFmpeg removed)
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

   
    // Unsupported file type
    throw new Error(`Unsupported file type: ${mimeType}. Only audio/* are supported.`);

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
