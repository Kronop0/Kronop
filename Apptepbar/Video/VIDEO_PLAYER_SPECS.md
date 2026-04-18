# Kronop Long Video Player - Technical Specification

> Reference document for building world-class video player in React Native Expo

## FINAL DECISIONS (Locked)
- **Video Engine:** `expo-av` (already installed, stable, works on old phones)
- **Storage:** Cloudflare R2 (no server crash, unlimited storage)
- **Formats:** HLS (.m3u8) + Direct MP4 (both supported)
- **Rule:** NO MOCK DATA - Only real implementation


---

## 1. Video Engine Comparison

### ✅ SELECTED: expo-av
```javascript
// Already installed: "expo-av": "~16.0.8"
// Supports: HLS (.m3u8) + MP4
// Works on: Android 7+ / iOS 12+
```
- Native iOS (AVPlayer) & Android (MediaPlayer)
- HLS support via native players
- Stable, battle-tested
- No additional native config

### Storage: Cloudflare R2
```
Why R2:
- Zero egress fees (unlike S3)
- S3-compatible API
- Unlimited storage
- No server bandwidth load
- CDN integration ready
```

### Backup: react-native-vlc-media-player
- Use for: Unusual formats, network resilience
- Cons: Large bundle size

---

## 2. Streaming Format: HLS (HTTP Live Streaming)

### Why HLS for Long Videos?
- Adaptive bitrate (auto quality switch)
- Chunk-based delivery (6-10 sec segments)
- Faster start, less buffering
- Native iOS/Android support
- CDN ready (CloudFront, Fastly)

### Implementation Specs
- Master playlist: `.m3u8`
- Qualities: 240p / 360p / 480p / 720p / 1080p
- Segment duration: 6-10 seconds (optimal)
- Audio: Multiple track support

### Dual Format Support
```typescript
// Player auto-detects format
const videoSource = {
  uri: url, // .m3u8 for HLS or .mp4 for direct
  headers: { /* auth if needed */ }
};
```

**HLS (.m3u8):**
- Long videos (10+ minutes)
- Adaptive quality
- Resume/seek fast
- Use with R2 + CDN

**Direct MP4:**
- Short clips (< 5 min)
- Simple implementation
- Full download before play
- Fallback option

---

## 3. Required Features Checklist

### Core Playback
- [ ] Adaptive quality switching
- [ ] Preload next 2-3 segments
- [ ] Background audio playback
- [ ] Audio-only mode toggle
- [ ] Sleep timer (auto-pause)

### Buffer Management Strategy
```
minBuffer: 10 seconds    // Fast start
maxBuffer: 60 seconds   // Memory limit
rebufferTarget: 5 seconds
retryStrategy: Exponential backoff
```

### Gesture Controls (MUST HAVE)
| Gesture | Action |
|---------|--------|
| Tap center | Play/Pause toggle |
| Double tap left | Seek -10 seconds |
| Double tap right | Seek +10 seconds |
| Horizontal swipe | Seek with thumbnail preview |
| Vertical swipe left | Brightness control |
| Vertical swipe right | Volume control |
| Pinch | Zoom (optional) |

### Advanced Features
- [ ] Offline download (HLS to local)
- [ ] Chromecast / AirPlay
- [ ] Subtitles (WebVTT, SRT)
- [ ] Multiple audio tracks
- [ ] Playback speed (0.5x - 2x)
- [ ] Resume from last position
- [ ] Thumbnail preview on seek (sprite sheets)
- [ ] Picture-in-Picture mode

---

## 4. Architecture: Crash-Proof Design

### Component Hierarchy
```
PlayerScreen
├── VideoPlayer (expo-video)
├── GestureHandler (react-native-gesture-handler)
├── ControlsOverlay (Custom UI)
├── BufferIndicator (Loading states)
└── ErrorBoundary (Crash recovery)
```

### Memory Management Rules
1. ALWAYS pause before unmounting
2. Release player instance on cleanup
3. Limit to 1 concurrent player instance
4. Clear buffer when switching videos
5. Use low-res preview images (not video)

