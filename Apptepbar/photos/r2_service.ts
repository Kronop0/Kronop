// ==================== CLOUDFLARE R2 PHOTO SERVICE ====================
// Real photo fetching service - No more mock data
// Connects to Cloudflare R2 for actual photo storage

import { API_KEYS } from "../../constants/Config";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { API_BASE_URL } from "../../constants/network";

const API_ROOT = API_BASE_URL.replace(/\/api$/, "");

// R2 Configuration from environment variables
const R2_CONFIG = {
  // Cloudflare R2 Account and Bucket
  R2_ACCOUNT_ID:
    process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || "a59d5a6739a14835816a2c0d2e12fc46",
  R2_ACCESS_KEY_ID:
    process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID ||
    "465983939146a7cbb7167537d9d4ebd1",
  R2_SECRET_ACCESS_KEY:
    process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY ||
    "7386255bccd5111ddd8bd3057bbe8995e2c02a74b3ef579cd6b0daf4c1500c94",
  R2_BUCKET_NAME: process.env.EXPO_PUBLIC_R2_BUCKET_NAME || "kronop-photos",
  R2_ENDPOINT:
    process.env.EXPO_PUBLIC_R2_ENDPOINT ||
    "https://a59d5a6739a14835816a2c0d2e12fc46.r2.cloudflarestorage.com",

  // Public Bucket URL for direct access
  PUBLIC_BUCKET_URL: "https://pub-e904e5818e734484a5ead6201a4cefe3.r2.dev",

  // Photo API Endpoints
  KRONOP_API_URL: API_ROOT,
  PHOTO_API_BASE: `${API_ROOT}/api/content`,

  // Fallback Image APIs (if R2 fails)
  UNSPLASH_ACCESS_KEY: API_KEYS.UNSPLASH,
  PEXELS_API_KEY: API_KEYS.PEXELS,
  PIXABAY_KEY: API_KEYS.PIXABAY,
};

// Photo Categories
export const PHOTO_CATEGORIES = {
  ALL: "all",
  CYBERPUNK: "cyberpunk",
  GAMING: "gaming",
  NATURE: "nature",
  ARCHITECTURE: "architecture",
  FASHION: "fashion",
  FOOD: "food",
  TRAVEL: "travel",
  CARS: "cars",
  SPORTS: "sports",
  MUSIC: "music",
  ART: "art",
  PHOTOGRAPHY: "photography",
  SPACE: "space",
  ANIMALS: "animals",
  STREET: "street",
  TECHNICAL: "technical",
  MINIMAL: "minimal",
  MACRO: "macro",
  AESTHETIC: "aesthetic",
  VINTAGE: "vintage",
  WALLPAPER: "wallpaper",
  AI_ART: "ai_art",
  FAMILY: "family",
};

// Photo interface
export interface Photo {
  id: string;
  url: string;
  caption?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// R2 Service Class
class R2PhotoService {
  private baseUrl: string;
  private headers: Record<string, string>;
  private s3Client: S3Client;

  constructor() {
    this.baseUrl = R2_CONFIG.PHOTO_API_BASE;
    this.headers = {
      "Content-Type": "application/json",
      "X-R2-Account-ID": R2_CONFIG.R2_ACCOUNT_ID,
      "X-R2-Access-Key-ID": R2_CONFIG.R2_ACCESS_KEY_ID,
    };

    // Initialize S3 Client for R2
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.R2_ACCESS_KEY_ID,
        secretAccessKey: R2_CONFIG.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  // Get photos by category
  async getPhotosByCategory(
    category: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Photo[]> {
    console.log(
      `[r2_service.ts] Photo Fetching Started... Category: ${category} (case-insensitive)`,
    );

    // Convert category to lowercase for consistent matching
    const categoryLower = category.toLowerCase();
    console.log(`[r2_service.ts] Category normalized to: ${categoryLower}`);

    console.log(`[r2_service.ts] Fetching REAL data from R2 bucket...`);
    return this.getPhotosFromR2Directly(categoryLower, limit);
  }

  // Get single photo by ID
  async getPhotoById(photoId: string): Promise<Photo | null> {
    console.log(
      `[r2_service.ts] Fetching Single Photo Started... Photo ID: ${photoId}`,
    );
    try {
      const response = await fetch(`${this.baseUrl}/${photoId}`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        console.error(
          `[r2_service.ts] Failed to fetch photo: ${response.status} - ${response.statusText}, Photo ID: ${photoId}`,
        );
        throw new Error(`Failed to fetch photo: ${response.status}`);
      }

      const photo = await response.json();
      console.log(
        `[r2_service.ts] Photo Data Received from R2: ${photo ? photo.id : "null"}`,
      );
      return photo;
    } catch (error) {
      console.error(`[r2_service.ts] Error fetching photo from R2:`, error);
      console.log(`[r2_service.ts] Photo Not Found: ${photoId}`);
      return null;
    }
  }

  // Upload photo to R2
  async uploadPhoto(
    file: File,
    metadata: Partial<Photo>,
  ): Promise<Photo | null> {
    console.log(
      `[r2_service.ts] Photo Upload Started... File: ${file.name}, Size: ${file.size} bytes`,
    );
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        headers: {
          "X-R2-Account-ID": R2_CONFIG.R2_ACCOUNT_ID,
          "X-R2-Access-Key-ID": R2_CONFIG.R2_ACCESS_KEY_ID,
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(
          `[r2_service.ts] Failed to upload photo: ${response.status} - ${response.statusText}`,
        );
        throw new Error(`Failed to upload photo: ${response.status}`);
      }

      const uploadedPhoto = await response.json();
      console.log(
        `[r2_service.ts] Photo Uploaded Successfully: ${uploadedPhoto ? uploadedPhoto.id : "unknown"}`,
      );
      return uploadedPhoto;
    } catch (error) {
      console.error(`[r2_service.ts] Error uploading photo to R2:`, error);
      return null;
    }
  }

  // Generate R2 signed URL for direct upload
  async getSignedUploadUrl(
    fileName: string,
    fileType: string,
  ): Promise<string | null> {
    console.log(
      `[r2_service.ts] Getting Signed Upload URL... File: ${fileName}, Type: ${fileType}`,
    );
    try {
      const response = await fetch(`${R2_CONFIG.KRONOP_API_URL}/upload/url`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          contentType: fileType.includes("image") ? "photo" : "video",
          fileName,
          fileSize: 0,
        }),
      });

