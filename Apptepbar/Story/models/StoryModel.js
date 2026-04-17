const mongoose = require('mongoose');
const storySchema = require('./StorySchema');

const Story = mongoose.model('Story', storySchema, 'stories');

module.exports = Story;
