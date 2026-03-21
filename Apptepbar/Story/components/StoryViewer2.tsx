import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const storyViewerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  progressContainer: { position: 'absolute', top: 50, left: 10, right: 10, flexDirection: 'row', gap: 4, zIndex: 10 },
  progressBarContainer: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1 },
  progressBar: { height: 2, backgroundColor: '#fff', borderRadius: 1 },
  storyMedia: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  header: { position: 'absolute', top: 60, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, zIndex: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userAvatar: { width: 35, height: 35, borderRadius: 17, borderWidth: 2, borderColor: '#fff' },
  userName: { color: '#fff', fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.bold, marginLeft: 10 },
  supportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B00FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, gap: 4, marginLeft: 8 },
  supportedButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: '#8B00FF' },
  supportButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  supportedButtonText: { color: '#8B00FF' },
  closeButton: { padding: 5 },
  closeButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: 15 },
  messageInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10 },
  messageInput: { flex: 1, color: '#fff', fontSize: 14 },
  sendButton: { marginLeft: 10, padding: 5 },
  viewCounterButton: { position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  errorPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  errorText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  errorSubtext: { color: '#666', fontSize: 14, marginTop: 5 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B00FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 20, gap: 8 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
