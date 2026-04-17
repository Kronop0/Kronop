const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const multer = require('multer');
const { mongoose, connectToDatabase } = require('./config/db');
const cors = require('cors');
const axios = require('axios');
const socketIo = require('socket.io');
require('tsx/cjs');

// Middleware
const { verifyToken } = require('./middleware/authMiddleware');

// Models & Services
const User = require('./models/User');
const Content = require('./models/Content');

// Stub SignedUrlService to prevent reference errors
const SignedUrlService = {
  generateSignedUrl: (url) => url // Return URL as-is for public access
};

// Stub RedisCacheService
const RedisCacheService = {
  client: {
    get: async () => null,
    setex: async () => {},
    del: async () => {}
  }
};

// Story Limitation System for 24-hour auto-delete
const storyLimitation = require('./components/upload/story.jsa/storyLimitation');

const fetchContentByType = async (type, limit = 100) => {
  const docs = await Content.find({ type, is_active: true })
    .sort({ created_at: -1 })
    .limit(limit)
    .select('title url thumbnail tags category views likes created_at updatedAt user_id');

  return docs.map((doc) => {
    const item = doc.toObject();
    if (type === 'Reel' || type === 'Video' || type === 'Live') {
      item.videoUrl = item.url;
    }
    return item;
  });
};

// Routes
const contentRoutes = require('./api/content');
const userRoutes = require('./api/users');
const authRoutes = require('./api/auth');
const notificationRoutes = require('./api/notifications');
const autosyncRoutes = require('./api/autosync');
const supportRoutes = require('./api/support');
const viralRoutes = require('./api/viral');
const userRouteNew = require('./routes/user');
const contentRouteNew = require('./routes/content');
const storageRoutes = require('./routes/storageRoutes');

// App Setup
const app = express();
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';
const apiRouter = express.Router();
const MONGO_URI = process.env.MONGODB_URI || process.env.EXPO_PUBLIC_MONGODB_URI;
const ROOT_DIR = path.resolve(process.cwd());
const UPLOADS_DIR = path.resolve(ROOT_DIR, 'uploads');
const HLS_DIR = path.resolve(ROOT_DIR, 'hls');

// Error handling
process.on('unhandledRejection', (reason) => console.error('Unhandled Promise Rejection:', reason));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));

// Ensure directories exist
[UPLOADS_DIR, HLS_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.warn(`Warning: Could not create directory ${dir}:`, error.message);
  }
});

// Middleware
app.set('trust proxy', true);
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  }
});

// Request logging (simplified)
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Forwarded-For', 'X-Real-IP', 'Origin', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with error boundaries
if (!MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGODB_URI is not defined in environment variables.');
  console.error('🚀 Server will start but database features will be disabled');
} else {
  mongoose.connection.once('connected', async () => {
    try {
      await User.syncIndexes();
      console.log('✅ MongoDB connected and indexes synced');
    } catch (err) {
      console.error('❌ Database service initialization failed:', err.message);
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔄 Retrying connection...');
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Will attempt to reconnect...');
  });

  // Connect with retry logic
  const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await connectToDatabase();
        console.log('✅ MongoDB connection established');
        return;
      } catch (err) {
        console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
        if (i < retries - 1) {
          console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error('❌ All MongoDB connection attempts failed');
          console.error('🚀 Server will continue but database features are disabled');
        }
      }
    }
  };

  connectWithRetry().catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });
}

// Health check endpoints
app.get('/render/health', async (req, res) => {
  try {
    const dbConnected = mongoose.connection && mongoose.connection.readyState === 1;
    const mongoUri = process.env.MONGODB_URI || process.env.EXPO_PUBLIC_MONGODB_URI;
    
    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      platform: 'Render',
      database: { connected: dbConnected, uriSet: !!mongoUri }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Health check failed', error: error.message });
  }
});

app.get('/', (req, res) => res.send('Kronop server running'));

