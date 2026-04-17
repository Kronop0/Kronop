import * as FileSystem from 'expo-file-system/legacy';

export class StreamLogic {
  private currentFileUri: string | null = null;
  private isDownloading: boolean = false;

  /**
   * Start streaming from R2 URL to local file
   * @param r2Url - Direct R2 video URL
   * @param onReady - Callback when file is ready for playback
   * @param onProgress - Callback for download progress (optional)
   * @param onError - Callback for errors (optional)
   */
  async startStreaming(
    r2Url: string,
    onReady: (fileUri: string) => void,
    onProgress?: (progress: number) => void,
    onError?: (error: Error) => void
  ) {
    try {
      console.log('🚀 Starting stream for:', r2Url);
      
      if (this.isDownloading) {
        console.log('⚠️ Already downloading, skipping');
        return;
      }

      this.isDownloading = true;

      // Create temp file in document directory
      const fileName = `temp_video_${Date.now()}.mp4`;
      this.currentFileUri = FileSystem.documentDirectory + fileName;
      
      console.log('📁 Creating temp file:', this.currentFileUri);

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        r2Url,
        this.currentFileUri,
        {},
        (downloadProgressInfo) => {
          const progress = downloadProgressInfo.totalBytesWritten / downloadProgressInfo.totalBytesExpectedToWrite;
          onProgress?.(progress);
        }
      );

      // Start download
      console.log('📥 Downloading to file...');
      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        console.log('✅ Download complete, file ready');
        this.isDownloading = false;
        onReady(result.uri);
      } else {
        throw new Error('Download failed - no result');
      }

    } catch (error) {
      console.error('❌ Stream failed:', error);
      this.isDownloading = false;
      onError?.(error as Error);
    }
  }

  /**
   * Get current file URI
   */
  getCurrentFileUri(): string | null {
    return this.currentFileUri;
  }

  /**
   * Check if file is ready
   */
  isFileReady(): boolean {
    return this.currentFileUri !== null && !this.isDownloading;
  }

  /**
   * Clean up temp file
   */
  async cleanup() {
    try {
      if (this.currentFileUri) {
        console.log('🧹 Cleaning up:', this.currentFileUri);
        
        const fileInfo = await FileSystem.getInfoAsync(this.currentFileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(this.currentFileUri);
          console.log('✅ File deleted');
        }
        
        this.currentFileUri = null;
      }
      
      this.isDownloading = false;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}
