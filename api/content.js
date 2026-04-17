const express = require('express');
const mongoose = require('mongoose');
const Content = require('../models/Content');

const router = express.Router();
const ALLOWED_TYPES = new Set(['Story', 'Live', 'Video', 'Photo', 'Reel']);
const DEFAULT_SELECT = 'title type url thumbnail tags category views likes created_at updatedAt user_id expires_at';

const toPositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const normalizeType = (rawType) => {
  if (!rawType || typeof rawType !== 'string') return null;
  const lower = rawType.trim().toLowerCase();
  if (lower === 'reels' || lower === 'reel') return 'Reel';
  if (lower === 'stories' || lower === 'story') return 'Story';
  if (lower === 'videos' || lower === 'video') return 'Video';
  if (lower === 'photos' || lower === 'photo') return 'Photo';
  if (lower === 'live') return 'Live';
  return null;
};

const buildPagination = (page, limit, totalItems) => ({
  currentPage: page,
  itemsPerPage: limit,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / limit)),
});

const parseQueryFilters = (req) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
  const skip = (page - 1) * limit;

  const query = { is_active: true };
  if (req.query.category && req.query.category !== 'all') {
    query.category = String(req.query.category).trim();
  }

  if (req.query.userId) {
    const rawUserId = String(req.query.userId).trim();
    if (mongoose.Types.ObjectId.isValid(rawUserId)) query.user_id = rawUserId;
  }

  return { page, limit, skip, query };
};

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const normalizedType = req.query.type ? normalizeType(req.query.type) : null;
    const { page, limit, skip, query } = parseQueryFilters(req);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid userId' });
    }

    query.user_id = userId;
    if (normalizedType) query.type = normalizedType;

    const [items, totalItems] = await Promise.all([
      Content.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).select(DEFAULT_SELECT),
      Content.countDocuments(query),
    ]);

    return res.json({ success: true, data: items, pagination: buildPagination(page, limit, totalItems) });
  } catch (error) {
    console.error('❌ /api/content/user/:userId error:', error);
    return res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

router.get('/video/user', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ success: false, error: 'Valid userId is required' });
    }
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;
    const query = { user_id: String(userId), type: 'Video', is_active: true };

    const [items, totalItems] = await Promise.all([
      Content.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).select(DEFAULT_SELECT),
      Content.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: buildPagination(page, limit, totalItems) });
  } catch (error) {
    console.error('❌ /api/content/video/user error:', error);
    return res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

router.get('/photo/user', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ success: false, error: 'Valid userId is required' });
    }
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;
    const query = { user_id: String(userId), type: 'Photo', is_active: true };

    const [items, totalItems] = await Promise.all([
      Content.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).select(DEFAULT_SELECT),
      Content.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: buildPagination(page, limit, totalItems) });
  } catch (error) {
    console.error('❌ /api/content/photo/user error:', error);
    return res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

router.get('/reels/user', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ success: false, error: 'Valid userId is required' });
    }
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;
    const query = { user_id: String(userId), type: 'Reel', is_active: true };

    const [items, totalItems] = await Promise.all([
      Content.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).select(DEFAULT_SELECT),
      Content.countDocuments(query),
    ]);
    return res.json({ success: true, data: items, pagination: buildPagination(page, limit, totalItems) });
  } catch (error) {
    console.error('❌ /api/content/reels/user error:', error);
    return res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 10), 50);
    const skip = (page - 1) * limit;
    const types = ['Reel', 'Video', 'Live', 'Photo', 'Story'];

    const payload = {};
    await Promise.all(
      types.map(async (type) => {
        const query = { type, is_active: true };
        if (req.query.category && req.query.category !== 'all') {
          query.category = String(req.query.category).trim();
        }

        const [items, totalItems] = await Promise.all([
          Content.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).select(DEFAULT_SELECT),
          Content.countDocuments(query),
        ]);

        payload[type.toLowerCase()] = {
          data: items,
          pagination: buildPagination(page, limit, totalItems),
        };
      })
    );

    return res.json({ success: true, data: payload });
  } catch (error) {
    console.error('❌ /api/content error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:type', async (req, res) => {
  try {
    const normalizedType = normalizeType(req.params.type);
    if (!normalizedType || !ALLOWED_TYPES.has(normalizedType)) {
      return res.status(400).json({ success: false, error: 'Invalid content type' });
    }

    const { page, limit, skip, query } = parseQueryFilters(req);
    query.type = normalizedType;

    const [items, totalItems] = await Promise.all([
      Content.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).select(DEFAULT_SELECT),
      Content.countDocuments(query),
    ]);

    return res.json({ success: true, data: items, pagination: buildPagination(page, limit, totalItems) });
  } catch (error) {
    console.error(`❌ /api/content/${req.params.type} error:`, error);
    return res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, title, url } = req.body;
    const normalizedType = normalizeType(type);
    if (!normalizedType) {
      return res.status(400).json({ success: false, error: 'Invalid content type' });
    }
    if (!title || !url) {
      return res.status(400).json({ success: false, error: 'title and url are required' });
    }

    const doc = new Content({
      ...req.body,
      type: normalizedType,
      is_active: req.body.is_active !== false,
    });

    const saved = await doc.save();
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('❌ POST /api/content error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid content id' });
    }

    const updates = { ...req.body };
    if (updates.type) {
      const normalizedType = normalizeType(updates.type);
      if (!normalizedType) {
        return res.status(400).json({ success: false, error: 'Invalid content type' });
      }
      updates.type = normalizedType;
    }

    const updated = await Content.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select(DEFAULT_SELECT);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ PUT /api/content/:id error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid content id' });
    }

    const updated = await Content.findByIdAndUpdate(id, { is_active: false }, { new: true }).select(DEFAULT_SELECT);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    return res.json({ success: true, message: 'Content deactivated successfully', data: updated });
  } catch (error) {
    console.error('❌ DELETE /api/content/:id error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid content id' });
    }

    const updated = await Content.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).select(DEFAULT_SELECT);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ POST /api/content/:id/view error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid content id' });
    }

    const updated = await Content.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true }).select(DEFAULT_SELECT);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ POST /api/content/:id/like error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;



