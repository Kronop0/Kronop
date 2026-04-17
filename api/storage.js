// Storage API - R2 Delete Operations
const express = require('express');
const router = express.Router();

// Import all controllers with delete functions
const { photoController } = require('../Apptepbar/Databes/controller/photo/controller');
const { videoController } = require('../Apptepbar/Databes/controller/video/controller');
const { storyController } = require('../Apptepbar/Databes/controller/story/controller');
const { liveController } = require('../Apptepbar/Databes/controller/live/controller');
const { reelsController } = require('../Apptepbar/Databes/controller/reels/controller');
const { songController } = require('../Apptepbar/Databes/controller/song/controller');

// DELETE /api/storage/delete - Delete item from R2
router.delete('/delete', async (req, res) => {
  try {
    const { type, key } = req.body;

    if (!type || !key) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and key'
      });
    }

    console.log(`[StorageAPI] Delete request: type=${type}, key=${key}`);

    let result;
    switch (type) {
      case 'photo':
        result = await photoController.deletePhoto(key);
        break;
      case 'video':
        result = await videoController.deleteVideo(key);
        break;
      case 'story':
        result = await storyController.deleteStory(key);
        break;
      case 'live':
        result = await liveController.deleteLiveStream(key);
        break;
      case 'reels':
        result = await reelsController.deleteReel(key);
        break;
      case 'song':
        result = await songController.deleteSong(key);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Invalid type: ${type}. Must be one of: photo, video, story, live, reels, song`
        });
    }

    console.log(`[StorageAPI] Delete successful: type=${type}, key=${key}`);
    res.json({
      success: true,
      message: 'Item deleted successfully from cloud storage',
      data: { type, key, deleted: result }
    });
  } catch (error) {
    console.error('[StorageAPI] Delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete item from cloud storage'
    });
  }
});

module.exports = router;
