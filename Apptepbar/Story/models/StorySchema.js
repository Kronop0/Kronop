const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    default: 'Story',
    enum: ['Story']
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0 // Duration in seconds
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  story_type: {
    type: String,
    enum: ['image', 'video'],
    default: 'video'
  }
}, {
  timestamps: true
});

// Basic indexes for performance
storySchema.index({ type: 1, created_at: -1 });
storySchema.index({ user_id: 1, type: 1 });

module.exports = storySchema;
