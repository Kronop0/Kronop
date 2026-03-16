import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CameraComponent from './CameraComponent';
import UserAccount from './UserAccount';
import SorryButton from './SorryButton';
import r2Server from './r2Server';

const { width, height } = Dimensions.get('window');

interface BroadcasterViewUIProps {
  facing: any;
  isLive: boolean;
  isMicOn: boolean;
  timer: number;
  viewerCount: number;
  comments: Array<{ id: string; message: string }>;
  flatListRef: any;
  formatTime: (seconds: number) => string;
  toggleCameraFacing: () => void;
  toggleMic: () => void;
  handleEndStream: () => void;
  renderComment: (props: any) => React.ReactElement;
  streamId?: string | null;
  onSegmentUpload?: (segmentData: any) => Promise<void>;
  segmentIndex: number;
}

export default function BroadcasterViewUI({
  facing,
  isLive,
  isMicOn,
  timer,
  viewerCount,
  comments,
  flatListRef,
  formatTime,
  toggleCameraFacing,
  toggleMic,
  handleEndStream,
  renderComment,
  streamId,
  onSegmentUpload,
  segmentIndex
}: BroadcasterViewUIProps) {
  return (
    <CameraComponent
      facing={facing}
      isLive={isLive}
      isMicOn={isMicOn}
      onToggleCamera={toggleCameraFacing}
      onToggleMic={toggleMic}
      onEndStream={handleEndStream}
      streamId={streamId}
      onSegmentUpload={async (segmentData: any) => {
        if (streamId && segmentData) {
          try {
            // Upload REAL video segment to R2
            await r2Server.uploadSegment(streamId, segmentData, segmentIndex);
            console.log(`📹 REAL video segment uploaded to R2: ${segmentData.length} bytes`);
          } catch (error) {
            console.error('Failed to upload REAL segment:', error);
          }
        }
      }}
    >
      {/* SORRY Button - Right side top */}
      {isLive && (
        <SorryButton 
          streamId={streamId} 
          onStreamEnd={handleEndStream} 
        />
      )}

      {/* User Account Component - LIVE indicator with viewer count */}
      <UserAccount 
        viewerCount={viewerCount} 
        liveDuration={timer} 
      />

      {/* COMMENTS - left side me, bilkul simple */}
      <View style={styles.commentsArea}>
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </CameraComponent>
  );
}

const styles = StyleSheet.create({
  // COMMENTS area - left side
  commentsArea: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 80,
    maxHeight: 300,
    zIndex: 5,
  },
  commentsList: {
    flex: 1,
  },
});
