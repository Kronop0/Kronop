export interface Category {
  id: string;
  label: string;
}

export const categories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'sad', label: 'Sad' },
  { id: 'party', label: 'Party' },
  { id: 'love', label: 'Love' },
  { id: 'breakup', label: 'Breakup' },
  { id: 'motivational', label: 'Motivational' },
  { id: 'devotional', label: 'Devotional (Bhakti)' },
  { id: 'hiphop', label: 'Hip Hop / Rap' },
  { id: 'classical', label: 'Classical' },
  { id: 'folk', label: 'Folk (Lok Geet)' },
  { id: 'dance', label: 'Dance' },
  { id: 'chill', label: 'Chill / Lo-fi' },
];
