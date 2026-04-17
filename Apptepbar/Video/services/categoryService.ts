// Category Service - Category data and operations

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'All', icon: 'apps' },
  // YouTube's Official 15 Categories
  { id: 'film-animation', name: 'Film & Animation', icon: 'movie' },
  { id: 'autos-vehicles', name: 'Autos & Vehicles', icon: 'directions-car' },
  { id: 'music', name: 'Music', icon: 'music-note' },
  { id: 'pets-animals', name: 'Pets & Animals', icon: 'pets' },
  { id: 'sports', name: 'Sports', icon: 'sports-soccer' },
  { id: 'travel-events', name: 'Travel & Events', icon: 'flight' },
  { id: 'gaming', name: 'Gaming', icon: 'sports-esports' },
  { id: 'people-blogs', name: 'People & Blogs', icon: 'person' },
  { id: 'comedy', name: 'Comedy', icon: 'mood' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie-filter' },
  { id: 'news-politics', name: 'News & Politics', icon: 'article' },
  { id: 'howto-style', name: 'How-to & Style', icon: 'handyman' },
  { id: 'education', name: 'Education', icon: 'school' },
  { id: 'science-technology', name: 'Science & Technology', icon: 'science' },
  { id: 'nonprofits-activism', name: 'Nonprofits & Activism', icon: 'volunteer-activism' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getAllCategories = (): Category[] => {
  return categories;
};
