// ThreeDotMenu Component - Reusable menu for content items
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

interface ThreeDotMenuProps {
  itemId: string;
  itemKey: string;
  type: 'photo' | 'video' | 'story' | 'live' | 'reels' | 'song' | 'notes';
  onDeleteSuccess?: () => void;
  isPrivate?: boolean;
  onPrivacyChange?: (isPrivate: boolean) => void;
}

// R2 Configuration - Direct from env vars
const getR2Config = (type: string) => {
  const configs: Record<string, { bucket: string; accountId: string }> = {
    photo: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_PHOTO || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
    video: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_VIDEO || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
    story: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_STORY || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
    live: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_LIVE || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
    reels: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_REELS || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
    song: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_SONG || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
    notes: {
      bucket: process.env.EXPO_PUBLIC_BUCKET_NOTES || '',
      accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    },
  };
  return configs[type] || configs.photo;
};

export function ThreeDotMenu({
  itemId,
  itemKey,
  type,
  onDeleteSuccess,
  isPrivate = false,
  onPrivacyChange,
}: ThreeDotMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!itemKey) {
              Alert.alert('Error', 'Cannot delete: Item key is missing.');
              return;
            }

            const accessKeyId = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '';
            const secretAccessKey = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '';
            
            if (!accessKeyId || !secretAccessKey) {
              Alert.alert('Error', 'R2 credentials not configured in .env file');
              return;
            }

            const config = getR2Config(type);
            
            if (!config.bucket) {
              Alert.alert('Error', `Bucket not configured for type: ${type}`);
              return;
            }

            try {
              setLoading(true);
              setMenuVisible(false);

              console.log(`[ThreeDotMenu] Direct delete from R2:`);
              console.log(`  - Type: ${type}`);
              console.log(`  - Bucket: ${config.bucket}`);
              console.log(`  - Key: ${itemKey}`);
              console.log(`  - Account ID: ${config.accountId || 'Not set'}`);

              // Create S3 client for R2
              const s3Client = new S3Client({
                region: 'auto',
                endpoint: config.accountId 
                  ? `https://${config.accountId}.r2.cloudflarestorage.com`
                  : 'https://r2.cloudflarestorage.com',
                credentials: {
                  accessKeyId,
                  secretAccessKey,
                },
                forcePathStyle: true,
              });

              const command = new DeleteObjectCommand({
                Bucket: config.bucket,
                Key: itemKey,
              });

              await s3Client.send(command);
              console.log(`[ThreeDotMenu] ✅ Deleted successfully: ${itemKey}`);

              Alert.alert('Deleted', 'Item deleted from cloud successfully');
              onDeleteSuccess?.();
            } catch (error: any) {
              console.error('[ThreeDotMenu] ❌ Delete error:', error);
              const errorMessage = error?.message || error?.toString() || 'Unknown error';
              Alert.alert(
                'Delete Failed', 
                `Failed to delete: ${errorMessage}\n\nPlease check:\n1. Server is running\n2. .env has correct R2 credentials\n3. Internet connection`
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePrivacyToggle = () => {
    const newPrivacy = !isPrivate;
    onPrivacyChange?.(newPrivacy);
    setMenuVisible(false);
    Alert.alert('Success', `Item is now ${newPrivacy ? 'Private' : 'Public'}`);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.threeDotButton}
        onPress={() => setMenuVisible(true)}
      >
        <MaterialIcons name="more-vert" size={24} color="#666" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Deleting...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handlePrivacyToggle}
                >
                  <MaterialIcons
                    name={isPrivate ? 'lock' : 'lock-open'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.menuText}>
                    {isPrivate ? 'Make Public' : 'Make Private'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={[styles.menuItem, styles.deleteItem]}
                  onPress={handleDelete}
                >
                  <MaterialIcons name="delete" size={20} color="#ff4444" />
                  <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  threeDotButton: {
    padding: 8,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    minWidth: 150,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  deleteItem: {
    // No special styling needed
  },
  deleteText: {
    color: '#ff4444',
  },
  loadingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
});

export default ThreeDotMenu;
