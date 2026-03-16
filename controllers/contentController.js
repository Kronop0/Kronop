const Content = require('../models/Content');

const getUserPhotos = async (req, res) => {
    try {
        
        const photos = await Content.find({ 
            type: 'Photo'
        }).sort({ created_at: -1 }).limit(100);

        res.json({ success: true, data: photos });
    } catch (error) {
        console.error('❌ Public getUserPhotos error:', error);
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


const { listVideosFromR2, checkR2Configuration } = require('../services/r2VideoService');

console.log('🎬 Content Controller Loading - R2 Direct Cloud Version');

// Add missing getUserVideos - NOW USING R2 DIRECT CLOUD!
const getUserVideos = async (req, res) => {
    try {
        console.log('🎬 getUserVideos called - Using R2 Direct Cloud');
        console.log('📅 Timestamp:', new Date().toISOString());
        console.log('🌐 Request from:', req.ip || 'unknown');
        
        // Check R2 configuration
        console.log('🔧 Checking R2 configuration...');
        const isConfigValid = checkR2Configuration();
        
        if (!isConfigValid) {
            console.log('❌ R2 configuration check failed');
            return res.status(500).json({ 
                success: false, 
                error: 'R2 storage not properly configured' 
            });
        }

        console.log('✅ R2 configuration valid, fetching videos...');
        
        // Get videos directly from R2 bucket
        const videos = await listVideosFromR2();
        
        console.log(`📊 Returning ${videos.length} videos from R2 cloud storage`);
        console.log('📋 Video titles:', videos.map(v => v.title));
        
        const response = {
            success: true, 
            data: videos,
            source: 'r2-cloud-direct',
            total: videos.length,
            timestamp: new Date().toISOString(),
            message: `Successfully fetched ${videos.length} videos from R2 cloud storage`
        };
        
        console.log('📤 Sending response to client');
        console.log('📊 Response summary:', {
            success: response.success,
            source: response.source,
            total: response.total,
            hasData: response.data.length > 0
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ R2 getUserVideos error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        const errorResponse = { 
            success: false, 
            error: error.message,
            timestamp: new Date().toISOString(),
            source: 'r2-cloud-direct-error'
        };
        
        console.log('📤 Sending error response to client');
        res.status(500).json(errorResponse);
    }
};

// Add missing getUserStories - NOW PUBLIC!
const getUserStories = async (req, res) => {
    try {
        // Service disabled - returning empty data
        res.json({ success: true, data: [] });
    } catch (error) {
        console.error('❌ Public getUserStories error:', error);
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

module.exports = {
    getUserPhotos,
    saveUserPhoto,
    getUserVideos,
    getUserStories,
    getUserShayariPhotos
};
