import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppColors } from '../../appColor/AppColors';
import { ProfileStyles } from '../../appColor/ProfileTheme';
import WalletConnect from '../../frontend/WalletConnect';
import HomeScreen from '../AI/app';

// Import upload components
import StoryUpload from '../../components/upload/story.jsa/StoryUpload.tsx';
import PhotoUpload from '../../components/upload/photo.tsa/PhotoUpload.tsx';
import ReelsUpload from '../../components/upload/reels.jsa/ReelsUpload.tsx';
import VideoUpload from '../../components/upload/video.jsa/VideoUpload.tsx';
import LiveUpload from '../../components/upload/live.jsa/app/index';
import SongUpload from '../../components/upload/song.jsa/SongUpload.tsx';

// Import Database screens and utilities from Apptepbar/Databes
import {
  PhotoToolScreen,
  VideoToolScreen,
  StoryToolScreen,
  LiveToolScreen,
  ReelsToolScreen,
  SongToolScreen,
  NotesToolScreen,
  BankAccountScreen,
  DatabaseAPI,
  DataProcessor,
  StatsCalculator,
  type ContentStats
} from '../../Apptepbar/Databes';

const mockUserData = {
  displayName: 'Aman Angoriya',
  username: 'johndoe',
  bio: 'Passionate about creating amazing content and connecting with people around the world.',
  avatar: 'https://picsum.photos/80/80?random=profile',
  coverPhoto: 'https://picsum.photos/400/150?random=cover',
  supporters: 0,
  supporting: 0,
  posts: 0,
  badge: 'Creator'
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [userData, setUserData] = useState(mockUserData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    username: '',
    bio: '',
    coverPhoto: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadScreen, setSelectedUploadScreen] = useState<string | null>(null);

  // Database modal state
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [selectedDatabaseScreen, setSelectedDatabaseScreen] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbRefreshing, setDbRefreshing] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const [totalData, setTotalData] = useState({
    totalContent: 0,
    totalStars: 0,
    totalComments: 0,
    totalShares: 0,
    totalViews: 0,
  });

  const [sections, setSections] = useState([
    { name: 'Photo Tool', screen: 'Photo', icon: 'photo', stats: { total: 10, stars: 150, comments: 75, shares: 30, views: 1000 } },
    { name: 'Video Tool', screen: 'Video', icon: 'videocam', stats: { total: 8, stars: 120, comments: 60, shares: 25, views: 800 } },
    { name: 'Story Tool', screen: 'Story', icon: 'auto-stories', stats: { total: 5, stars: 80, comments: 40, shares: 20, views: 500 } },
    { name: 'Live Tool', screen: 'Live', icon: 'live-tv', stats: { total: 3, stars: 60, comments: 30, shares: 15, viewers: 300 } },
    { name: 'Reels Tool', screen: 'Reels', icon: 'movie', stats: { total: 12, stars: 180, comments: 90, shares: 36, views: 1200 } },
    { name: 'Song Tool', screen: 'Song', icon: 'music-note', stats: { total: 7, stars: 100, comments: 50, shares: 25, plays: 600 } },
  ]);

  const tabs = [
    { id: 'video', label: 'Video' },
    { id: 'reels', label: 'Reels' },
    { id: 'photo', label: 'Photo' },
    { id: 'live', label: 'Live' },
    { id: 'songs', label: 'Songs' },
    { id: 'notes', label: 'Notes' },

  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // const result = await profileService.fetchProfile(); // Removed - using mock data
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = { success: true, data: mockUserData };
      
      if (result.success && result.data) {
        setUserData(result.data);
        setEditData({
          displayName: result.data.displayName || '',
          username: result.data.username || '',
          bio: result.data.bio || '',
          coverPhoto: result.data.coverPhoto || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditData({
      displayName: userData.displayName,
      username: userData.username,
      bio: userData.bio,
      coverPhoto: userData.coverPhoto || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = { success: true };
      
      if (result.success) {
        setUserData(prev => ({
          ...prev,
          ...editData
        }));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile'); // Removed result.error since mock doesn't have it
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = () => {
    Alert.alert('Share Profile', 'Profile share functionality coming soon!');
  };

  const handleYourRank = () => {
    setShowDatabaseModal(true);
    loadDatabaseData();
  };

  const onDbRefresh = async () => {
    setDbRefreshing(true);
    await loadDatabaseData();
    setDbRefreshing(false);
  };

  const loadDatabaseData = async () => {
    try {
      setDbLoading(true);
      const [photosData, videosData, storiesData, liveData, reelsData, songsData, NotesData] = await Promise.all([
        DatabaseAPI.getPhotos(),
        DatabaseAPI.getVideos(),
        DatabaseAPI.getStories(),
        DatabaseAPI.getLiveStreams(),
        DatabaseAPI.getReels(),
        DatabaseAPI.getSongs(),
        DatabaseAPI.getNotes()
      ]);

      const processedPhotos = DataProcessor.processPhotos(photosData);
      const processedVideos = DataProcessor.processVideos(videosData);
      const processedStories = DataProcessor.processStories(storiesData);
      const processedLive = DataProcessor.processLiveStreams(liveData);
      const processedReels = DataProcessor.processReels(reelsData);
      const processedSongs = DataProcessor.processSongs(songsData);
      const processedNotes = DataProcessor.processNotes(NotesData);

      const photoStats = StatsCalculator.calculatePhotoStats(processedPhotos);
      const videoStats = StatsCalculator.calculateVideoStats(processedVideos);
      const storyStats = StatsCalculator.calculateStoryStats(processedStories);
      const liveStats = StatsCalculator.calculateLiveStats(processedLive);
      const reelStats = StatsCalculator.calculateReelStats(processedReels);
      const songStats = StatsCalculator.calculateSongStats(processedSongs);
      const noteStats = StatsCalculator.calculateNoteStats(processedNotes);

      const newSections = [
        { name: 'Photo Tool', screen: 'Photo', icon: 'photo', stats: photoStats },
        { name: 'Video Tool', screen: 'Video', icon: 'videocam', stats: videoStats },
        { name: 'Story Tool', screen: 'Story', icon: 'auto-stories', stats: storyStats },
        { name: 'Live Tool', screen: 'Live', icon: 'live-tv', stats: liveStats },
        { name: 'Reels Tool', screen: 'Reels', icon: 'movie', stats: reelStats },
        { name: 'Song Tool', screen: 'Song', icon: 'music-note', stats: songStats },
        { name: 'Notes Tool', screen: 'Notes', icon: 'note', stats: noteStats },
      ];

      setSections(newSections);

      const total = newSections.reduce((acc, section) => {
        acc.totalContent += section.stats.total;
        acc.totalStars += section.stats.stars;
        acc.totalComments += section.stats.comments;
        acc.totalShares += section.stats.shares;
        const views = (section.stats as any).views || 0;
        const viewers = (section.stats as any).viewers || 0;
        const plays = (section.stats as any).plays || 0;
        acc.totalViews += views || viewers || plays;
        return acc;
      }, { totalContent: 0, totalStars: 0, totalComments: 0, totalShares: 0, totalViews: 0 });

      setTotalData(total);
    } catch (error) {
      console.error('Error loading database data:', error);
    } finally {
      setDbLoading(false);
    }
  };

  const handleSectionPress = (section: any) => {
    setSelectedDatabaseScreen(section.screen);
  };

  const handleYourEarning = () => {
    Alert.alert(
      "Your Earning",
      `Total Stars: ${totalData.totalStars}\nTotal Comments: ${totalData.totalComments}\nTotal Shares: ${totalData.totalShares}\nTotal Views: ${totalData.totalViews}`,
      [{ text: "OK" }]
    );
  };

  const handleAddBankAccount = () => {
    setSelectedDatabaseScreen('Bank');
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

  const handleSettingsPress = () => {
    router.push('/settings' as any);
  };

  const handleVerificationPress = () => {
    router.push('/verification' as any);
  };

  const handleSupporterPress = () => {
    // Open help center which uses GroqAIService
    router.push('/help-center' as any);
  };

  const handleSupportPress = () => {
    // Open AI support app
    router.push('/AI' as any);
  };

  const handleMenuPress = () => {
    router.push('/menu' as any);
  };

  const handleUploadPress = () => setShowUploadModal(true);

  const handleUploadOptionPress = (option: string) => {
    setShowUploadModal(false);
    setSelectedUploadScreen(option);
  };

  // Image picker handlers for cover photo and profile picture
  const pickCoverPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUserData(prev => ({ ...prev, coverPhoto: result.assets[0].uri }));
      setEditData(prev => ({ ...prev, coverPhoto: result.assets[0].uri }));
    }
  };

  const pickProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUserData(prev => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'video':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        );
      case 'reels':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No reels yet</Text>
          </View>
        );
      case 'photo':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        );
      case 'live':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No live streams yet</Text>
          </View>
        );
      case 'songs':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No songs yet</Text>
          </View>
        );
      case 'notes':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No notes yet</Text>
          </View>
        );
      case 'save':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No saved items yet</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading && !userData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.username}>Your Profile</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleVerificationPress}>
            <FontAwesome6 name="chess-queen" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSupportPress}>
            <MaterialIcons name="support-agent" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
            <Ionicons name="settings" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleUploadPress}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <TouchableOpacity 
          style={styles.coverPhotoContainer} 
          onPress={() => isEditing && pickCoverPhoto()} 
          activeOpacity={isEditing ? 0.9 : 1}
          disabled={!isEditing}
        >
          <Image source={{ uri: userData.coverPhoto }} style={styles.coverPhoto} />
          {isEditing && (
            <View style={styles.changeCoverButton}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changeCoverText}>Change Cover</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.userTextContainer}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.displayNameInput}
                  value={editData.displayName}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, displayName: text }))}
                  placeholder="Display Name"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={styles.usernameInput}
                  value={editData.username}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, username: text }))}
                  placeholder="@username"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={styles.bioInput}
                  multiline
                  value={editData.bio}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, bio: text }))}
                  placeholder="Write your bio..."
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </>
            ) : (
              <>
                <Text style={styles.displayName}>{userData.displayName}</Text>
                <Text style={styles.usernameText}>@{userData.username}</Text>
                <Text style={styles.bio}>{userData.bio}</Text>
              </>
            )}
          </View>
          
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity 
              onPress={() => isEditing && pickProfilePicture()} 
              activeOpacity={isEditing ? 0.9 : 1}
              disabled={!isEditing}
            >
              <Image source={{ uri: userData.avatar }} style={styles.profilePicture} />
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton} onPress={pickProfilePicture}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsText}>{userData.supporters} supporters • {userData.supporting} supporting • {userData.posts} posts</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEditProfile}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShareProfile}>
                <Text style={styles.buttonText}>Share Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Your Data Button - Full width, low height */}
        <TouchableOpacity style={styles.yourRankButton} onPress={handleYourRank}>
          <Text style={styles.yourRankButtonText}>Your Data</Text>
        </TouchableOpacity>

        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
                {activeTab === tab.id && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Upload Bottom Sheet Modal */}
      <Modal
        visible={showUploadModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUploadModal(false)}
        >
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Create</Text>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Story')}
              >
                <Ionicons name="book" size={24} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Story</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Photo')}
              >
                <Ionicons name="image" size={24} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Reels')}
              >
                <Ionicons name="film" size={24} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Reels</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Video')}
              >
                <Ionicons name="videocam" size={24} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Live')}
              >
                <Ionicons name="radio" size={24} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Live</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Song')}
              >
                <Ionicons name="musical-notes" size={24} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Song</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Upload Screens Modal */}
      <Modal
        visible={!!selectedUploadScreen}
        animationType="none"
        onRequestClose={() => setSelectedUploadScreen(null)}
      >
        <View style={styles.fullScreenUploadContainer}>
          {/* Header with Close Button */}
          <View style={styles.uploadModalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedUploadScreen(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
          
          {/* Upload Screen Content */}
          <View style={styles.uploadScreenContainer}>
            {selectedUploadScreen === 'Story' && <StoryUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Photo' && <PhotoUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Reels' && <ReelsUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Video' && <VideoUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Live' && <LiveUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Song' && <SongUpload onClose={() => setSelectedUploadScreen(null)} />}
          </View>
        </View>
      </Modal>

      {/* Database Screen Modal */}
      <Modal
        visible={showDatabaseModal}
        animationType="slide"
        onRequestClose={() => setShowDatabaseModal(false)}
      >
        <SafeScreen>
          <ScrollView
            style={styles.dbContainer}
            contentContainerStyle={styles.dbScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={dbRefreshing} onRefresh={onDbRefresh} colors={['#8B00FF']} />
            }
          >
            {/* Your Rank Card */}
            <View style={styles.rankCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="stars" size={24} color="#8B00FF" />
                <Text style={styles.cardTitle}>Your Rank</Text>
              </View>

              <View style={styles.rankContainer}>
                <View style={styles.rankBadge}>
                  <Ionicons name="trophy" size={32} color="#FFD700" />
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
              <MaterialIcons name="account-balance-wallet" size={22} color="#8B00FF" />
              <Text style={styles.earningButtonText}>Your Earning</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#8B00FF" />
            </TouchableOpacity>

            {/* Database Sections - Clickable Cards */}
            <View style={styles.databaseContainer}>
              <View style={styles.databaseHeader}>
                <MaterialIcons name="storage" size={20} color="#8B00FF" />
                <Text style={styles.databaseTitle}>Database</Text>
              </View>

              {dbLoading ? (
                <ActivityIndicator size="large" color="#8B00FF" style={styles.dbLoading} />
              ) : (
                sections.map((section, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.databaseCard}
                    onPress={() => handleSectionPress(section)}
                  >
                    <View style={styles.databaseRow}>
                      <View style={styles.databaseLeft}>
                        <MaterialIcons name={section.icon as any} size={22} color="#8B00FF" />
                        <View style={styles.databaseInfo}>
                          <Text style={styles.databaseName}>{section.name}</Text>
                          <Text style={styles.databaseCount}>{section.stats.total} items</Text>
                        </View>
                      </View>

                      <View style={styles.databaseStats}>
                        <View style={styles.statBadge}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.statBadgeText}>{section.stats.stars}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Wallet Connection Button */}
            <TouchableOpacity style={styles.walletButton} onPress={handleWalletConnection}>
              <MaterialIcons name="account-balance-wallet" size={22} color="#8B00FF" />
              <Text style={styles.walletButtonText}>Wallet Connection</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#8B00FF" />
            </TouchableOpacity>

            {/* Add Bank Account Button */}
            <TouchableOpacity style={styles.bankButton} onPress={handleAddBankAccount}>
              <MaterialIcons name="account-balance" size={22} color="#8B00FF" />
              <Text style={styles.bankButtonText}>Add Bank Account</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#8B00FF" />
            </TouchableOpacity>
          </ScrollView>
        </SafeScreen>
      </Modal>

      {/* Wallet Modal */}
      <Modal
        visible={showWalletModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.walletModalContainer}>
          <View style={styles.walletModalHeader}>
            <TouchableOpacity onPress={() => setShowWalletModal(false)}>
              <MaterialIcons name="close" size={24} color="#8B00FF" />
            </TouchableOpacity>
            <Text style={styles.walletModalTitle}>Wallet Connection</Text>
            <View style={styles.dbPlaceholder} />
          </View>
          <WalletConnect />
        </View>
      </Modal>


      {/* Database Screens Modal */}
      <Modal
        visible={!!selectedDatabaseScreen}
        animationType="slide"
        onRequestClose={() => setSelectedDatabaseScreen(null)}
      >
        <View style={styles.fullScreenDbContainer}>
          {/* Database Screen Content - Full Screen with no top padding */}
          <View style={styles.fullScreenDbContentNoTop}>
            {selectedDatabaseScreen === 'Photo' && <PhotoToolScreen />}
            {selectedDatabaseScreen === 'Video' && <VideoToolScreen />}
            {selectedDatabaseScreen === 'Story' && <StoryToolScreen />}
            {selectedDatabaseScreen === 'Live' && <LiveToolScreen />}
            {selectedDatabaseScreen === 'Reels' && <ReelsToolScreen />}
            {selectedDatabaseScreen === 'Song' && <SongToolScreen />}
            {selectedDatabaseScreen === 'Notes' && <NotesToolScreen />}
            {selectedDatabaseScreen === 'Bank' && <BankAccountScreen />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Use styles from ProfileTheme
const styles = ProfileStyles;
