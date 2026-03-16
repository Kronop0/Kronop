import React from 'react';
import { useLiveUploadLogic } from './LiveUpload.logic';
import LiveUploadUI from './LiveUpload.ui';

interface LiveUploadProps {
  onClose: () => void;
  onUpload?: (metadata: any) => Promise<void>;
  uploading?: boolean;
  uploadProgress?: number;
  streamStatus?: {
    isLive: boolean;
    viewerCount: number;
    connectionStrength: 'strong' | 'medium' | 'weak' | 'disconnected';
    streamKey: string;
    serverUrl: string;
    startTime?: number;
    duration?: number;
  };
  chatMessages?: Array<{
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: number;
  }>;
  onEndStream?: () => void;
}

export default function LiveUpload({ 
  onClose, 
  onUpload, 
  uploading = false, 
  uploadProgress = 0,
  streamStatus,
  chatMessages = [],
  onEndStream
}: LiveUploadProps) {
  const {
    liveData,
    setLiveData,
    isSetup,
    showBroadcaster,
    categories,
    startLiveStream,
    renderBroadcaster
  } = useLiveUploadLogic({ onClose });

  // Show broadcaster if live
  if (showBroadcaster) {
    return renderBroadcaster();
  }

  // Show setup UI
  if (isSetup) {
    return (
      <LiveUploadUI
        liveData={liveData}
        setLiveData={setLiveData}
        categories={categories}
        startLiveStream={startLiveStream}
      />
    );
  }

  return null;
}
