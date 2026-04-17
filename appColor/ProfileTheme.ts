// Profile Theme - All colors and styles for Profile Screen
// Extracted from profile.tsx to keep the component lightweight

export const ProfileColors = {
  // Background Colors
  background: {
    primary: '#000000',
    secondary: '#1A1A1A',
    elevated: '#2A2A2A',
  },

  // Border Colors
  border: {
    primary: '#1A1A1A',
    secondary: '#2A2A2A',
    accent: '#8B00FF',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    tertiary: '#999999',
    muted: '#666666',
  },

  // Accent Colors
  accent: {
    primary: '#8B00FF',
    gold: '#FFD700',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Profile Styles Object
export const ProfileStyles = {
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: ProfileColors.background.primary,
  },

  loadingContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Header Styles
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
  },

  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },

  username: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: ProfileColors.text.primary,
  },

  verifiedIcon: {
    marginLeft: 4,
  },

  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },

  iconButton: {
    padding: 4,
  },

  // Scroll View Styles
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 90,
  },

  // Cover Photo Styles
  coverPhotoContainer: {
    position: 'relative' as const,
    width: '100%' as const,
    height: 150,
  },

  coverPhoto: {
    width: '100%' as const,
    height: '100%' as const,
    resizeMode: 'cover' as const,
  },

  changeCoverButton: {
    position: 'absolute' as const,
    bottom: 10,
    right: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(139, 0, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  changeCoverText: {
    color: ProfileColors.text.primary,
    fontSize: 12,
    fontWeight: '500' as const,
  },

  // User Info Styles
  userInfoSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
    marginTop: -30,
  },

  userTextContainer: {
    flex: 1,
    marginRight: 16,
  },

  displayName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: ProfileColors.text.primary,
    marginBottom: 4,
  },

  displayNameInput: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: ProfileColors.text.primary,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.accent.primary,
    paddingBottom: 2,
  },

  usernameText: {
    fontSize: 16,
    color: ProfileColors.text.muted,
    marginBottom: 16,
  },

  usernameInput: {
    fontSize: 16,
    color: ProfileColors.text.muted,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.accent.primary,
    paddingBottom: 2,
  },

  bio: {
    fontSize: 14,
    color: ProfileColors.text.secondary,
    lineHeight: 20,
  },

  bioInput: {
    fontSize: 14,
    color: ProfileColors.text.primary,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: ProfileColors.accent.primary,
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top' as const,
    backgroundColor: ProfileColors.background.secondary,
  },

  // Profile Picture Styles
  profilePictureContainer: {
    position: 'relative' as const,
  },

  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: ProfileColors.background.primary,
  },

  changePhotoButton: {
    position: 'absolute' as const,
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ProfileColors.accent.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: ProfileColors.background.primary,
  },

  // Stats Styles
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
  },

  statsText: {
    fontSize: 14,
    color: ProfileColors.text.muted,
  },

  // Button Styles
  buttonsContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
  },

  button: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  editButton: {
    backgroundColor: ProfileColors.background.secondary,
    borderColor: ProfileColors.accent.primary,
  },

  shareButton: {
    backgroundColor: ProfileColors.background.secondary,
    borderColor: ProfileColors.accent.primary,
  },

  saveButton: {
    backgroundColor: ProfileColors.accent.primary,
    borderColor: ProfileColors.accent.primary,
  },

  saveButtonText: {
    color: ProfileColors.text.primary,
  },

  cancelButton: {
    backgroundColor: ProfileColors.background.secondary,
    borderColor: ProfileColors.accent.primary,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: ProfileColors.text.primary,
  },

  yourRankButton: {
    height: 34,
    backgroundColor: ProfileColors.background.secondary,
    borderWidth: 1,
    borderColor: ProfileColors.accent.primary,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    marginHorizontal: 16,
  },

  yourRankButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: ProfileColors.text.primary,
  },

  // Tab Styles
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
  },

  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative' as const,
  },

  activeTab: {
    // Active tab styling handled by indicator
  },

  tabText: {
    fontSize: 16,
    color: ProfileColors.text.muted,
    fontWeight: '500' as const,
  },

  activeTabText: {
    color: ProfileColors.text.primary,
    fontWeight: '600' as const,
  },

  tabIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: ProfileColors.accent.primary,
  },

  // Content Styles
  contentContainer: {
    paddingVertical: 40,
    alignItems: 'center' as const,
  },

  emptyText: {
    fontSize: 16,
    color: ProfileColors.text.muted,
  },

  // Upload Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: ProfileColors.overlay,
    justifyContent: 'flex-end' as const,
  },

  bottomSheet: {
    backgroundColor: ProfileColors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginBottom: 16,
  },

  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: ProfileColors.text.primary,
    marginBottom: 20,
    textAlign: 'center' as const,
  },

  uploadOptions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: 16,
    paddingBottom: 20,
  },

  uploadOption: {
    width: '30%' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    backgroundColor: ProfileColors.background.elevated,
    borderRadius: 12,
  },

  uploadOptionText: {
    fontSize: 12,
    color: ProfileColors.text.primary,
    marginTop: 8,
  },

  // Full Screen Modal Styles
  fullScreenUploadContainer: {
    flex: 1,
    backgroundColor: ProfileColors.background.primary,
  },

  uploadModalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
  },

  closeButton: {
    padding: 8,
  },

  placeholder: {
    width: 44,
  },

  uploadScreenContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Database Screen Styles
  dbPlaceholder: {
    width: 36,
  },

  fullScreenDbContainer: {
    flex: 1,
    backgroundColor: ProfileColors.background.primary,
  },

  fullScreenDbContentNoTop: {
    flex: 1,
    marginTop: -30,
  },

  dbContainer: {
    flex: 1,
    backgroundColor: ProfileColors.background.primary,
  },

  dbScrollContent: {
    paddingBottom: 90,
  },

  dbLoading: {
    marginTop: 20,
  },

  // Rank Card Styles
  rankCard: {
    backgroundColor: ProfileColors.background.secondary,
    margin: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ProfileColors.accent.primary,
  },

  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.secondary,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: ProfileColors.accent.primary,
    marginLeft: 8,
  },

  rankContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  rankBadge: {
    alignItems: 'center' as const,
    marginRight: 20,
  },

  rankText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: ProfileColors.accent.gold,
    marginTop: 4,
  },

  rankStats: {
    flex: 1,
  },

  rankStatItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },

  rankStatLabel: {
    fontSize: 14,
    color: ProfileColors.text.tertiary,
  },

  rankStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: ProfileColors.text.primary,
  },

  // Earning Button Styles
  earningButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: ProfileColors.background.secondary,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ProfileColors.accent.primary,
  },

  earningButtonText: {
    color: ProfileColors.accent.primary,
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
    marginLeft: 10,
  },

  // Database List Styles
  databaseContainer: {
    margin: 12,
  },

  databaseHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  databaseTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: ProfileColors.accent.primary,
    marginLeft: 6,
  },

  databaseCard: {
    backgroundColor: ProfileColors.background.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ProfileColors.border.secondary,
    marginBottom: 8,
  },

  databaseRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 14,
  },

  databaseLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },

  databaseInfo: {
    marginLeft: 12,
  },

  databaseName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: ProfileColors.text.primary,
    marginBottom: 2,
  },

  databaseCount: {
    fontSize: 12,
    color: ProfileColors.text.tertiary,
  },

  databaseStats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  statBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: ProfileColors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },

  statBadgeText: {
    fontSize: 12,
    color: ProfileColors.text.primary,
    marginLeft: 4,
  },

  // Wallet & Bank Button Styles
  walletButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: ProfileColors.background.secondary,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ProfileColors.accent.primary,
  },

  walletButtonText: {
    color: ProfileColors.accent.primary,
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
    marginLeft: 10,
  },

  bankButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: ProfileColors.background.secondary,
    margin: 12,
    marginTop: 0,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ProfileColors.accent.primary,
  },

  bankButtonText: {
    color: ProfileColors.accent.primary,
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
    marginLeft: 10,
  },

  // Wallet Modal Styles
  walletModalContainer: {
    flex: 1,
    backgroundColor: ProfileColors.background.primary,
  },

  walletModalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ProfileColors.border.primary,
  },

  walletModalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: ProfileColors.text.primary,
  },
};
