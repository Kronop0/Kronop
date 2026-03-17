import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useFavorites } from '../hooks/useFavorites';
import { SearchBar, SongListItem } from '../components';
import { Song } from '../types';
import { colors, spacing, typography } from '../constants/theme';

export default function MusicLibrary() {
  const insets = useSafeAreaInsets();
  const { playlist, currentIndex, isPlaying, isLoadingSongs, playSongAtIndex } = useAudioPlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter songs based on search query
  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) {
      return playlist;
    }
    
    const query = searchQuery.toLowerCase();
    return playlist.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const artistMatch = song.artist.toLowerCase().includes(query);
      return titleMatch || artistMatch;
    });
  }, [playlist, searchQuery]);

  const renderSongItem = ({ item }: { item: Song; index: number }) => {
    // Find the actual index in the original playlist
    const actualIndex = playlist.findIndex(song => song.id === item.id);
    const isCurrentSong = actualIndex === currentIndex;
    const isCurrentlyPlaying = isCurrentSong && isPlaying;

    return (
      <SongListItem
        song={item}
        isPlaying={isCurrentlyPlaying}
        isFavorite={isFavorite(item.id)}
        onPlayPress={() => playSongAtIndex(actualIndex)}
        onFavoritePress={() => toggleFavorite(item.id)}
      />
    );
  };



  // Show loading state while fetching from R2
  if (isLoadingSongs) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔄 Loading from Cloudflare R2...</Text>
          <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8 }]}>Bucket: kronop-song</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!playlist || playlist.length === 0) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>⚠️ No songs in R2 bucket</Text>
          <Text style={[styles.emptyText, { fontSize: 12, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }]}>Please upload audio files (.mp3, .wav, .m4a) to your kronop-song bucket</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <Animated.View entering={FadeIn} style={[styles.content, { paddingTop: insets.top }]}>
        <View style={{ paddingTop: spacing.md }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search songs, artists..."
          />
        </View>
        
        {filteredPlaylist.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No songs found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPlaylist}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + spacing.xl
            }}
          />
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },



  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
