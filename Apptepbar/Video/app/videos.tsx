import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoCard } from '../components/VideoCard';
import { CategoryBar } from '../components/CategoryBar';
import { SearchBar } from '../components/SearchBar';
import { useVideos } from '../hooks/useVideos';
import { spacing } from '../constants/theme';

export default function VideosScreen() {
  const insets = useSafeAreaInsets();
  const { videos, loading, toggleLike, toggleSave, refresh } = useVideos();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (selectedCategory !== 'All') {
      result = result.filter(v => v.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        v =>
          v.title.toLowerCase().includes(q) ||
          v.username.toLowerCase().includes(q) ||
          (v.category || '').toLowerCase().includes(q) ||
          (v.description || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [videos, selectedCategory, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }} />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
      <FlatList
        data={filteredVideos}
        renderItem={({ item }) => (
          <VideoCard video={item} onLike={toggleLike} onSave={toggleSave} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="white" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  list: { paddingBottom: spacing.md },
});
