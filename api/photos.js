const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

// GET /api/photos - Get photos with direct URLs (no signed URLs needed)
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = Math.min(parseInt(limit), 50);
  
  try {
    if (category && category !== 'all') {
      const categoryPhotos = await Content.find({
        type: 'Photo',
        category: category,
        is_active: true
      })
      .sort({ created_at: -1 })
      .limit(parsedLimit)
      .select('title url thumbnail tags category views likes created_at user_id filename');
      
      return res.json({
        success: true,
        data: categoryPhotos,
        message: `Photos in category: ${category}`,
        isCategoryFilter: true
      });
    }

    const photos = await Content.find({
      type: 'Photo',
      is_active: true
    })
    .sort({ created_at: -1 })
    .limit(parsedLimit)
    .select('title url thumbnail tags category views likes created_at user_id filename');

    res.json({
      success: true,
      data: photos,
      message: 'Photos retrieved successfully',
      pageInfo: {
        currentPage: parsedPage,
        itemsPerPage: parsedLimit,
        totalItems: photos.length
      }
    });

  } catch (error) {
    console.error('❌ Photos feed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: []
    });
  }
});

// GET /api/photos/user - Get user's own photos
router.get('/user', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const effectiveUserId = userId || process.env.DEFAULT_USER_ID || null;
    
    const content = await Content.find({ 
      user_id: effectiveUserId, 
      type: 'Photo',
      is_active: true 
    })
    .sort({ created_at: -1 })
    .limit(parseInt(limit));
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('User photos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/photos/categories - Get available photo categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Content.distinct('category', {
      type: 'Photo',
      is_active: true,
      category: { $ne: '', $exists: true }
    });
    
    res.json({
      success: true,
      data: categories.sort(),
      message: 'Photo categories retrieved successfully'
    });
  } catch (error) {
    console.error('Photo categories error:', error);
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/photos/:id/like - Like a photo
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findByIdAndUpdate(
      id, 
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Photo like error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/photos/:id/view - Track view
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await Content.findByIdAndUpdate(
      id, 
      { $inc: { views: 1 } },
      { new: true }
    );
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Photo view error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/photos/:id/save - Save a photo
router.post('/:id/save', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Simple implementation - just return success
    const result = { saved: true, contentId: id, userId };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Photo save error:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
