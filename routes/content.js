const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const multer = require('multer');

// Configure multer for content uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos/reels
  }
});

// GET /content/photo/user
router.get('/photo/user', contentController.getUserPhotos);

// GET /content/photo (PUBLIC - for all photos)
router.get('/photo', contentController.getUserPhotos);

// GET /content/photos (ALIAS for /content/photo)
router.get('/photos', contentController.getUserPhotos);

// GET /content/video (PUBLIC - for all videos)
router.get('/video', contentController.getUserVideos);

// GET /content/videos (ALIAS for /content/video)
router.get('/videos', contentController.getUserVideos);


// GET /content/story (PUBLIC)
router.get('/story', contentController.getUserStories);

// GET /content/stories (ALIAS for /content/story)
router.get('/stories', contentController.getUserStories);

// GET /content/live (PUBLIC)
router.get('/live', contentController.getUserLive);

// GET /content/reels (PUBLIC)
router.get('/reels', contentController.getUserReels);

// GET /content/songs (PUBLIC)
router.get('/songs', contentController.getUserSongs);

// POST /content/video/upload (PUBLIC - no auth required)
router.post('/video/upload', upload.single('video'), async (req, res) => {
  return res.status(503).json({
    success: false,
    error: 'Video upload via this endpoint is disabled. Use /upload/video with R2 flow.',
  });
});

// POST /content/photo/upload (PUBLIC - no auth required)
router.post('/photo/upload', upload.single('photo'), async (req, res) => {
  return res.status(503).json({
    success: false,
    error: 'Photo upload via this endpoint is disabled. Use /upload/photo with R2 flow.',
  });
});

module.exports = router;
