const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Story View Schema for tracking views and stars
const StoryViewSchema = new mongoose.Schema({
  storyId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  viewedAt: { type: Date, default: Date.now, index: true },
  hasStarred: { type: Boolean, default: false },
  starredAt: { type: Date },
}, {
  timestamps: true,
  // Compound index to prevent duplicate views
  index: { storyId: 1, userId: 1 },
  unique: true
});

const StoryView = mongoose.model('StoryView', StoryViewSchema);

// Story routes for mobile app
router.get('/', async (req, res) => {
  try {
    res.json({ success: true, message: 'Stories endpoint working' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/stories/:storyId/view - Record a story view
router.post('/:storyId/view', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId, viewedAt } = req.body;

    if (!storyId || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'storyId and userId are required' 
      });
    }

    console.log(`[KRONOP-DEBUG] 👀 Recording story view: storyId=${storyId}, userId=${userId}`);

    // Check if user has already viewed this story
    const existingView = await StoryView.findOne({ storyId, userId });
    
    if (existingView) {
      console.log(`[KRONOP-DEBUG] ℹ️ User ${userId} has already viewed story ${storyId}`);
      return res.json({ 
        success: true, 
        message: 'Story already viewed',
        alreadyViewed: true,
        viewId: existingView._id
      });
    }

    // Get user details (you might want to fetch from User model)
    let userName = `user_${userId.slice(-4)}`;
    let userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8B00FF&color=fff&size=40`;
    
    try {
      // Try to get user details from User model if it exists
      const User = mongoose.models.User;
      if (User) {
        const user = await User.findById(userId);
        if (user) {
          userName = user.userName || user.name || userName;
          userAvatar = user.avatar || user.profilePicture || userAvatar;
        }
      }
    } catch (userError) {
      console.log('[KRONOP-DEBUG] ⚠️ Could not fetch user details, using defaults');
    }

    // Create new view record
    const newView = new StoryView({
      storyId,
      userId,
      userName,
      userAvatar,
      viewedAt: viewedAt ? new Date(viewedAt) : new Date(),
      hasStarred: false
    });

    await newView.save();

    console.log(`[KRONOP-DEBUG] ✅ Story view recorded: ${newView._id}`);

    res.json({ 
      success: true, 
      message: 'Story view recorded successfully',
      viewId: newView._id,
      viewCount: await StoryView.countDocuments({ storyId })
    });

  } catch (error) {
    console.error('[KRONOP-DEBUG] ❌ Error recording story view:', error);
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      return res.json({ 
        success: true, 
        message: 'Story already viewed',
        alreadyViewed: true
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/stories/:storyId/views - Get all views for a story
router.get('/:storyId/views', async (req, res) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      return res.status(400).json({ 
        success: false, 
        error: 'storyId is required' 
      });
    }

    console.log(`[KRONOP-DEBUG] 📊 Fetching views for story: ${storyId}`);

    // Fetch all views for this story, sorted by most recent
    const views = await StoryView.find({ storyId })
      .sort({ viewedAt: -1 })
      .lean(); // Convert to plain JavaScript objects

    // Transform the data to match frontend interface
    const transformedViews = views.map(view => ({
      id: view._id.toString(),
      userId: view.userId,
      userName: view.userName,
      userAvatar: view.userAvatar,
      viewedAt: view.viewedAt,
      storyId: view.storyId,
      hasStarred: view.hasStarred || false
    }));

    console.log(`[KRONOP-DEBUG] ✅ Retrieved ${transformedViews.length} views for story ${storyId}`);

    res.json({ 
      success: true, 
      views: transformedViews,
      totalViews: transformedViews.length,
      totalStars: transformedViews.filter(v => v.hasStarred).length
    });

  } catch (error) {
    console.error('[KRONOP-DEBUG] ❌ Error fetching story views:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT /api/stories/:storyId/star - Toggle star on story view
router.put('/:storyId/star', async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId, hasStarred } = req.body;

    if (!storyId || !userId || hasStarred === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'storyId, userId, and hasStarred are required' 
      });
    }

    console.log(`[KRONOP-DEBUG] ⭐ Updating star: storyId=${storyId}, userId=${userId}, hasStarred=${hasStarred}`);

    // Find and update the view record
    const view = await StoryView.findOneAndUpdate(
      { storyId, userId },
      { 
        hasStarred: hasStarred,
        starredAt: hasStarred ? new Date() : null
      },
      { new: true, upsert: true }
    );

    if (!view) {
      return res.status(404).json({ 
        success: false, 
        error: 'Story view not found' 
      });
    }

    console.log(`[KRONOP-DEBUG] ✅ Star updated for view ${view._id}`);

    res.json({ 
      success: true, 
      message: `Star ${hasStarred ? 'added' : 'removed'} successfully`,
      viewId: view._id,
      hasStarred: view.hasStarred,
      totalStars: await StoryView.countDocuments({ storyId, hasStarred: true })
    });

  } catch (error) {
    console.error('[KRONOP-DEBUG] ❌ Error updating story star:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/upload', async (req, res) => {
  try {
    res.json({ success: true, message: 'Story upload endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/stories/:storyId - Delete a story and its views
router.delete('/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      return res.status(400).json({ 
        success: false, 
        error: 'storyId is required' 
      });
    }

    console.log(`[KRONOP-DEBUG] 🗑️ Deleting story and views: ${storyId}`);

    // Delete all views associated with this story
    const deleteResult = await StoryView.deleteMany({ storyId });

    console.log(`[KRONOP-DEBUG] ✅ Deleted ${deleteResult.deletedCount} views for story ${storyId}`);

    res.json({ 
      success: true, 
      message: `Story and ${deleteResult.deletedCount} views deleted successfully`,
      deletedViews: deleteResult.deletedCount
    });

  } catch (error) {
    console.error('[KRONOP-DEBUG] ❌ Error deleting story:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/stories/:storyId/stats - Get story statistics
router.get('/:storyId/stats', async (req, res) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      return res.status(400).json({ 
        success: false, 
        error: 'storyId is required' 
      });
    }

    console.log(`[KRONOP-DEBUG] 📈 Fetching stats for story: ${storyId}`);

    const [totalViews, totalStars, recentViews] = await Promise.all([
      StoryView.countDocuments({ storyId }),
      StoryView.countDocuments({ storyId, hasStarred: true }),
      StoryView.countDocuments({ 
        storyId, 
        viewedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      })
    ]);

    res.json({ 
      success: true, 
      stats: {
        totalViews,
        totalStars,
        recentViews, // Last 24 hours
        starPercentage: totalViews > 0 ? ((totalStars / totalViews) * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('[KRONOP-DEBUG] ❌ Error fetching story stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
