import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useVideos } from '../hooks/useVideos';
import { Comment } from '../types';
import { spacing, typography } from '../constants/theme';
import { CommentSection } from '../components/video-controller/CommentSection';
import { CommentInput } from '../components/video-controller/CommentInput';
import { VideoActions } from '../components/video-controller/VideoActions';
import { ChannelInfo } from '../components/video-controller/ChannelInfo';
import { FullscreenVideo } from '../components/video-controller/FullscreenVideo';
import { KronopVideoPlayer } from '../components/video-controller/KronopVideoPlayer';

const { width } = Dimensions.get('window');
const PURPLE = '#8B00FF';

const formatNumber = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : `${n}`;
const formatTime = (t: number) => { const d = Date.now()-t, h = Math.floor(d/3600000); return h<1?`${Math.floor(d/60000)}m ago`:h<24?`${h}h ago`:`${Math.floor(h/24)}d ago`; };
const getAvatarColor = (id: string) => `hsl(${(id.charCodeAt(0)*137)%360},70%,60%)`;

const INIT_COMMENTS: Comment[] = [
  { id:'1', videoId:'', userId:'u1', username:'TechGuru', userAvatar:'', text:'Amazing video! Very helpful content', likes:234, replies:12, timestamp:Date.now()-3600000, isLiked:false },
  { id:'2', videoId:'', userId:'u2', username:'ContentCreator', userAvatar:'', text:'Please make more videos like this!', likes:89, replies:5, timestamp:Date.now()-7200000, isLiked:false },
];

export default function VideoPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const { videos, toggleLike } = useVideos();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupporting, setIsSupporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments] = useState<Comment[]>(INIT_COMMENTS);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const video = videos.find(v => v.id === videoId);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  React.useEffect(() => { if (video) setIsSaved(video.isSaved || false); }, [video]);

  if (!video) return (
    <View style={[styles.container, { alignItems:'center', justifyContent:'center' }]}>
      <Ionicons name="videocam-off" size={64} color="#444" />
      <Text style={{ color:'#888', marginTop:spacing.md }}>Video not found</Text>
      <TouchableOpacity style={{ marginTop:spacing.lg, backgroundColor:PURPLE, paddingHorizontal:spacing.lg, paddingVertical:spacing.sm, borderRadius:20 }} onPress={() => router.back()}>
        <Text style={{ color:'white', fontWeight:'700' }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  const handleCommentLike = (id: string) => setComments(cs => cs.map(c => c.id===id ? {...c, isLiked:!c.isLiked, likes:c.isLiked?c.likes-1:c.likes+1} : c));
  const handleReply = (id: string, username: string) => { setReplyingTo(id); setCommentText(`@${username} `); };
  const handleSubmit = () => { if (commentText.trim()) { setComments([{ id:Date.now().toString(), videoId:videoId, userId:'me', username:'You', userAvatar:'', text:commentText, likes:0, replies:0, timestamp:Date.now(), isLiked:false }, ...comments]); setCommentText(''); setReplyingTo(null); }};

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS==='ios'?'padding':'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      enabled={true}
    >
      {/* Fullscreen overlay modal - no screen rotation */}
      <FullscreenVideo
        visible={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        thumbnailUrl={video.thumbnailUrl}
        title={video.title}
        duration={video.duration}
      />

      <View style={[styles.header, { paddingTop: insets.top+spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{video.title}</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Real Video Player */}
        <View style={styles.videoWrap}>
          {video.videoUrl ? (
            <View style={styles.videoPlayerContainer}>
              <KronopVideoPlayer
                videoUrl={video.videoUrl}
                thumbnailUrl={video.thumbnailUrl}
                title={video.title}
                autoplay={false}
                onError={(error) => setVideoError(error)}
                onLoad={(duration) => {
                  setIsVideoLoaded(true);
                  console.log('Video loaded, duration:', duration);
                }}
                onProgress={({ currentTime, duration }) => {
                  // Track progress for analytics/resume
                  // console.log('Progress:', currentTime, '/', duration);
                }}
                onComplete={() => {
                  console.log('Video completed');
                }}
              />
            </View>
          ) : (
            <View style={styles.noVideoContainer}>
              <Ionicons name="videocam-off" size={64} color="#444" />
              <Text style={styles.noVideoText}>No video URL available</Text>
            </View>
          )}
          {videoError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>{videoError}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoWrap}>
          <Text style={styles.statsText}>{formatNumber(video.views)} views • {formatTime(video.timestamp)}</Text>
          {video.description && (
            <View style={{ gap: 4 }}>
              <Text style={styles.descText} numberOfLines={showFullDesc ? undefined : 2}>{video.description}</Text>
              {video.description.length > 100 && (
                <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                  <Text style={styles.moreText}>{showFullDesc ? 'Show less' : 'More'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <VideoActions isLiked={video.isLiked||false} isSaved={isSaved} likes={video.likes} comments={video.comments} onLike={() => toggleLike(video.id)} onSave={() => setIsSaved(!isSaved)} formatNumber={formatNumber} videoTitle={video.title} />
        <ChannelInfo userId={video.userId} username={video.username} isSupporting={isSupporting} onSupport={() => setIsSupporting(!isSupporting)} getAvatarColor={getAvatarColor} onFullscreen={() => setIsFullscreen(true)} />
        <CommentSection comments={comments} showComments={showComments} onToggle={() => setShowComments(!showComments)} onLike={handleCommentLike} onReply={handleReply} formatNumber={formatNumber} formatTime={formatTime} getAvatarColor={getAvatarColor} />
      </ScrollView>
      <CommentInput value={commentText} onChangeText={setCommentText} onSubmit={handleSubmit} replyingTo={replyingTo} onCancelReply={() => { setReplyingTo(null); setCommentText(''); }} bottomPad={insets.bottom+spacing.sm} getAvatarColor={getAvatarColor} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#000000' },
  header: { flexDirection:'row', alignItems:'center', paddingHorizontal:spacing.md, paddingBottom:spacing.sm, gap:spacing.sm, backgroundColor:'#000000' },
  backBtn: { padding:spacing.xs },
  headerTitle: { flex:1, fontSize:typography.body, fontWeight:'600', color:'#FFFFFF' },
  shareBtn: { padding:spacing.xs },
  scroll: { flex:1 },
  videoWrap: { width, aspectRatio:16/9, backgroundColor:'#000000', position:'relative' },
  videoPlayerContainer: { flex:1, width:'100%', height:'100%' },
  noVideoContainer: { flex:1, justifyContent:'center', alignItems:'center' },
  noVideoText: { color:'#888', marginTop:12 },
  errorOverlay: { position:'absolute', bottom:10, left:10, right:10, backgroundColor:'rgba(255,0,0,0.8)', padding:8, borderRadius:4 },
  errorText: { color:'#fff', fontSize:12 },
  infoWrap: { padding:spacing.md, gap:spacing.xs, backgroundColor:'#000000', borderBottomWidth:1, borderBottomColor:'#1A1A1A' },
  statsText: { fontSize:typography.small, color:'#888888' },
  descText: { fontSize:typography.body, lineHeight:26, color:'#CCCCCC' },
  moreText: { fontSize:typography.small, fontWeight:'700', color:PURPLE },
});
