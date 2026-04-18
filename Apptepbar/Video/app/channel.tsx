import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listR2Videos } from '../services/r2Service';
import { spacing, typography, borderRadius } from '../constants/theme';
import { ChannelProfile } from '../components/video-controller/ChannelProfile';

const PURPLE = '#8B00FF';

export default function ChannelScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId, username } = useLocalSearchParams<{ userId: string; username: string }>();
  const [isSupporting, setIsSupporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [allVideos, setAllVideos] = useState<any[]>([]);
  
  React.useEffect(() => {
    listR2Videos().then(setAllVideos);
  }, []);
  
  const channelVideos = allVideos.filter((v: any) => v.userId === userId);
  const totalViews = channelVideos.reduce((s: number, v: any) => s + v.views, 0);
  const totalLikes = channelVideos.reduce((s: number, v: any) => s + v.likes, 0);
  const fmt = (n: number) => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:`${n}`;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Channel</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ChannelProfile username={username||''} userId={userId||''} isSupporting={isSupporting} onSupport={() => setIsSupporting(!isSupporting)} videoCount={channelVideos.length} totalViews={totalViews} totalLikes={totalLikes} formatNumber={fmt} />
        <View style={styles.tabBar}>
          {(['videos','about'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab===tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab===tab && styles.activeTabText]}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTab === 'videos' ? (
          <View style={styles.grid}>
            {channelVideos.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="videocam-off" size={56} color="#333" />
                <Text style={styles.emptyText}>No videos yet</Text>
              </View>
            ) : channelVideos.map(v => (
              <TouchableOpacity key={v.id} style={styles.videoItem} onPress={() => router.push(`/video-player?videoId=${v.id}`)}>
                <View style={styles.thumb}>
                  <Ionicons name="videocam" size={30} color="#444" />
                  <View style={styles.thumbDur}><Text style={styles.thumbDurText}>{v.duration}</Text></View>
                </View>
                <View style={styles.meta}>
                  <Text style={styles.metaTitle} numberOfLines={2}>{v.title}</Text>
                  <Text style={styles.metaStats}>{fmt(v.views)} views • {fmt(v.likes)} ⭐</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.about}>
            {[
              { icon:'person-circle-outline', label:'Creator', value: username||'Unknown' },
              { icon:'videocam-outline', label:'Total Videos', value:`${channelVideos.length} videos` },
              { icon:'eye-outline', label:'Total Views', value:`${fmt(totalViews)} views` },
              { icon:'star-outline', label:'Total Stars', value:`${fmt(totalLikes)} stars` },
            ].map((item, i) => (
              <View key={i} style={styles.aboutRow}>
                <View style={styles.aboutIcon}><Ionicons name={item.icon as any} size={18} color={PURPLE} /></View>
                <View>
                  <Text style={styles.aboutLabel}>{item.label}</Text>
                  <Text style={styles.aboutValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#000000' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:spacing.md, paddingBottom:spacing.sm, backgroundColor:'#000000' },
  backBtn: { padding:spacing.xs },
  headerTitle: { fontSize:typography.h4, fontWeight:'700', color:'#FFFFFF' },
  moreBtn: { padding:spacing.xs },
  tabBar: { flexDirection:'row', backgroundColor:'#000000', borderBottomWidth:1, borderBottomColor:'#1A1A1A' },
  tab: { flex:1, paddingVertical:spacing.md, alignItems:'center' },
  activeTab: { borderBottomWidth:2, borderBottomColor:'#8B00FF' },
  tabText: { fontSize:typography.body, color:'#666666', fontWeight:'600' },
  activeTabText: { color:'#FFFFFF' },
  grid: { padding:spacing.md, gap:spacing.md },
  empty: { alignItems:'center', paddingVertical:spacing.xxl, gap:spacing.md },
  emptyText: { fontSize:typography.body, color:'#444444' },
  videoItem: { flexDirection:'row', backgroundColor:'#111111', borderRadius:borderRadius.md, overflow:'hidden', borderWidth:1, borderColor:'#1A1A1A' },
  thumb: { width:130, height:80, backgroundColor:'#1A1A1A', alignItems:'center', justifyContent:'center', position:'relative' },
  thumbDur: { position:'absolute', bottom:4, right:4, backgroundColor:'rgba(0,0,0,0.85)', paddingHorizontal:6, paddingVertical:2, borderRadius:4 },
  thumbDurText: { color:'#FFFFFF', fontSize:10, fontWeight:'600' },
  meta: { flex:1, padding:spacing.sm, justifyContent:'center', gap:4 },
  metaTitle: { fontSize:typography.small, fontWeight:'600', color:'#FFFFFF', lineHeight:18 },
  metaStats: { fontSize:10, color:'#666666' },
  about: { padding:spacing.md, gap:spacing.md },
  aboutRow: { flexDirection:'row', alignItems:'center', gap:spacing.md, backgroundColor:'#111111', padding:spacing.md, borderRadius:borderRadius.md, borderWidth:1, borderColor:'#1A1A1A' },
  aboutIcon: { width:36, height:36, borderRadius:18, backgroundColor:'rgba(139,0,255,0.15)', alignItems:'center', justifyContent:'center' },
  aboutLabel: { fontSize:11, color:'#666666' },
  aboutValue: { fontSize:typography.body, fontWeight:'600', color:'#FFFFFF' },
});
