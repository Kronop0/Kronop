import { VideoQualitySelector, FullscreenVideoPlayer, CommentsModal, ReportModal } from '@/Apptepbar/Video/components';

interface VideoModalsProps {
  showQualitySelector: boolean;
  showFullscreen: boolean;
  showComments: boolean;
  showReport: boolean;
  videoQuality: '360p' | '480p' | '720p' | '1080p' | 'Auto';
  player: any;
  videoTitle: string;
  commentCount: number;
  onCloseQualitySelector: () => void;
  onQualityChange: (quality: '360p' | '480p' | '720p' | '1080p' | 'Auto') => void;
  onCloseFullscreen: () => void;
  onCloseComments: () => void;
  onCloseReport: () => void;
}

export function VideoModals({ 
  showQualitySelector, 
  showFullscreen, 
  showComments, 
  showReport, 
  videoQuality, 
  player, 
  videoTitle, 
  commentCount,
  onCloseQualitySelector,
  onQualityChange,
  onCloseFullscreen,
  onCloseComments,
  onCloseReport
}: VideoModalsProps) {
  return (
    <>
      <VideoQualitySelector 
        visible={showQualitySelector}
        onClose={onCloseQualitySelector}
        currentQuality={videoQuality}
        onQualityChange={onQualityChange}
      />
      
      <FullscreenVideoPlayer
        visible={showFullscreen}
        onClose={onCloseFullscreen}
        player={player}
      />
      
      <CommentsModal
        visible={showComments}
        onClose={onCloseComments}
        videoTitle={videoTitle}
        commentCount={commentCount}
      />
      
      <ReportModal
        visible={showReport}
        onClose={onCloseReport}
        videoTitle={videoTitle}
      />
    </>
  );
}
