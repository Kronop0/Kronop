// Powered by OnSpace.AI
// Styles for live screen
import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

export const liveStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF3B3Bcc',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveLabel: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  liveStats: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00000066',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  viewerChip: { backgroundColor: '#FF3B3B55' },
  statText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },
  endLiveTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.liveRed + 'DD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  endLiveTopBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  // Right-side vertical controls (Effects, Flip, Mic)
  rightControls: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 0,
    alignItems: 'center',
    gap: Spacing.md + 4,
  },
  // Start Live button — bottom center
  startLiveBar: {
    position: 'absolute',
    left: 0,
    right: Spacing.md + 52 + Spacing.md,  // leave space for right controls
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtn: { alignItems: 'center', gap: 4, width: 52, minHeight: 44 },
  controlLabel: { fontSize: FontSize.xs, color: '#ffffffBB', fontWeight: '500' },
  flipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 52,
    minHeight: 44,
  },
  goLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.liveRed,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.full,
    shadowColor: Colors.liveRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  goLiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  goLiveBtnText: { fontSize: FontSize.lg, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
