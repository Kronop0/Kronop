import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../constants/theme';

const PURPLE = '#8B00FF';

interface ChannelProfileProps {
  username: string;
  userId: string;
  isSupporting: boolean;
  onSupport: () => void;
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  formatNumber: (n: number) => string;
}

export function ChannelProfile({ username, userId, isSupporting, onSupport, videoCount, totalViews, totalLikes, formatNumber }: ChannelProfileProps) {
  const avatarColor = userId ? `hsl(${(userId.charCodeAt(0)*137)%360},70%,55%)` : PURPLE;
  return (
    <View>
      <View style={styles.cover}>
        <View style={styles.coverOverlay} />
      </View>
      <View style={styles.profileSection}>
        <View style={styles.logoWrap}>
          <View style={[styles.logo, { backgroundColor: avatarColor }]}>
            <Text style={styles.logoText}>{username ? username.charAt(0).toUpperCase() : 'C'}</Text>
          </View>
          <View style={styles.badge}><Ionicons name="checkmark-circle" size={22} color={PURPLE} /></View>
        </View>
        <Text style={styles.name}>{username || 'Channel Name'}</Text>
        <Text style={styles.handle}>@{(username||'channel').toLowerCase().replace(/\s/g,'_')}</Text>
        <View style={styles.statsRow}>
          {[{v:videoCount,l:'Videos'},{v:totalViews,l:'Views'},{v:totalLikes,l:'Stars'}].map((s,i) => (
            <React.Fragment key={i}>
              {i>0 && <View style={styles.divider}/>}
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{typeof s.v==='number'&&s.l!=='Videos'?formatNumber(s.v):s.v}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.supportBtn, isSupporting && styles.supporting]} onPress={onSupport}>
            <Ionicons name={isSupporting?'heart':'heart-outline'} size={18} color="#FFFFFF" />
            <Text style={styles.supportText}>{isSupporting ? 'Supporting' : 'Support'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width:'100%', height:110, backgroundColor:'#0D0D0D', overflow:'hidden', position:'relative' },
  coverOverlay: { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:PURPLE, opacity:0.12 },
  profileSection: { alignItems:'center', paddingHorizontal:spacing.md, paddingBottom:spacing.lg, borderBottomWidth:1, borderBottomColor:'#1A1A1A', marginTop:-44 },
  logoWrap: { position:'relative', marginBottom:spacing.sm },
  logo: { width:88, height:88, borderRadius:44, alignItems:'center', justifyContent:'center', borderWidth:3, borderColor:'#000000' },
  logoText: { fontSize:34, fontWeight:'800', color:'#FFFFFF' },
  badge: { position:'absolute', bottom:0, right:0, backgroundColor:'#000000', borderRadius:11 },
  name: { fontSize:typography.h3, fontWeight:'800', color:'#FFFFFF', marginBottom:4, textAlign:'center' },
  handle: { fontSize:typography.small, color:'#666666', marginBottom:spacing.md },
  statsRow: { flexDirection:'row', alignItems:'center', backgroundColor:'#111111', borderRadius:borderRadius.lg, paddingVertical:spacing.md, paddingHorizontal:spacing.xl, gap:spacing.xl, marginBottom:spacing.md, borderWidth:1, borderColor:'#1A1A1A' },
  statItem: { alignItems:'center' },
  statVal: { fontSize:typography.h4, fontWeight:'800', color:'#FFFFFF' },
  statLabel: { fontSize:11, color:'#666666', marginTop:2 },
  divider: { width:1, height:28, backgroundColor:'#2A2A2A' },
  actionRow: { flexDirection:'row', gap:spacing.sm, alignItems:'center' },
  supportBtn: { flexDirection:'row', alignItems:'center', gap:spacing.xs, backgroundColor:PURPLE, paddingHorizontal:spacing.lg, paddingVertical:spacing.sm, borderRadius:24 },
  supporting: { backgroundColor:'#1A1A1A', borderWidth:1, borderColor:PURPLE },
  supportText: { color:'#FFFFFF', fontSize:typography.body, fontWeight:'700' },
  shareBtn: { flexDirection:'row', alignItems:'center', gap:spacing.xs, backgroundColor:'#1A1A1A', paddingHorizontal:spacing.md, paddingVertical:spacing.sm, borderRadius:24, borderWidth:1, borderColor:'#2A2A2A' },
  shareBtnText: { color:'#FFFFFF', fontSize:typography.body, fontWeight:'600' },
  bellBtn: { width:44, height:44, backgroundColor:'#1A1A1A', borderRadius:22, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#2A2A2A' },
});
