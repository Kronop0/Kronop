import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useFavorites } from '../hooks/useFavorites';
import { SearchBar, SongListItem, CategoryBar, NowPlayingBar } from '../components';
import { Song } from '../types';
import { colors, spacing } from '../constants/theme';

// Exact pixel heights — no guessing
const SEARCH_H = 52;   // SearchBar: height 44 + marginBottom 8
const CATEGORY_H = 46; // CategoryBar fixed height
const HEADER_H = SEARCH_H + CATEGORY_H;

export default function MusicLibrary() {
  const insets = useSafeAreaInsets();
  const {
    playlist, currentSong, currentIndex, isPlaying,
    position, duration, togglePlayPause, playSongAtIndex,
    isLoadingSongs, songsError,
  } = useAudioPlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [barVisible, setBarVisible] = useState(false);

  // NowPlayingBar animation
  const barTY = useRef(new Animated.Value(100)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  // Scroll animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchTranslateY = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(1)).current;
  const categoryTranslateY = useRef(new Animated.Value(0)).current;

  const showBar = useCallback(() => {
    setBarVisible(true);
    Animated.parallel([
      Animated.spring(barTY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [barTY, barOpacity]);

  const handlePlayPress = useCallback((index: number) => {
    playSongAtIndex(index);
    showBar();
  }, [playSongAtIndex, showBar]);

  const filteredPlaylist = useMemo(() => {
    let result = playlist;
    if (selectedCategory !== 'all') result = result.filter((s) => s.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
    }
    return result;
  }, [playlist, searchQuery, selectedCategory]);

  const renderItem = useCallback(({ item }: { item: Song }) => {
    const idx = playlist.findIndex((s) => s.id === item.id);
    return (
      <SongListItem
        song={item}
        isPlaying={idx === currentIndex && isPlaying}
        isFavorite={isFavorite(item.id)}
        onPlayPress={() => handlePlayPress(idx)}
        onFavoritePress={() => toggleFavorite(item.id)}
      />
    );
  }, [playlist, currentIndex, isPlaying, isFavorite, handlePlayPress, toggleFavorite]);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
    
    // Animate search bar
    const searchTy = offsetY > SEARCH_H ? -SEARCH_H : -offsetY;
    const searchOp = offsetY > SEARCH_H * 0.5 ? 0 : 1 - (offsetY / (SEARCH_H * 0.5));
    
    Animated.parallel([
      Animated.timing(searchTranslateY, {
        toValue: searchTy,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(searchOpacity, {
        toValue: searchOp,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(categoryTranslateY, {
        toValue: searchTy,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scrollY, searchTranslateY, searchOpacity, categoryTranslateY]);

  if (isLoadingSongs) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading songs...</Text>
      </View>
    );
  }
  if (songsError) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{songsError}</Text>
      </View>
    );
  }

  const nowPlayingHeight = barVisible ? 68 + insets.bottom : 0;
  const barAnimStyle = {
    transform: [{ translateY: barTY }],
    opacity: barOpacity,
  };

  return (
    <View style={styles.root}>
      {/* FlatList — paddingTop reserves space for safe area + absolute header */}
      <Animated.FlatList
        data={filteredPlaylist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + HEADER_H, paddingBottom: nowPlayingHeight + spacing.sm }}
      />

      {/* Black status bar cover — prevents category from showing through */}
      <View style={[styles.statusBarCover, { height: insets.top }]} />

      {/* Absolute header — top accounts for safe area so SearchBar is never behind status bar */}
      <View style={[styles.header, { top: insets.top }]} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ translateY: searchTranslateY }], opacity: searchOpacity }}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: categoryTranslateY }] }}>
          <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
        </Animated.View>
      </View>

      {/* NowPlayingBar */}
      {barVisible && currentSong ? (
        <Animated.View style={[styles.barWrapper, barAnimStyle]}>
          <NowPlayingBar
            song={currentSong}
            isPlaying={isPlaying}
            isFavorite={isFavorite(currentSong.id)}
            position={position}
            duration={duration}
            onPlayPress={togglePlayPause}
            onFavoritePress={() => toggleFavorite(currentSong.id)}
            bottomInset={insets.bottom}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  statusBarCover: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.background, zIndex: 20 },
  header: { position: 'absolute', left: 0, right: 0, zIndex: 10 },
  barWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 14 },
  errorText: { color: '#ff5555', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
