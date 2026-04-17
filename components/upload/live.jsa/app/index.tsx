// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppColors as Colors } from '@/appColor/AppColors';
import { indexStyles as s } from '@/constants/styles';
import { useRouter } from 'expo-router';
import TitleInput from '../components/setup/TitleInput';
import AudienceSelector from '../components/setup/AudienceSelector';
import InviteFriends from '../components/setup/InviteFriends';
import CategoryPicker from '../components/setup/CategoryPicker';
import GoLiveButton from '../components/setup/GoLiveButton';

interface GoLiveScreenProps {
  onClose?: () => void;
}

export default function GoLiveScreen({ onClose }: GoLiveScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('public');
  const [addFriends, setAddFriends] = useState(false);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('gaming');
  const canGoLive = title.trim().length > 0;

  const handleGoLive = () => {
    router.push({
      pathname: '/live/stream',
      params: {
        title,
        category: selectedCategory,
        audience: selectedAudience,
        invitedIds: invitedIds.join(','),
      },
    });
  };

  return (
    <View style={[s.root, { paddingTop: 0, marginTop: -50, paddingHorizontal: 0, width: '100%' }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.primary} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBack} activeOpacity={0.7} onPress={onClose}>
          <Ionicons name="chevron-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Setup Live</Text>
        <View style={s.liveIndicator}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Form cards */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        <TitleInput value={title} onChange={setTitle} />
        <AudienceSelector selected={selectedAudience} onSelect={setSelectedAudience} />
        <InviteFriends
          enabled={addFriends}
          onToggle={(v) => { setAddFriends(v); if (!v) setInvitedIds([]); }}
          invitedIds={invitedIds}
          onInvitedChange={setInvitedIds}
        />
        <CategoryPicker selected={selectedCategory} onSelect={setSelectedCategory} />

        {/* Tip card */}
        <View style={s.tipCard}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.gold} />
          <Text style={s.tipText}>Add a catchy title and the right category to get more viewers on your live!</Text>
        </View>
      </ScrollView>

      {/* Go Live button */}
      <GoLiveButton canGoLive={canGoLive} onPress={handleGoLive} paddingBottom={insets.bottom + 16} />
    </View>
  );
}
