// Powered by OnSpace.AI
import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = Math.min(width * 0.78, 300);

export const endLiveModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1A22',
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#2A2A35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FF3B3B18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B3B30',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF3B3B15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FF3B3B35',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.liveRed,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.liveRed,
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  subText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  btnCol: {
    gap: Spacing.xs + 2,
    marginTop: Spacing.sm,
  },
  endBtn: {
    backgroundColor: Colors.liveRed,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  endBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  keepBtn: {
    backgroundColor: 'transparent',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  keepBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
