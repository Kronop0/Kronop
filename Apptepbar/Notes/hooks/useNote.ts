// Powered by OnSpace.AI
// Note state and business logic — no JSX

import { useState, useCallback } from 'react';
import { getMockNotes, NoteData } from '../services/noteService';

export interface NoteActions {
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSupport: (id: string) => void;
}

export interface UseNotesReturn {
  notes: NoteData[];
  actions: NoteActions;
  isAnimating: Record<string, Record<string, boolean>>;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<NoteData[]>(getMockNotes());
  const [isAnimating, setIsAnimating] = useState<Record<string, Record<string, boolean>>>({});

  const triggerAnimation = useCallback((noteId: string, key: string) => {
    setIsAnimating(prev => ({
      ...prev,
      [noteId]: { ...(prev[noteId] ?? {}), [key]: true },
    }));
    setTimeout(() => {
      setIsAnimating(prev => ({
        ...prev,
        [noteId]: { ...(prev[noteId] ?? {}), [key]: false },
      }));
    }, 300);
  }, []);

  const onLike = useCallback((id: string) => {
    triggerAnimation(id, 'like');
    setNotes(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, isLiked: !n.isLiked, likes: n.isLiked ? n.likes - 1 : n.likes + 1 }
          : n
      )
    );
  }, [triggerAnimation]);

  const onComment = useCallback((id: string) => {
    triggerAnimation(id, 'comment');
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, comments: n.comments + 1 } : n))
    );
  }, [triggerAnimation]);

  const onShare = useCallback((id: string) => {
    triggerAnimation(id, 'share');
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, shares: n.shares + 1 } : n))
    );
  }, [triggerAnimation]);

  const onSupport = useCallback((id: string) => {
    triggerAnimation(id, 'support');
    setNotes(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              isSupported: !n.isSupported,
              supporters: n.isSupported ? n.supporters - 1 : n.supporters + 1,
            }
          : n
      )
    );
  }, [triggerAnimation]);

  return {
    notes,
    actions: { onLike, onComment, onShare, onSupport },
    isAnimating,
  };
}
