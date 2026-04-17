import React from 'react';
import { View, StyleSheet, Dimensions, FlatList, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface VideoItem {
  id: string;
  uri: string;
  title: string;
  channelName: string;
  channelLogo: string;
}

interface VideoContainerProps {
  videos: VideoItem[];
  renderItem: ({ item, index }: { item: VideoItem; index: number }) => React.ReactElement;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken<VideoItem>[]; changed: ViewToken<VideoItem>[] }) => void;
  viewabilityConfig?: any;
  flatListRef?: React.RefObject<FlatList<VideoItem> | null>;
}

const VideoContainer: React.FC<VideoContainerProps> = ({ videos, renderItem, onViewableItemsChanged, viewabilityConfig, flatListRef }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom + 80, 100); // Reduced to 80px minimum + safe area
  
  console.log('📱 VideoContainer received videos:', videos.length);
  videos.forEach((video: VideoItem, index: number) => {
    console.log(`🎬 Container Video ${index + 1}:`, video.id);
  });
  
  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`} // Unique keys to prevent conflicts
        pagingEnabled={true}
        snapToInterval={screenHeight} // Snap to full screen height
        snapToAlignment="start" // Snap to start of each item
        decelerationRate="fast" // Fast stop for instant snap
        disableIntervalMomentum={true} // Force stop at each reel
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        // BUTTER SMOOTH settings for instant transitions
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          const index = Math.round(y / screenHeight);
          console.log(`📱 Locked scroll to index: ${index}, y: ${y}`);
        }}
        scrollEventThrottle={1}
      />
      {/* JUGAAD - Control suppressor */}
      <View style={styles.controlSuppressor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Remove black background
  },
  // JUGAAD - Hide any native controls that might appear
  controlSuppressor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0,
    zIndex: -1000,
    pointerEvents: 'none' as const,
    display: 'none' as const,
  },
});

export default VideoContainer;
