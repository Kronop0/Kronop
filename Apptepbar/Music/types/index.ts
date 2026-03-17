// Core Type Definitions

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  audioUrl: string;
  channelId?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  avatar: string;
  followers: number;
}

export interface Favorite {
  userId: string;
  songId: string;
  addedAt: number;
}
