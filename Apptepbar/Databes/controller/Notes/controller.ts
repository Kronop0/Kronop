// Notes Controller - Simple implementation without R2

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  url?: string;
  key?: string; // R2 object key for deletion
}

export interface NoteStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views: number;
}

// Fetch notes - simple mock implementation
export const fetchNotesFromR2 = async (): Promise<NoteItem[]> => {
  try {
    console.log('[NotesController] Fetching notes (mock - no data)');
    return [];
  } catch (error) {
    console.error('[NotesController] Fetch error:', error);
    return [];
  }
};

// Delete note - simple mock implementation
export const deleteNoteFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[NotesController] Deleting note: ${key} (mock)`);
    return true;
  } catch (error) {
    console.error(`[NotesController] Delete error for ${key}:`, error);
    return false;
  }
};

export const calculateNoteStats = (notes: NoteItem[]): NoteStats => {
  return notes.reduce(
    (acc, note) => {
      acc.stars += note.stars;
      acc.comments += note.comments;
      acc.shares += note.shares;
      acc.views += note.views;
      return acc;
    },
    { total: notes.length, stars: 0, comments: 0, shares: 0, views: 0 }
  );
};

// Get top notes by views
export const getTopNotes = (notes: NoteItem[], limit: number = 10): NoteItem[] => {
  return [...notes]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Main API object
export const notesController = {
  getNotes: fetchNotesFromR2,
  deleteNote: deleteNoteFromR2,
  getStats: calculateNoteStats,
  getTopNotes,
};

export default notesController;
