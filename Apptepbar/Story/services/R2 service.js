// Cloudflare R2 Service for fetching Stories
// Simple fetch-only service for Story data (videos and photos)

const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// [KRONOP-DEBUG] Loading R2 Configuration from environment variables
console.log("[KRONOP-DEBUG] 🚀 Initializing R2 Story Service...");

const R2_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID,
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  bucketName: process.env.EXPO_PUBLIC_BUCKET_STORY || "kronop-story",
  publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL,
};

// [KRONOP-DEBUG] Log environment variables status
console.log("[KRONOP-DEBUG] 📋 Environment Variables Status:");
console.log(
  "[KRONOP-DEBUG]   - Account ID:",
  R2_CONFIG.accountId ? "✅ Loaded" : "❌ Missing",
);
console.log(
  "[KRONOP-DEBUG]   - Access Key ID:",
  R2_CONFIG.accessKeyId ? "✅ Loaded" : "❌ Missing",
);
console.log(
  "[KRONOP-DEBUG]   - Secret Access Key:",
  R2_CONFIG.secretAccessKey ? "✅ Loaded" : "❌ Missing",
);
console.log(
  "[KRONOP-DEBUG]   - Endpoint:",
  R2_CONFIG.endpoint ? "✅ Loaded" : "❌ Missing",
);
console.log("[KRONOP-DEBUG]   - Bucket Name:", R2_CONFIG.bucketName);

class R2StoryService {
  constructor() {
    // [KRONOP-DEBUG] Initialize S3 Client for Cloudflare R2
    console.log("[KRONOP-DEBUG] 🔧 Creating S3 Client for R2...");

    // Check if credentials are available
    const hasCredentials = R2_CONFIG.accessKeyId && R2_CONFIG.secretAccessKey;
    const hasEndpoint = R2_CONFIG.endpoint;

    if (!hasCredentials || !hasEndpoint) {
      console.warn("[KRONOP-DEBUG] ⚠️ R2 credentials not configured - service will return empty data");
      console.warn("[KRONOP-DEBUG]   - Access Key ID:", R2_CONFIG.accessKeyId ? "✅" : "❌ Missing");
      console.warn("[KRONOP-DEBUG]   - Secret Access Key:", R2_CONFIG.secretAccessKey ? "✅" : "❌ Missing");
      console.warn("[KRONOP-DEBUG]   - Endpoint:", R2_CONFIG.endpoint ? "✅" : "❌ Missing");
      this.client = null;
      this.bucketName = R2_CONFIG.bucketName;
      return;
    }

    try {
      this.client = new S3Client({
        region: "auto",
        endpoint: R2_CONFIG.endpoint,
        credentials: {
          accessKeyId: R2_CONFIG.accessKeyId,
          secretAccessKey: R2_CONFIG.secretAccessKey,
        },
        maxAttempts: 3,
        forcePathStyle: true,
      });
      this.bucketName = R2_CONFIG.bucketName;
      console.log("[KRONOP-DEBUG] ✅ S3 Client created successfully");
    } catch (error) {
      console.error(
        "[KRONOP-DEBUG] ❌ Failed to create S3 Client:",
        error.message,
      );
      this.client = null;
      this.bucketName = R2_CONFIG.bucketName;
    }
  }

  /**
   * Fetch all story files from R2 bucket
   */
  async fetchStories() {
    console.log("[KRONOP-DEBUG] 🔍 Starting to fetch stories from R2...");
    console.log("[KRONOP-DEBUG] 📦 Bucket:", this.bucketName);
    console.log("[KRONOP-DEBUG] 🔑 Account ID:", R2_CONFIG.accountId);
    console.log("[KRONOP-DEBUG] 🌐 Endpoint:", R2_CONFIG.endpoint);

    // Return empty data if client is not initialized
    if (!this.client) {
      console.warn("[KRONOP-DEBUG] ⚠️ R2 client not initialized - returning empty story list");
      return [];
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1000, // Fetch up to 1000 objects
      });

