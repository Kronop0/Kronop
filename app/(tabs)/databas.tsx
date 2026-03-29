import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';

import { SafeScreen } from '../../components/layout/SafeScreen';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../appColor/AppColors';
import { useRouter } from 'expo-router';
import WalletConnect from '../../frontend/WalletConnect';

// Import individual tool screens and database utilities
import { 
  PhotoToolScreen,
  VideoToolScreen,
  StoryToolScreen,
  LiveToolScreen,
  ReelsToolScreen,
  SongToolScreen,
  DatabaseAPI, 
  DataProcessor, 
  StatsCalculator,
  type ContentStats 
} from '../../Apptepbar/Databes';

interface TotalData {
  totalContent: number;
  totalStars: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
}

interface SectionData {
  name: string;
  screen: string;
  icon: string;
  stats: ContentStats;
}

export default function DatabaseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Start with false to show buttons immediately
  const [refreshing, setRefreshing] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const [totalData, setTotalData] = useState<TotalData>({
    totalContent: 0,
    totalStars: 0,
    totalComments: 0,
    totalShares: 0,
    totalViews: 0,
  });

  // Initial sections to ensure buttons always show
  const [sections, setSections] = useState<SectionData[]>([
    { name: 'Photo Tool', screen: 'PhotoTool', icon: 'photo', stats: { total: 10, stars: 150, comments: 75, shares: 30, views: 1000 } },
    { name: 'Video Tool', screen: 'VideoTool', icon: 'videocam', stats: { total: 8, stars: 120, comments: 60, shares: 25, views: 800 } },
    { name: 'Story Tool', screen: 'StoryTool', icon: 'auto-stories', stats: { total: 5, stars: 80, comments: 40, shares: 20, views: 500 } },
    { name: 'Live Tool', screen: 'LiveTool', icon: 'live-tv', stats: { total: 3, stars: 60, comments: 30, shares: 15, viewers: 300 } },
    { name: 'Reels Tool', screen: 'ReelsTool', icon: 'movie', stats: { total: 12, stars: 180, comments: 90, shares: 36, views: 1200 } },
    { name: 'Song Tool', screen: 'SongTool', icon: 'music-note', stats: { total: 7, stars: 100, comments: 50, shares: 25, plays: 600 } },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load data using centralized API
      const [
        photosData, videosData, storiesData, 
        liveData, reelsData, songsData
      ] = await Promise.all([
        DatabaseAPI.getPhotos(),
        DatabaseAPI.getVideos(),
        DatabaseAPI.getStories(),
        DatabaseAPI.getLiveStreams(),
        DatabaseAPI.getReels(),
        DatabaseAPI.getSongs()
      ]);

      // Process data using centralized processors
      const processedPhotos = DataProcessor.processPhotos(photosData);
      const processedVideos = DataProcessor.processVideos(videosData);
      const processedStories = DataProcessor.processStories(storiesData);
      const processedLive = DataProcessor.processLiveStreams(liveData);
      const processedReels = DataProcessor.processReels(reelsData);
      const processedSongs = DataProcessor.processSongs(songsData);

      // Calculate stats using centralized calculator
      const photoStats = StatsCalculator.calculatePhotoStats(processedPhotos);
      const videoStats = StatsCalculator.calculateVideoStats(processedVideos);
      const storyStats = StatsCalculator.calculateStoryStats(processedStories);
      const liveStats = StatsCalculator.calculateLiveStats(processedLive);
      const reelStats = StatsCalculator.calculateReelStats(processedReels);
      const songStats = StatsCalculator.calculateSongStats(processedSongs);

      // Update sections with real data
      const newSections = [
        { name: 'Photo Tool', screen: 'PhotoTool', icon: 'photo', stats: photoStats },
        { name: 'Video Tool', screen: 'VideoTool', icon: 'videocam', stats: videoStats },
        { name: 'Story Tool', screen: 'StoryTool', icon: 'auto-stories', stats: storyStats },
        { name: 'Live Tool', screen: 'LiveTool', icon: 'live-tv', stats: liveStats },
        { name: 'Reels Tool', screen: 'ReelsTool', icon: 'movie', stats: reelStats },
        { name: 'Song Tool', screen: 'SongTool', icon: 'music-note', stats: songStats },
      ];

      setSections(newSections);

      // Calculate total data
      const total = newSections.reduce(
        (acc, section) => {
          acc.totalContent += section.stats.total;
          acc.totalStars += section.stats.stars;
          acc.totalComments += section.stats.comments;
          acc.totalShares += section.stats.shares;
          // Handle different stat types safely
          const views = (section.stats as any).views || 0;
          const viewers = (section.stats as any).viewers || 0;
          const plays = (section.stats as any).plays || 0;
          acc.totalViews += views || viewers || plays;
          return acc;
        },
        { totalContent: 0, totalStars: 0, totalComments: 0, totalShares: 0, totalViews: 0 }
      );

      setTotalData(total);
    } catch (error) {
      console.error('Error loading database data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionPress = (section: SectionData) => {
    // Navigate to respective screen with data using Expo Router
    const screenMap: Record<string, string> = {
      'PhotoTool': '/Apptepbar/Databes/PhotoToolScreen',
      'VideoTool': '/Apptepbar/Databes/VideoToolScreen',
      'StoryTool': '/Apptepbar/Databes/StoryToolScreen',
      'LiveTool': '/Apptepbar/Databes/LiveToolScreen',
      'ReelsTool': '/Apptepbar/Databes/ReelsToolScreen',
      'SongTool': '/Apptepbar/Databes/SongToolScreen',
    };

    const route = screenMap[section.screen];
    if (route) {
      router.push({
        pathname: route as any,
        params: {
          title: section.name,
          stats: JSON.stringify(section.stats)
        }
      });
    }
  };

  const handleYourEarning = () => {
    Alert.alert(
      "Your Earning",
      `Total Stars: ${totalData.totalStars}\nTotal Comments: ${totalData.totalComments}\nTotal Shares: ${totalData.totalShares}\nTotal Views: ${totalData.totalViews}`,
      [{ text: "OK" }]
    );
  };

  const handleAddBankAccount = () => {
    router.push('/Apptepbar/Databes/BankAccount');
  };

  const handleWalletConnection = () => {
    setShowWalletModal(true);
  };

  const getRank = () => {
    const total = totalData.totalStars;
    if (total > 10000) return "Diamond";
    if (total > 5000) return "Platinum";
    if (total > 1000) return "Gold";
    if (total > 500) return "Silver";
    if (total > 100) return "Bronze";
    return "Beginner";
  };

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.loading} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppColors.refresh]} />
        }
      >

        {/* Your Rank Card */}
        <View style={styles.rankCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="stars" size={24} color={AppColors.primary.main} />
            <Text style={styles.cardTitle}>Your Rank</Text>
          </View>

          <View style={styles.rankContainer}>
            <View style={styles.rankBadge}>
              <Ionicons name="trophy" size={32} color={AppColors.gold} />
              <Text style={styles.rankText}>{getRank()}</Text>
            </View>

            <View style={styles.rankStats}>
              <View style={styles.rankStatItem}>
                <Text style={styles.rankStatLabel}>Total Stars</Text>
                <Text style={styles.rankStatValue}>{totalData.totalStars.toLocaleString()}</Text>
              </View>
              <View style={styles.rankStatItem}>
                <Text style={styles.rankStatLabel}>Content Count</Text>
                <Text style={styles.rankStatValue}>{totalData.totalContent}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Your Earning Button */}
        <TouchableOpacity style={styles.earningButton} onPress={handleYourEarning}>
          <MaterialIcons name="account-balance-wallet" size={22} color={AppColors.primary.main} />
          <Text style={styles.earningButtonText}>Your Earning</Text>
          <MaterialIcons name="arrow-forward" size={18} color={AppColors.primary.main} />
        </TouchableOpacity>

        {/* Database Sections - Clickable Cards */}
        <View style={styles.databaseContainer}>
          <View style={styles.databaseHeader}>
            <MaterialIcons name="storage" size={20} color={AppColors.primary.main} />
            <Text style={styles.databaseTitle}>Database</Text>
          </View>

          {sections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={styles.databaseCard}
              onPress={() => handleSectionPress(section)}
            >
              <View style={styles.databaseRow}>
                <View style={styles.databaseLeft}>
                  <MaterialIcons name={section.icon as any} size={22} color={AppColors.primary.main} />
                  <View style={styles.databaseInfo}>
                    <Text style={styles.databaseName}>{section.name}</Text>
                    <Text style={styles.databaseCount}>{section.stats.total} items</Text>
                  </View>
                </View>

                <View style={styles.databaseStats}>
                  <View style={styles.statBadge}>
                    <Ionicons name="star" size={12} color={AppColors.gold} />
                    <Text style={styles.statBadgeText}>{section.stats.stars}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={AppColors.icon.inactive} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wallet Connection Button */}
        <TouchableOpacity style={styles.walletButton} onPress={handleWalletConnection}>
          <MaterialIcons name="account-balance-wallet" size={22} color={AppColors.primary.main} />
          <Text style={styles.walletButtonText}>Wallet Connection</Text>
          <MaterialIcons name="arrow-forward" size={18} color={AppColors.primary.main} />
        </TouchableOpacity>

        {/* Add Bank Account Button */}
        <TouchableOpacity style={styles.bankButton} onPress={handleAddBankAccount}>
          <MaterialIcons name="account-balance" size={22} color={AppColors.primary.main} />
          <Text style={styles.bankButtonText}>Add Bank Account</Text>
          <MaterialIcons name="arrow-forward" size={18} color={AppColors.primary.main} />
        </TouchableOpacity>
      </ScrollView>

      {/* Wallet Modal */}
      <Modal
        visible={showWalletModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWalletModal(false)}>
              <MaterialIcons name="close" size={24} color={AppColors.primary.main} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Wallet Connection</Text>
            <View style={styles.placeholder} />
          </View>
          <WalletConnect />
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.primary,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background.primary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: AppColors.text.tertiary,
  },
  rankCard: {
    backgroundColor: AppColors.background.secondary,
    margin: 12,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.primary.main,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.secondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.primary.main,
    marginLeft: 8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    alignItems: 'center',
    marginRight: 20,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.gold,
    marginTop: 4,
  },
  rankStats: {
    flex: 1,
  },
  rankStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankStatLabel: {
    fontSize: 14,
    color: AppColors.text.tertiary,
  },
  rankStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  earningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.secondary,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.primary.main,
  },
  earningButtonText: {
    color: AppColors.primary.main,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  databaseContainer: {
    margin: 12,
  },
  databaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  databaseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.primary.main,
    marginLeft: 6,
  },
  databaseCard: {
    backgroundColor: AppColors.background.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.border.primary,
    marginBottom: 8,
  },
  databaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  databaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  databaseInfo: {
    marginLeft: 12,
  },
  databaseName: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.text.primary,
    marginBottom: 2,
  },
  databaseCount: {
    fontSize: 12,
    color: AppColors.text.tertiary,
  },
  databaseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statBadgeText: {
    fontSize: 12,
    color: AppColors.text.primary,
    marginLeft: 4,
  },
  bankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.secondary,
    margin: 12,
    marginTop: 0,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.primary.main,
  },
  bankButtonText: {
    color: AppColors.primary.main,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.secondary,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AppColors.primary.main,
  },
  walletButtonText: {
    color: AppColors.primary.main,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: AppColors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.secondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  placeholder: {
    width: 24,
  },
});