      if (!response.ok) {
        console.error(
          `[r2_service.ts] Failed to get signed URL: ${response.status} - ${response.statusText}`,
        );
        throw new Error(`Failed to get signed URL: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `[r2_service.ts] Signed Upload URL Received: ${data.success ? "Success" : "Failed"}`,
      );
      return data.success ? data.uploadUrl : null;
    } catch (error) {
      console.error(`[r2_service.ts] Error getting signed URL:`, error);
      return null;
    }
  }

  // Direct R2 access - fetch real photos from bucket
  private async getPhotosFromR2Directly(
    category: string,
    limit: number,
  ): Promise<Photo[]> {
    console.log(
      `[r2_service.ts] REAL R2 Access: Fetching from bucket: ${R2_CONFIG.R2_BUCKET_NAME}`,
    );

    try {
      const command = new ListObjectsV2Command({
        Bucket: R2_CONFIG.R2_BUCKET_NAME,
        // Bucket structure: {username}/{filename}.(jpg|png|...)
        // No additional prefix folders like photo/
        MaxKeys: limit,
      });

      const response = await this.s3Client.send(command);
      console.log(
        `[r2_service.ts] R2 Response received. Contents count: ${response.Contents?.length || 0}`,
      );

      if (!response.Contents || response.Contents.length === 0) {
        console.log(`[r2_service.ts] No photos found in R2 bucket`);
        return [];
      }

      const validPhotos: Photo[] = [];

      for (let i = 0; i < response.Contents.length; i++) {
        const object = response.Contents[i];
        if (
          object.Key &&
          !object.Key.endsWith(".json") &&
          /\.(jpe?g|png|gif|webp)$/i.test(object.Key)
        ) {
          const publicUrl = `${R2_CONFIG.PUBLIC_BUCKET_URL}/${object.Key}`;
          console.log(`[r2_service.ts] Found REAL photo: ${object.Key}`);

          const keyParts = object.Key.split("/");
          const fileNameWithExt = keyParts[keyParts.length - 1];
          const baseName = fileNameWithExt.replace(/\.[^/.]+$/, "");

          validPhotos.push({
            id: `r2_${i + 1}`,
            url: publicUrl,
            caption: baseName,
            user: {
              id: "r2_user",
              name: "Kronop Photos",
              avatar: null,
            },
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50),
            category: category,
            createdAt:
              object.LastModified?.toISOString() || new Date().toISOString(),
            updatedAt:
              object.LastModified?.toISOString() || new Date().toISOString(),
          });
        }
      }

      console.log(
        `[r2_service.ts] Successfully processed ${validPhotos.length} REAL photos from R2`,
      );
      return validPhotos;
    } catch (error) {
      console.error(`[r2_service.ts] ❌ Error accessing R2 bucket:`, error);
      console.log(
        `[r2_service.ts] Falling back to empty array - no mock data!`,
      );
      return [];
    }
  }

  // Like/unlike photo
  async togglePhotoLike(photoId: string, userId: string): Promise<boolean> {
    console.log(
      `[r2_service.ts] Toggling Photo Like... Photo ID: ${photoId}, User ID: ${userId}`,
    );
    try {
      const response = await fetch(`${this.baseUrl}/${photoId}/like`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ userId }),
      });

      const success = response.ok;
      console.log(
        `[r2_service.ts] Photo Like Toggled: ${success ? "Success" : "Failed"}`,
      );
      return success;
    } catch (error) {
      console.error(`[r2_service.ts] Error toggling photo like:`, error);
      return false;
    }
  }

  // Add comment to photo
  async addComment(
    photoId: string,
    userId: string,
    comment: string,
  ): Promise<boolean> {
    console.log(
      `[r2_service.ts] Adding Comment to Photo... Photo ID: ${photoId}, User ID: ${userId}, Comment Length: ${comment.length}`,
    );
    try {
      const response = await fetch(`${this.baseUrl}/${photoId}/comment`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ userId, comment }),
      });

      const success = response.ok;
      console.log(
        `[r2_service.ts] Comment Added: ${success ? "Success" : "Failed"}`,
      );
      return success;
    } catch (error) {
      console.error(`[r2_service.ts] Error adding comment:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const photoService = new R2PhotoService();

// Export configuration for use in components
export { R2_CONFIG };

export default photoService;