      console.log("[KRONOP-DEBUG] 📤 Sending ListObjectsV2Command to R2...");
      const response = await this.client.send(command);

      console.log("[KRONOP-DEBUG] � R2 Response received:", {
        objectCount: response.Contents?.length || 0,
        isTruncated: response.IsTruncated,
        bucketName: this.bucketName,
      });

      if (!response.Contents || response.Contents.length === 0) {
        console.warn(
          "[KRONOP-DEBUG] ⚠️ R2 story bucket is empty - no objects found",
        );
        console.warn(
          "[KRONOP-DEBUG] 💡 Please upload story files to the kronop-story bucket",
        );
        return [];
      }

      console.log(
        `[KRONOP-DEBUG] 📂 Found ${response.Contents.length} objects in bucket, processing...`,
      );

      // Convert R2 objects to Story format
      let validStories = 0;
      let skippedFiles = 0;

      // Process all stories asynchronously
      const storyPromises = response.Contents.map(async (item, index) => {
        const key = item.Key || "";
        const fileName = key.split("/").pop() || "";
        const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

        // [KRONOP-DEBUG] Log file processing details
        console.log(`[KRONOP-DEBUG] 📁 Processing file: ${fileName}`);
        console.log(`[KRONOP-DEBUG]   - File extension: ${fileExtension}`);
        console.log(`[KRONOP-DEBUG]   - Full key path: ${key}`);

        // Determine story type based on file extension (ROBUST LOGIC)
        const videoExtensions = [
          "mp4",
          "mov",
          "avi",
          "mkv",
          "webm",
          "m4v",
          "3gp",
          "flv",
          "wmv",
          "mpeg",
          "mpg",
        ];
        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "bmp",
          "svg",
          "tiff",
          "ico",
          "heic",
          "heif",
        ];

        // Enhanced type detection with fallback
        let detectedType = "unknown";
        let isVideo = false;
        let isImage = false;

        // Primary check by file extension
        if (fileExtension) {
          isVideo = videoExtensions.includes(fileExtension);
          isImage = imageExtensions.includes(fileExtension);

          if (isVideo) detectedType = "video";
          else if (isImage) detectedType = "image";
        }

        // [KRONOP-DEBUG] Enhanced type detection logging
        console.log(`[KRONOP-DEBUG] 🎯 ROBUST Type Detection for: ${fileName}`);
        console.log(`[KRONOP-DEBUG]   - File extension: "${fileExtension}"`);
        console.log(`[KRONOP-DEBUG]   - Is video: ${isVideo}`);
        console.log(`[KRONOP-DEBUG]   - Is image: ${isImage}`);
        console.log(`[KRONOP-DEBUG]   - Detected type: ${detectedType}`);

        if (detectedType === "unknown") {
          console.log(
            `[KRONOP-DEBUG] ❌ Skipped unsupported file: ${fileName} (extension: ${fileExtension})`,
          );
          console.log(
            `[KRONOP-DEBUG] 💡 Supported video formats: ${videoExtensions.join(", ")}`,
          );
          console.log(
            `[KRONOP-DEBUG] 💡 Supported image formats: ${imageExtensions.join(", ")}`,
          );
          skippedFiles++;
          return null;
        }

        // Create unique ID using combination of ETag, index, and key hash
        const eTag = item.ETag?.replace(/"/g, "") || "";
        const keyHash = key
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const uniqueId = eTag
          ? `${eTag}-${index}`
          : `story-${keyHash}-${index}`;

        // Generate proper URLs - Use signed URLs for private bucket access
        const signedUrl = await this.getSignedUrl(key);
        const fallbackUrl = this.getPublicUrl(key, detectedType);
        const thumbnailUrl = isVideo
          ? await this.generateThumbnailUrl(key)
          : signedUrl;

        // URL assignment logic - NO UNDEFINED VALUES
        let imageUrl = undefined;
        let videoUrl = undefined;

        if (isImage) {
          imageUrl = signedUrl;
        } else if (isVideo) {
          videoUrl = signedUrl;
        }

        const storyData = {
          id: uniqueId,
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
          story_type: detectedType, // Always set
          type: detectedType, // Always set - both for compatibility
          url: signedUrl, // ALWAYS set - main URL
          fallbackUrl: fallbackUrl, // Fallback URL when public access fails
          imageUrl: imageUrl, // Set only for images
          videoUrl: videoUrl, // Set only for videos
          thumbnailUrl: thumbnailUrl, // Always set
          duration: isVideo ? 0 : undefined,
          created_at: item.LastModified || new Date(),
          size: item.Size || 0,
          fileName: fileName,
          bucketPath: key,
        };

        validStories++;
        console.log(
          `[KRONOP-DEBUG] ✅ ROBUST Story data created for: ${fileName}`,
        );
        console.log(`[KRONOP-DEBUG]   - ID: ${uniqueId}`);
        console.log(`[KRONOP-DEBUG]   - Type: ${storyData.type}`);
        console.log(`[KRONOP-DEBUG]   - Story Type: ${storyData.story_type}`);
        console.log(
          `[KRONOP-DEBUG]   - Main URL (NEVER UNDEFINED): ${storyData.url}`,
        );
        console.log(
          `[KRONOP-DEBUG]   - Fallback URL: ${storyData.fallbackUrl}`,
        );
        console.log(
          `[KRONOP-DEBUG]   - Image URL: ${storyData.imageUrl || "undefined (expected for video)"}`,
        );
        console.log(
          `[KRONOP-DEBUG]   - Video URL: ${storyData.videoUrl || "undefined (expected for image)"}`,
        );
        console.log(
          `[KRONOP-DEBUG]   - Thumbnail URL: ${storyData.thumbnailUrl}`,
        );
        console.log(
          `[KRONOP-DEBUG]   - File size: ${(item.Size || 0) / 1024} KB`,
        );

        // Validation check - ensure no undefined critical fields
        if (!storyData.url) {
          console.error(
            `[KRONOP-DEBUG] ❌ CRITICAL ERROR: Main URL is undefined for ${fileName}`,
          );
          return null;
        }

        if (!storyData.type || storyData.type === "unknown") {
          console.error(
            `[KRONOP-DEBUG] ❌ CRITICAL ERROR: Type is undefined/unknown for ${fileName}`,
          );
          return null;
        }

        console.log(`[KRONOP-DEBUG] ✅ Validation passed for ${fileName}`);

        return storyData;
      });

