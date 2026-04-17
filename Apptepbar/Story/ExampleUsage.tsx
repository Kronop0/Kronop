// Example Usage of Story Section with R2 Integration
// This file shows how to properly use StorySection with R2 service

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StorySection } from './components/StoryComponents/StorySection';
import { StoryViewer } from './components/StoryViewer/StoryViewer';
import storyDataService from './services/storyDataService';

// [KRONOP-DEBUG] Example Story Screen component
console.log('[KRONOP-DEBUG] 📱 Example Story Screen component loading...');

interface GroupedStory {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Array<{
    id: string;
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    type: 'image' | 'video';
    story_type: 'image' | 'video';
    timestamp: Date;
    url?: string;
  }>;
  latestTimestamp: string;
}

export default function ExampleStoryScreen() {
  const [stories, setStories] = useState<GroupedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<GroupedStory | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  // [KRONOP-DEBUG] Component state initialization
  console.log('[KRONOP-DEBUG] 🔄 Example Story Screen state initialized');

  useEffect(() => {
    console.log('[KRONOP-DEBUG] 🚀 useEffect triggered - loading stories...');
    loadStories();
  }, []);

  const loadStories = async () => {
    console.log('[KRONOP-DEBUG] 📥 loadStories function called');
    
    try {
      setLoading(true);
      
      // Fetch stories using our data service
      const fetchedStories = await storyDataService.fetchStoriesForSection();
      
      console.log(`[KRONOP-DEBUG] 📊 Received ${fetchedStories.length} story groups`);
      
      // Log each story group details
      fetchedStories.forEach((group, index) => {
        console.log(`[KRONOP-DEBUG] 📂 Story Group ${index + 1}:`);
        console.log(`[KRONOP-DEBUG]   - User: ${group.userName}`);
        console.log(`[KRONOP-DEBUG]   - Stories: ${group.stories.length}`);
        
        group.stories.forEach((story, storyIndex) => {
          console.log(`[KRONOP-DEBUG]     Story ${storyIndex + 1}:`);
          console.log(`[KRONOP-DEBUG]       - ID: ${story.id}`);
          console.log(`[KRONOP-DEBUG]       - Type: ${story.type}`);
          console.log(`[KRONOP-DEBUG]       - Image URL: ${story.imageUrl}`);
          console.log(`[KRONOP-DEBUG]       - Video URL: ${story.videoUrl}`);
          console.log(`[KRONOP-DEBUG]       - Thumbnail URL: ${story.thumbnailUrl}`);
          console.log(`[KRONOP-DEBUG]       - Main URL: ${story.url}`);
        });
      });
      
      setStories(fetchedStories);
      
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error loading stories:', error);
    } finally {
      setLoading(false);
      console.log('[KRONOP-DEBUG] ✅ loadStories completed');
    }
  };

  // Transform grouped stories into individual StoryItem[] for StorySection
  const flattenedStories = React.useMemo(() => {
    return stories.flatMap(group => 
      group.stories.map(story => ({
        id: story.id,
        userId: group.userId,
        userName: group.userName,
        userAvatar: group.userAvatar,
        imageUrl: story.imageUrl,
        videoUrl: story.videoUrl,
        thumbnailUrl: story.thumbnailUrl,
        duration: story.duration,
        type: story.type,
        story_type: story.story_type,
        timestamp: story.timestamp,
        url: story.url,
      }))
    );
  }, [stories]);

  const handleStoryPress = (story: any) => {
    console.log('[KRONOP-DEBUG] 👆 Story pressed:', story);
    // Find the original group for the viewer
    const group = stories.find(g => g.userId === story.userId);
    if (group) {
      setSelectedStoryGroup(group);
      setViewerVisible(true);
    }
  };

  const handleCloseViewer = () => {
    console.log('[KRONOP-DEBUG] 🚪 handleCloseViewer called');
    setViewerVisible(false);
    setSelectedStoryGroup(null);
  };

  // Convert story group to individual stories array for viewer
  const getStoriesForViewer = () => {
    if (!selectedStoryGroup) return [];
    
    console.log('[KRONOP-DEBUG] 🔄 Converting story group for viewer');
    return selectedStoryGroup.stories.map(story => ({
      id: story.id,
      userId: selectedStoryGroup.userId,
      userName: selectedStoryGroup.userName,
      userAvatar: selectedStoryGroup.userAvatar,
      imageUrl: story.imageUrl,
      videoUrl: story.videoUrl,
      story_type: story.story_type
    }));
  };

  if (loading) {
    console.log('[KRONOP-DEBUG] ⏳ Showing loading state');
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B00FF" />
          <Text style={styles.loadingText}>Loading stories from R2...</Text>
        </View>
      </View>
    );
  }

  console.log('[KRONOP-DEBUG] 📱 Rendering Example Story Screen');
  console.log(`[KRONOP-DEBUG]   - Stories count: ${stories.length}`);
  console.log(`[KRONOP-DEBUG]   - Viewer visible: ${viewerVisible}`);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stories from R2</Text>
        <Text style={styles.subtitle}>Real data from Cloudflare R2 bucket</Text>
      </View>

      <StorySection
        stories={flattenedStories}
        loading={loading}
        onStoryPress={handleStoryPress}
      />

      <StoryViewer
        visible={viewerVisible}
        stories={getStoriesForViewer()}
        initialIndex={0}
        onClose={handleCloseViewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});

/*
HOW TO USE THIS EXAMPLE:

1. In your main app screen, import and use ExampleStoryScreen:

import ExampleStoryScreen from './Apptepbar/Story/ExampleUsage';
*/

/*
export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ExampleStoryScreen />
      {/* Your other components *\/}
    </View>
  );
}
*/

/*
2. Or integrate the logic directly into your existing screen:

import { StorySection } from './Apptepbar/Story/components/StorySection';
import { StoryViewer } from './Apptepbar/Story/components/StoryViewer';
import storyDataService from './Apptepbar/Story/services/storyDataService';

// In your component:
const [stories, setStories] = useState([]);

useEffect(() => {
  const loadStories = async () => {
    const fetchedStories = await storyDataService.fetchStoriesForSection();
    setStories(fetchedStories);
  };
  loadStories();
}, []);

// Then use StorySection with the fetched stories
<StorySection
  stories={stories}
  onStoryPress={(group) => {
    // Handle story press
  }}
/>

3. Make sure your .env file has the correct R2 credentials:
EXPO_PUBLIC_R2_ACCOUNT_ID=your-account-id
EXPO_PUBLIC_R2_ACCESS_KEY_ID=your-access-key
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your-secret-key
EXPO_PUBLIC_R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
EXPO_PUBLIC_BUCKET_STORY=kronop-story

4. Upload some images/videos to your R2 bucket with the structure:
stories/photos/image1.jpg
stories/videos/video1.mp4
stories/photos/image2.png
etc.

The logs will show you exactly what's happening at each step!
*/
