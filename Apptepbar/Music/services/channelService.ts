// Channel/Artist Management Service
import { Channel } from '../types';

class ChannelService {
  private channels: Map<string, Channel> = new Map();

  // Get all channels
  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  // Get channel by ID
  getChannelById(channelId: string): Channel | undefined {
    return this.channels.get(channelId);
  }

  // Add channel
  addChannel(channel: Channel): void {
    this.channels.set(channel.id, channel);
  }

  // Update channel
  updateChannel(channelId: string, updates: Partial<Channel>): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.channels.set(channelId, {
        ...channel,
        ...updates,
      });
    }
  }

  // Follow channel
  followChannel(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.followers += 1;
    }
  }

  // Unfollow channel
  unfollowChannel(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel && channel.followers > 0) {
      channel.followers -= 1;
    }
  }
}

export const channelService = new ChannelService();