      // Await all promises and filter out nulls
      const storyFiles = (await Promise.all(storyPromises)).filter(
        (story) => story !== null,
      );

      console.log(`[KRONOP-DEBUG] 📊 Processing Summary:`);
      console.log(
        `[KRONOP-DEBUG]   - Total objects found: ${response.Contents.length}`,
      );
      console.log(`[KRONOP-DEBUG]   - Valid story files: ${validStories}`);
      console.log(`[KRONOP-DEBUG]   - Skipped files: ${skippedFiles}`);
      console.log(
        `[KRONOP-DEBUG]   - Success rate: ${((validStories / response.Contents.length) * 100).toFixed(1)}%`,
      );

      return storyFiles;
    } catch (error) {
      console.error(
        "[KRONOP-DEBUG] ❌ Error fetching stories from R2:",
        error.message,
      );
      console.error("[KRONOP-DEBUG] 🔍 Full error details:", error);
      throw new Error(`Failed to fetch stories: ${error.message}`);
    }
  }

  /**
   * Get public URL for R2 object
   */
  getPublicUrl(key) {
    // Public URL format for R2 bucket - HARDCODED FIX
    // Using the correct public URL directly to avoid any old ID references
    const publicUrl = `${R2_CONFIG.publicUrl}/${key}`;

    console.log(`[KRONOP-DEBUG] 📎 Generated public URL: ${publicUrl}`);

    return publicUrl;
  }

  /**
   * Get signed URL for R2 object (for private access)
   */
  async getSignedUrl(key, expiresIn = 3600) {
    // Return public URL if client is not initialized
    if (!this.client) {
      console.warn("[KRONOP-DEBUG] ⚠️ R2 client not initialized - using public URL");
      return this.getPublicUrl(key);
    }

    // Generate signed URL for private bucket access
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    
    // Fix: Replace bucket.subdomain with account.subdomain for R2
    const fixedUrl = url.replace(
      new RegExp(`^https://${this.bucketName}\\.`),
      `https://${R2_CONFIG.accountId}.`
    );
    
    return fixedUrl;
  }

  /*if (!this.client) {
      console.warn("[KRONOP-DEBUG] ⚠️ R2 client not initialized - using public URL for thumbnail");
      return this.getPublicUrl(videoKey);
    }
    *
   * Generate thumbnail URL for videos (placeholder logic)
   */
  async generateThumbnailUrl(videoKey) {
    // For videos, we might need a separate thumbnail service
    // For now, return the video URL as thumbnail (will show video frame)
    const thumbnailUrl = await this.getSignedUrl(videoKey);
    console.log(
      `[KRONOP-DEBUG] 🖼️ Generated thumbnail URL for video: ${thumbnailUrl}`,
    );
    return thumbnailUrl;
  }

  /**
   * Fetch stories by type (video or image)
   */
  async fetchStoriesByType(type) {
    console.log(`[KRONOP-DEBUG] 🎯 Fetching stories by type: ${type}`);
    const allStories = await this.fetchStories();
    const filteredStories = allStories.filter(
      (story) => story.story_type === type,
    );
    console.log(
      `[KRONOP-DEBUG] 📊 Found ${filteredStories.length} stories of type: ${type}`,
    );
    return filteredStories;
  }

  /**
   * Search stories by filename
   */
  async searchStories(query) {
    console.log(`[KRONOP-DEBUG] 🔍 Searching stories with query: "${query}"`);
    const allStories = await this.fetchStories();
    const searchQuery = query.toLowerCase();

    const filteredStories = allStories.filter(
      (story) =>
        story.title.toLowerCase().includes(searchQuery) ||
        story.fileName.toLowerCase().includes(searchQuery),
    );

    console.log(
      `[KRONOP-DEBUG] 📊 Search results: ${filteredStories.length} stories found`,
    );
    return filteredStories;
  }

  /**
   * Get story by ID
   */
  async getStoryById(id) {
    console.log(`[KRONOP-DEBUG] 🎯 Fetching story by ID: ${id}`);
    const stories = await this.fetchStories();
    const foundStory = stories.find((story) => story.id === id) || null;

    if (foundStory) {
      console.log(`[KRONOP-DEBUG] ✅ Story found: ${foundStory.title}`);
    } else {
      console.log(`[KRONOP-DEBUG] ❌ Story not found with ID: ${id}`);
    }

    return foundStory;
  }

  /**
   * Get recent stories (last 24 hours)
   */
  async getRecentStories(hours = 24) {
    console.log(
      `[KRONOP-DEBUG] ⏰ Fetching recent stories from last ${hours} hours`,
    );
    const allStories = await this.fetchStories();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentStories = allStories.filter(
      (story) => new Date(story.created_at) > cutoffTime,
    );

    console.log(
      `[KRONOP-DEBUG] 📊 Found ${recentStories.length} recent stories out of ${allStories.length} total`,
    );
    return recentStories;
  }
}

// [KRONOP-DEBUG] Create and export singleton instance
console.log("[KRONOP-DEBUG] 🏭 Creating R2 Story Service singleton...");
const r2StoryService = new R2StoryService();
console.log("[KRONOP-DEBUG] ✅ R2 Story Service ready for use");

module.exports = r2StoryService;
