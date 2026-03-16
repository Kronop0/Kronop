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
        keyExtractor={(item) => item.id}
        pagingEnabled={true}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
        removeClippedSubviews={true}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          const index = Math.round(y / screenHeight);
          console.log(`📱 Scrolled to index: ${index}, y: ${y}`);
        }}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default VideoContainer;