app.get('/debug/database', async (req, res) => {
  try {
    const dbConnected = mongoose.connection && mongoose.connection.readyState === 1;
    const debug = {
      dbConnected,
      mongoUri: process.env.MONGODB_URI || process.env.EXPO_PUBLIC_MONGODB_URI ? 'SET' : 'NOT SET',
      timestamp: new Date().toISOString()
    };
    
    if (dbConnected) {
      const counts = await Promise.all([
        Content.countDocuments({ is_active: true }),
        Content.countDocuments({ type: 'Photo', is_active: true }),
        Content.countDocuments({ type: 'Video', is_active: true }),
        Content.countDocuments({ type: 'Story', is_active: true })
      ]);
      
      debug.content = { total: counts[0], photos: counts[1], videos: counts[2], stories: counts[3] };
    }
    
    res.json({ success: true, debug });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Router setup
apiRouter.get('/', (req, res) => res.json({ ok: true }));
apiRouter.get('/health', (req, res) => {
  try {
    const dbConnected = mongoose.connection && mongoose.connection.readyState === 1;
    res.json({ ok: true, dbConnected });
  } catch (_e) {
    res.status(500).json({ ok: false, error: 'health_check_failed' });
  }
});

// Route registration
apiRouter.use('/content', contentRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/viral', viralRoutes);
apiRouter.use('/support', supportRoutes);
apiRouter.use('/storage', storageRoutes);

// Auto-sync routes - Service removed
apiRouter.get('/sync/status', (req, res) => {
  res.json({ success: false, message: 'AutoSync service removed' });
});

apiRouter.post('/sync/trigger', async (req, res) => {
  res.json({ success: false, message: 'AutoSync service removed' });
});

app.use('/api', apiRouter);
app.use('/api/content', contentRouteNew);
app.use('/api/users', userRouteNew);
app.use('/content', contentRouteNew);
app.use('/users', userRouteNew);
app.use('/notifications', notificationRoutes);
app.use('/autosync', autosyncRoutes);

// User profile endpoint
app.get('/api/users/profile', async (req, res) => {
  try {
    const { userId, phone } = req.query;
    let query = {};
    if (userId) query._id = userId;
    else if (phone) query.phone = phone;
    else {
      const firstUser = await User.findOne({}, 'username bio profile_pic');
      return firstUser ? res.json({ success: true, data: firstUser }) : res.status(404).json({ error: 'User not found' });
    }

    const user = await User.findOne(query, 'username bio profile_pic');
    user ? res.json({ success: true, data: user }) : res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Cache middleware
const cacheMiddleware = (cacheKey, ttl = 300) => async (req, res, next) => {
  try {
    const key = typeof cacheKey === 'function' ? cacheKey(req) : cacheKey;
    const cached = await RedisCacheService.client.get(key);
    if (cached) return res.json(JSON.parse(cached));
    
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      RedisCacheService.client.setex(key, ttl, JSON.stringify(data)).catch(() => {});
      return originalJson(data);
    };
    next();
  } catch (error) {
    next();
  }
};

// Smart feed helper
const getSmartFeed = async (contentType, req, res) => {
  try {
    const { page = 1, limit = 20, userId, category } = req.query;
    const fieldList = typeof req.query.fields === 'string' ? req.query.fields.split(',') : null;
    
    // Category filter
    if (category && category !== 'all') {
      const items = await Content.find({ type: contentType, category, is_active: true })
        .sort({ created_at: -1 }).limit(parseInt(limit))
        .select('title url thumbnail tags category views likes created_at user_id');
      // TODO: Implement SignedUrlService when available
      return res.json({ success: true, data: items, message: `${contentType}s in ${category}` });
    }
    
    // Trending content for no userId
    if (!userId) {
      const trending = await UserInterestTrackingService.getTrendingContent(contentType, parseInt(limit));
      // TODO: Implement SignedUrlService when available
      return res.json({ success: true, data: trending, message: `Trending ${contentType}s` });
    }
    
    // Smart feed based on user interests
    const userProfile = await UserInterestTrackingService.getUserInterestProfile(userId);
    if (userProfile.isNewUser || userProfile.totalInteractions < 5) {
      const trending = await UserInterestTrackingService.getTrendingContent(contentType, parseInt(limit));
      // TODO: Implement SignedUrlService when available
      return res.json({ success: true, data: trending, message: `Trending ${contentType}s for new user` });
    }
    
    const topCategories = userProfile.topCategories.map(cat => cat.category);
    const query = { type: contentType, is_active: true };
    if (topCategories.length > 0) query.$or = [{ category: { $in: topCategories } }, { tags: { $in: topCategories } }];
    
    let items = await Content.find(query).sort({ created_at: -1 }).limit(parseInt(limit) * 2)
      .select('title url thumbnail tags category views likes created_at user_id');
    
    // Calculate relevance scores
    const itemsWithRelevance = await Promise.all(items.map(async item => {
      const relevance = await UserInterestTrackingService.calculateContentRelevance(userId, item);
      return { ...item.toObject(), relevanceScore: relevance.score, matchedInterests: relevance.matchedInterests };
    }));
    
    itemsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
    // TODO: Implement SignedUrlService when available
    const data = itemsWithRelevance.slice(0, parseInt(limit));
    
    res.json({ success: true, data, message: `Smart ${contentType} feed`, isSmartFeed: true });
  } catch (error) {
    res.json({ success: false, error: 'Content service unavailable', data: [] });
  }
};

// Content routes - All 6 features connected to proper R2 controllers
// Reels API
apiRouter.get('/reels', async (req, res) => {
  try {
    const reels = await fetchContentByType('Reel');
    res.json({ success: true, data: reels });
  } catch (error) {
    console.error('❌ /api/reels error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Video API
apiRouter.get('/videos', async (req, res) => {
  try {
    const videos = await fetchContentByType('Video');
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error('❌ /api/videos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Song API
apiRouter.get('/songs', async (req, res) => {
  try {
    const songs = await fetchContentByType('Song');
    res.json({ success: true, data: songs });
  } catch (error) {
    console.error('❌ /api/songs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Live API
apiRouter.get('/live', async (req, res) => {
  try {
    const liveStreams = await fetchContentByType('Live');
    res.json({ success: true, data: liveStreams });
  } catch (error) {
    console.error('❌ /api/live error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Photo API
apiRouter.get('/photos', async (req, res) => {
  try {
    const photos = await fetchContentByType('Photo');
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('❌ /api/photos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Story API
apiRouter.get('/stories', async (req, res) => {
  try {
    const stories = await fetchContentByType('Story');
    res.json({ success: true, data: stories });
  } catch (error) {
    console.error('❌ /api/stories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Notes API
apiRouter.get('/notes', async (req, res) => {
  try {
    const notes = await fetchContentByType('Note');
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('❌ /api/notes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Content type routes (video, live, stories) - OLD EMPTY ROUTES REPLACED
// These are kept for backward compatibility but now use proper controllers

// Static files and streaming
app.get('/stream/:filename', (req, res) => {
  const filePath = path.join(HLS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).send('Stream not found');
  }
});

app.use('/hls', express.static(HLS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Upload URL generation
app.post('/upload/url', async (req, res) => {
  try {
    const { contentType, fileName, fileSize } = req.body;
    console.log(`🔗 Upload URL requested for ${contentType}:`, { fileName, fileSize });
    
    let uploadUrl, contentId;
    const contentTypes = {
      video: { libraryId: '593795', api: 'video' },
      live: { libraryId: '594452', api: 'video' },
      photo: { zone: 'photu', api: 'storage' },
      shayari: { zone: 'shayar', api: 'storage' },
      story: { zone: 'storiy', api: 'storage' }
    };
    
    const config = contentTypes[contentType?.toLowerCase()];
    if (!config) throw new Error(`Unsupported content type: ${contentType}`);
    
    contentId = `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Fallback disabled
    uploadUrl = '';
    res.json({ success: false, error: 'Upload service disabled', uploadUrl: '', contentId: '', contentType: '', fileName: '', fileSize: 0 });
  } catch (error) {
    console.error('❌ Upload URL generation failed:', error);
    res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
});

// Additional API routes
apiRouter.get('/users/profile', cacheMiddleware((req) => `profile:${req.query.userId || req.query.firebaseUid || 'anon'}`, 600), async (req, res) => {
  try {
    const { userId, firebaseUid, phone } = req.query;
    let query = {};
    if (userId) query._id = userId;
    else if (firebaseUid) query.firebaseUid = firebaseUid;
    else if (phone) query.phone = phone;
    else return res.status(400).json({ error: 'Missing identifier' });

    const user = await User.findOne(query);
    user ? res.json({ success: true, data: user }) : res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/content/photo/user', async (req, res) => {
  try {
    const photos = await fetchContentByType('Photo');
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('❌ /api/content/photo/user error:', error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/content/story', async (req, res) => {
  try {
    const stories = await fetchContentByType('Story');
    res.json({ success: true, data: stories });
  } catch (error) {
    console.error('❌ /api/content/story error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
const getOrCreateDummyUser = async (userId = null) => {
  const effectiveUserId = userId || 'guest_user_' + Date.now();
  let user = await User.findOne({ _id: effectiveUserId });
  if (!user) {
    user = new User({ _id: effectiveUserId, displayName: 'Guest User', email: 'guest@example.com', phone: '0000000000' });
    await user.save();
  }
  return effectiveUserId;
};

const sendBroadcastUploadNotification = async (uploadType, contentDoc) => {
  try {
    const notifications = {
      song: { title: 'नया गाना आया है!', body: 'अरे वाह! किसी ने एक नया गाना शेयर किया है, अभी सुनें! 🎵' },
      shayari: { title: 'नई शायरी पोस्ट हुई है!', body: 'एक नई शायरी पोस्ट हुई है, दिल जीत लेगी! ✍️' },
      live: { title: 'Live शुरू हो गया!', body: 'जल्दी आओ! कोई लाइव आया है! 🔴' },
      story: { title: 'नई स्टोरी!', body: 'किसी ने अभी नई स्टोरी डाली है, देखो अभी! 📸' },
      photo: { title: 'नई फोटो!', body: 'नई फोटो अपलोड हुई है—देखो अभी! 🖼️' },
      video: { title: 'नई वीडियो!', body: 'नई वीडियो अपलोड हुई है—अभी प्ले करें! ▶️' }
    };
    
    const { title, body } = notifications[uploadType?.toLowerCase()] || { title: 'नया अपलोड!', body: 'किसी ने नया कंटेंट अपलोड किया है—देखो अभी!' };
    const appId = (process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '').trim();
    if (!appId) throw new Error('OneSignal App ID missing');

    const notification = {
      app_id: appId,
      included_segments: ['All'],
      headings: { en: title },
      contents: { en: body },
      data: { type: uploadType?.toLowerCase(), contentId: contentDoc?._id?.toString?.() }
    };

    const url = process.env.EXPO_PUBLIC_ONESIGNAL_API_URL || process.env.ONESIGNAL_API_URL || 'https://onesignal.com/api/v1/notifications';
    const apiKey = (process.env.ONESIGNAL_REST_API_KEY || process.env.ONE_SIGNAL_REST_API_KEY || process.env.ONESIGNAL_API_KEY || process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY || '').trim();
    if (!apiKey) throw new Error('OneSignal REST API key is missing');

    const isV2Key = apiKey.startsWith('os_v2_');
    const primaryAuth = isV2Key ? `Key ${apiKey}` : `Basic ${apiKey}`;
    const fallbackAuth = isV2Key ? `Basic ${apiKey}` : `Key ${apiKey}`;

    try {
      return await axios.post(url, notification, { headers: { 'Content-Type': 'application/json', 'Authorization': primaryAuth } });
    } catch (error) {
      if ((error.response?.status === 401 || error.response?.status === 403) && fallbackAuth !== primaryAuth) {
        return await axios.post(url, notification, { headers: { 'Content-Type': 'application/json', 'Authorization': fallbackAuth } });
      }
      throw error;
    }
  } catch (error) {
    console.warn('⚠️ OneSignal notification failed:', error.message);
  }
};

// Generic upload endpoint
const createUploadEndpoint = (contentType, extraFields = {}) => async (req, res) => {
  try {
    const { title, url, thumbnail, description, tags, userId } = req.body;
    const effectiveUserId = await getOrCreateDummyUser(userId);
    
    if (!url) return res.status(400).json({ error: 'url is required' });

    const contentData = {
      user_id: effectiveUserId,
      type: contentType === 'shayari' ? 'ShayariPhoto' : contentType.charAt(0).toUpperCase() + contentType.slice(1),
      title: title || `Untitled ${contentType} (NO LOGIN)`,
      url,
      thumbnail,
      description,
      tags,
      is_active: true,
      ...extraFields
    };

    const newContent = new Content(contentData);
    await newContent.save();
    
    try {
      await sendBroadcastUploadNotification(contentType, newContent);
    } catch (notifyError) {
      console.warn('⚠️ OneSignal notification failed:', notifyError?.message);
    }
    
    res.status(201).json({ success: true, data: newContent, message: `${contentType} uploaded successfully (NO LOGIN)` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Public upload endpoints (NO LOGIN) - Old reel upload removed, now using AllReels system
app.post('/upload/video', createUploadEndpoint('video'));
app.post('/upload/live', (req, res) => createUploadEndpoint('live', { streamKey: req.body.streamKey })(req, res));
app.post('/upload/story', (req, res) => createUploadEndpoint('story', { expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) })(req, res));
app.post('/upload/shayari', (req, res) => createUploadEndpoint('shayari', { shayari_text: req.body.shayari_text, shayari_author: req.body.shayari_author })(req, res));
app.post('/upload/photo', (req, res) => createUploadEndpoint('photo', { category: req.body.category })(req, res));

// Story management endpoints
apiRouter.get('/stories/stats', async (req, res) => {
  try {
    const stats = await storyLimitation.getStoryStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/stories/cleanup', async (req, res) => {
  try {
    const result = await storyLimitation.deleteExpiredStories();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Additional endpoints
apiRouter.get('/shayari/random', async (req, res) => {
  try {
    const shayari = await Content.aggregate([{ $match: { type: 'ShayariPhoto', is_active: true } }, { $sample: { size: 1 } }]);
    if (shayari.length === 0) {
      return res.json({ success: true, data: {
        _id: 'fallback', type: 'ShayariPhoto',
        shayari_text: 'दिल की बात जुबां पर आना आसान नहीं है,\nहर किसी को अपनी मोहब्बत का इज़हार करना आसान नहीं है।',
        shayari_author: 'Anonymous', title: 'Romantic Shayari'
      }});
    }
    res.json({ success: true, data: shayari[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api', (req, res) => res.status(404).json({ ok: false, error: 'not_found', path: req.originalUrl }));
app.use('/notifications', (req, res) => res.status(404).json({ ok: false, error: 'not_found', path: req.originalUrl }));

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err?.status || err?.statusCode || 500;
  const isApi = req.originalUrl?.startsWith('/api') || req.originalUrl?.startsWith('/notifications');
  if (isApi) {
    return res.status(status).json({ ok: false, error: err?.message || 'server_error' });
  }
  res.status(status).send(err?.message || 'Server Error');
});

// Server startup - Shared HTTP + Socket.io server
const server = http.createServer(app);

// Socket.io attached to same server (no separate port)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const clients = new Set();

io.on('connection', (socket) => {
  // Extract token from query params or handshake for Socket.io auth
  const token = socket.handshake.query.token || socket.handshake.auth.token;

  if (!token) {
    console.log('[SOCKET.IO]: Connection rejected - no token provided');
    socket.disconnect(true);
    return;
  }

  // Verify token
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || process.env.EXPO_PUBLIC_JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.sub || decoded.id || decoded.userId;
    socket.isAuthenticated = true;
  } catch (error) {
    console.log('[SOCKET.IO]: Connection rejected - invalid token');
    socket.disconnect(true);
    return;
  }

  console.log(`[SOCKET.IO]: Authenticated client connected from ${socket.handshake.address}, user: ${socket.userId}`);
  clients.add(socket);

  socket.emit('connected', { message: 'Socket.io connection established', timestamp: new Date().toISOString() });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', () => {
    clients.delete(socket);
  });
});

const broadcast = (message) => {
  console.log(`[SOCKET.IO]: Broadcasting to ${clients.size} clients:`, message.type);

  clients.forEach(client => {
    if (client.connected) {
      try {
        client.emit('broadcast', message);
      } catch (error) {
        clients.delete(client);
      }
    } else {
      clients.delete(client);
    }
  });
};

server.listen(PORT, HOST, async () => {
  console.log(`Kronop server listening on http://0.0.0.0:${PORT}`);
  
  // Wait for MongoDB connection
  const waitForMongoDB = () => new Promise((resolve, reject) => {
    const maxWait = 30000;
    const start = Date.now();
    const check = () => {
      if (mongoose.connection.readyState === 1) resolve();
      else if (Date.now() - start > maxWait) reject(new Error('MongoDB connection timeout'));
      else setTimeout(check, 1000);
    };
    check();
  });
  
  try {
    await waitForMongoDB();
    console.log('🔄 ScalingOrchestrator service removed');
  } catch (error) {
    console.error('❌ Scaling System Failed:', error.message);
  }
  
  console.log('🔄 RealtimeService removed');
});


// Start story auto-cleanup scheduler
console.log('⏰ Starting story auto-cleanup scheduler...');
const stopStoryCleanup = storyLimitation.startAutoCleanup();

// MongoDB Change Streams
mongoose.connection.once('open', () => {
  console.log('[SOCKET.IO]: Setting up MongoDB Change Streams...');

  const contentSchema = mongoose.models.Content;
  if (contentSchema) {
    const changeStream = contentSchema.watch();

    changeStream.on('change', (change) => {
      const fullDocument = change.fullDocument;
      if (fullDocument) {
        const eventType = change.operationType === 'insert' ? 'content_added' :
                         change.operationType === 'update' ? 'content_updated' :
                         change.operationType === 'delete' ? 'content_deleted' : 'content_changed';

        broadcast({
          type: eventType,
          contentType: fullDocument.type.toLowerCase(),
          data: {
            id: fullDocument._id.toString(),
            id: fullDocument._id.toString(),
            url: fullDocument.url,
            thumbnail_url: fullDocument.thumbnail,
            title: fullDocument.title,
            type: fullDocument.type.toLowerCase(),
            created_at: fullDocument.created_at,
            updated_at: fullDocument.updated_at
          },
          timestamp: new Date().toISOString()
        });
      }
    });

    changeStream.on('error', (error) => console.error('[SOCKET.IO]: Change Stream error:', error));
    console.log('[SOCKET.IO]: Change Stream setup complete');
  }

  // Auto-Sync Scheduler - Service removed
  console.log('🔄 Auto-Sync Scheduler service removed');
});

global.broadcastToClients = broadcast;
console.log('🚀 Real-time WebSocket system loaded');