### State Machine
```
LOADING → BUFFERING → PLAYING → PAUSED → ENDED
   ↓          ↓          ↓         ↓
ERROR     RECOVERING  SEEKING  BACKGROUND
```

### Error Recovery Matrix
| Error Type | Handling |
|------------|----------|
| Network Error | Retry 3x with exponential delay |
| Decode Error | Auto-switch to lower quality |
| Timeout | Show "Check connection" |
| Out of Memory | Reduce buffer size dynamically |
| 404/Not Found | Show error + back button |

---

## 5. Development Roadmap

### COMPLETED: Step 1 - Foundation
- [x] Migrated from deprecated `expo-av` to `expo-video`
- [x] Created `KronopVideoPlayer` component with HLS + MP4 support
- [x] Working video URLs (no 403 errors)
- [x] Double tap seek (-10s / +10s)
- [x] Auto-hide controls
- [x] Error handling with retry
- [x] Progress tracking
- [x] Memory-safe unmount handling

### COMPLETED: R2 Cloud Storage Integration
- [x] `dataService.ts` - Now fetches from R2 cloud storage
- [x] `r2Service.ts` - AWS Signature V4 authentication for R2
- [x] `useVideos.ts` - Updated for async operations
- [x] Videos fetch directly from `kronop-video` bucket
- [x] Thumbnails from `kronop-video-tha` bucket
- [x] NO MOCK DATA - All data from R2 clouds (all 6 gestures)
- [ ] Fullscreen landscape mode
- [ ] Quality selector UI
- [ ] Buffer indicator
- [ ] Error states

### Phase 2: Core Experience (Week 3-4)
- [ ] Gesture controls (all 6 gestures)
- [ ] Fullscreen landscape mode
- [ ] Quality selector UI
- [ ] Buffer indicator
- [ ] Error states

### Phase 3: Premium Features (Week 5-6)
- [ ] Background audio
- [ ] Picture-in-Picture
- [ ] Download for offline
- [ ] Subtitles support
- [ ] Playback speed control

### Phase 4: Polish (Week 7-8)
- [ ] Thumbnail preview on seek
- [ ] Sleep timer
- [ ] Casting (Chromecast/AirPlay)
- [ ] Analytics integration
- [ ] Performance optimization

---

## 6. Technical Stack

| Layer | Library |
|-------|---------|
| Video Engine | `expo-video` |
| Gestures | `react-native-gesture-handler` |
| Animations | `react-native-reanimated` |
| State Management | Zustand / Context API |
| Navigation | Expo Router |
| Backend | Supabase (already setup) |
| Streaming | HLS with CDN |

---

## 7. Code Snippets (Reference)

### Basic Player Setup
```typescript
import { useVideoPlayer, VideoView } from 'expo-video';

const player = useVideoPlayer(videoUri, player => {
  player.loop = false;
  player.play();
});

<VideoView
  player={player}
  allowsFullscreen
  allowsPictureInPicture
  nativeControls={false} // Custom controls
/>
```

### HLS Configuration
```typescript
const videoSource = {
  uri: 'https://cdn.kronop.com/video/123/master.m3u8',
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
};
```

### Buffer Settings
```typescript
player.bufferOptions = {
  minBufferMs: 10000,
  maxBufferMs: 60000,
  bufferForPlaybackMs: 5000,
  bufferForPlaybackAfterRebufferMs: 5000,
};
```

---

## 8. Performance Checklist

- [ ] Video dimensions match screen (no upscaling)
- [ ] Dispose player when screen unmounts
- [ ] Use `resizeMode="contain"` or `"cover"`
- [ ] Disable video when app in background (if no audio)
- [ ] Compress thumbnail images
- [ ] Lazy load video metadata
- [ ] Use CDN for all video content

---

## 9. Testing Scenarios

1. Slow network (2G/3G) - Quality drops?
2. Airplane mode - Error handling?
3. Background switch - Audio continues?
4. Phone call incoming - Auto-pause?
5. 2-hour video - Seek performance?
6. Rapid seeking - Buffer recovery?
7. Low battery - Performance maintained?
8. Old Android (API 24) - Compatibility?

---

**Created:** Technical reference for Kronop Video Player
**Status:** Ready for implementation
