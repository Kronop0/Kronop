import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LiveUploadUIProps {
  liveData: { title: string; category: string; audienceType: string };
  setLiveData: (data: any) => void;
  categories: string[];
  startLiveStream: () => void;
}

export default function LiveUploadUI({ 
  liveData, 
  setLiveData, 
  categories, 
  startLiveStream 
}: LiveUploadUIProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.uploadArea}>
        <Text style={styles.setupTitle}>Setup Your Live Stream</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stream Title *</Text>
          <TextInput
            style={styles.input}
            value={liveData.title}
            onChangeText={(text: string) => setLiveData((prev: any) => ({ ...prev, title: text }))}
            placeholder="Enter your live stream title..."
            placeholderTextColor="#666"
            maxLength={100}
          />
          <Text style={styles.charCount}>{liveData.title.length}/100</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  liveData.category === category && styles.categoryChipSelected
                ]}
                onPress={() => setLiveData((prev: { title: string; category: string; audienceType: string }) => ({ ...prev, category }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  liveData.category === category && styles.categoryChipTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.audienceSection}>
          <Text style={styles.label}>Who can join? *</Text>
          <View style={styles.audienceButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.audienceButton,
                liveData.audienceType === 'invite' && styles.audienceButtonSelected
              ]}
              onPress={() => setLiveData((prev: { title: string; category: string; audienceType: string }) => ({ ...prev, audienceType: 'invite' }))}
            >
              <MaterialIcons name="person-add" size={24} color="#6A5ACD" />
              <Text style={styles.audienceButtonText}>Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.audienceButton,
                liveData.audienceType === 'friends' && styles.audienceButtonSelected
              ]}
              onPress={() => setLiveData((prev: { title: string; category: string; audienceType: string }) => ({ ...prev, audienceType: 'friends' }))}
            >
              <MaterialIcons name="people" size={24} color="#6A5ACD" />
              <Text style={styles.audienceButtonText}>Friends</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.audienceButton,
                liveData.audienceType === 'country' && styles.audienceButtonSelected
              ]}
              onPress={() => setLiveData((prev: { title: string; category: string; audienceType: string }) => ({ ...prev, audienceType: 'country' }))}
            >
              <MaterialIcons name="public" size={24} color="#6A5ACD" />
              <Text style={styles.audienceButtonText}>Country</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.goLiveButton,
            (!liveData.title.trim() || !liveData.category.trim() || !liveData.audienceType.trim()) && styles.goLiveButtonDisabled
          ]}
          onPress={startLiveStream}
        >
          <MaterialIcons name="live-tv" size={24} color="#fff" />
          <Text style={styles.goLiveButtonText}>Go Live</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  uploadArea: {
    padding: 8,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  charCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryScroll: {
    marginTop: 10,
  },
  categoryChip: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#6A5ACD',
    borderColor: '#6A5ACD',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  audienceSection: {
    marginBottom: 30,
  },
  audienceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  audienceButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  audienceButtonSelected: {
    borderColor: '#6A5ACD',
    backgroundColor: 'rgba(106, 90, 205, 0.1)',
  },
  audienceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A5ACD',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  goLiveButtonDisabled: {
    backgroundColor: '#444444',
  },
  goLiveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
