// Powered by OnSpace.AI
// Styles for setup / index screen
import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

export const indexStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBack: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.3 },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryDim, paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '44', gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.liveRed },
  liveText: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  titleInput: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 2,
    fontSize: FontSize.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border, minHeight: 28,
  },
  charCount: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
  // Audience, toggle, category, and invite styles live in their own setup components.
  tipCard: {
    flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#1C1800',
    borderRadius: Radius.md, padding: Spacing.sm + 4,
    borderWidth: 1, borderColor: Colors.gold + '33', alignItems: 'flex-start',
  },
  tipText: { flex: 1, fontSize: FontSize.xs, color: Colors.gold + 'CC', lineHeight: 18 },
  // GoLiveButton styles live in components/setup/GoLiveButton.tsx
});
