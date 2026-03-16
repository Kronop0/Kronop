import React from 'react';
import { useBroadcasterLogic } from './BroadcasterView.logic';
import BroadcasterViewUI from './BroadcasterView.ui';
import r2Server from './r2Server';

interface BroadcasterViewProps {
  streamTitle: string;
  streamCategory: string;
  streamAudience: string;
  streamId?: string | null;
  streamData?: any;
  onEndStream: () => void;
}

export default function BroadcasterView({ 
  streamTitle, 
  streamCategory, 
  streamAudience,
  streamId,
  streamData,
  onEndStream 
}: BroadcasterViewProps) {
  const {
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
    renderComment
  } = useBroadcasterLogic({ streamId, onEndStream });

  const handleSegmentUpload = async (segmentData: any) => {
    if (streamId) {
      // This will be handled by the logic hook
      console.log('Segment upload handled by logic hook');
    }
  };

  return (
    <BroadcasterViewUI
      facing={facing}
      isLive={isLive}
      isMicOn={isMicOn}
      timer={timer}
      viewerCount={viewerCount}
      comments={comments}
      flatListRef={flatListRef}
      formatTime={formatTime}
      toggleCameraFacing={toggleCameraFacing}
      toggleMic={toggleMic}
      handleEndStream={handleEndStream}
      renderComment={renderComment}
      streamId={streamId}
      onSegmentUpload={handleSegmentUpload}
      segmentIndex={0}
    />
  );
}