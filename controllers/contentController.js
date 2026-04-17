const Content = require('../models/Content');

// Stub R2 functions - no external service needed
const checkR2Configuration = () => false;
const listVideosFromR2 = async () => [];

// Use MongoDB directly - no external service needed
const getUserPhotos = async (req, res) => {
    try {
        const photos = await Content.find({ 
            type: 'Photo',
            is_active: true
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: photos });
    } catch (error) {
        console.error('❌ getUserPhotos error:', error);
        res.status(500).json({ error: error.message });
    }
};

const saveUserPhoto = async (req, res) => {
    try {
        // BYPASS LOGIN: Use dummy user ID for testing
        const { userId, title, url, thumbnail, description, tags, category } = req.body;
        const effectiveUserId = userId || 'guest_user_' + Date.now();
        
        if (!url) {
            return res.status(400).json({ error: 'url is required (userId optional for testing)' });
        }

        const newPhoto = new Content({
            user_id: effectiveUserId,
            type: 'Photo',
            title: title || 'Untitled Photo (NO LOGIN)',
            url,
            thumbnail,
            description,
            tags,
            category,
            is_active: true
        });

        await newPhoto.save();
        res.status(201).json({ success: true, data: newPhoto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get videos from MongoDB
const getUserVideos = async (req, res) => {
    try {
        const videos = await Content.find({ 
            type: 'Video',
            is_active: true
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('❌ getUserVideos error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get stories from MongoDB
const getUserStories = async (req, res) => {
    try {
        const stories = await Content.find({ 
            type: 'Story',
            is_active: true
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: stories });
    } catch (error) {
        console.error('❌ getUserStories error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add getUserShayariPhotos - PUBLIC!
const getUserShayariPhotos = async (req, res) => {
    try {
        
        const shayariPhotos = await Content.find({ 
            type: 'ShayariPhoto'
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: shayariPhotos });
    } catch (error) {
        console.error('❌ Public getUserShayariPhotos error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get live streams from MongoDB
const getUserLive = async (req, res) => {
    try {
        const liveStreams = await Content.find({ 
            type: 'Live',
            is_active: true
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: liveStreams });
    } catch (error) {
        console.error('❌ getUserLive error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get reels from MongoDB
const getUserReels = async (req, res) => {
    try {
        const reels = await Content.find({ 
            type: 'Reel',
            is_active: true
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: reels });
    } catch (error) {
        console.error('❌ getUserReels error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get songs from MongoDB
const getUserSongs = async (req, res) => {
    try {
        const songs = await Content.find({ 
            type: 'Song',
            is_active: true
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: songs });
    } catch (error) {
        console.error('❌ getUserSongs error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserPhotos,
    saveUserPhoto,
    getUserVideos,
    getUserStories,
    getUserShayariPhotos,
    getUserLive,
    getUserReels,
    getUserSongs
};
