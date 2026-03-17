// Songs Data - Load from Cloudflare R2 ONLY
import { Song } from '../types';
import { r2Service } from '../services/r2Service';

// NO FALLBACK DATA - Load from R2 bucket only
export async function loadSongs(): Promise<Song[]> {
  console.log('🎵 Loading songs from Cloudflare R2...');
  
  const r2Songs = await r2Service.fetchSongs();
  
  if (r2Songs.length === 0) {
    console.warn('⚠️ R2 bucket is empty or no audio files found');
    throw new Error('No songs found in R2 bucket. Please upload songs to kronop-song bucket.');
  }
  
  console.log(`✅ Successfully loaded ${r2Songs.length} songs from R2`);
  return r2Songs;
}
