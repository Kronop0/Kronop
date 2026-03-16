// Category Service - Category data and operations

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'All', icon: 'apps' },
  // Existing categories (keep these)
  { id: 'music', name: 'Music', icon: 'music-note' },
  { id: 'gaming', name: 'Gaming', icon: 'sports-esports' },
  { id: 'sports', name: 'Sports', icon: 'sports-soccer' },
  { id: 'education', name: 'Education', icon: 'school' },
  { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
  { id: 'tech', name: 'Technology', icon: 'computer' },
  { id: 'animation', name: 'Animation', icon: 'animation' },
  { id: 'autos', name: 'Autos & Vehicles', icon: 'directions-car' },
  { id: 'beauty', name: 'Beauty', icon: 'face' },
  { id: 'comedy', name: 'Comedy', icon: 'mood' },
  { id: 'cooking', name: 'Cooking', icon: 'restaurant' },
  { id: 'diy', name: 'DIY & Crafts', icon: 'build' },
  { id: 'documentary', name: 'Documentary', icon: 'movie-filter' },
  { id: 'family', name: 'Family & Kids', icon: 'people' },
  { id: 'fashion', name: 'Fashion', icon: 'checkroom' },
  { id: 'film-animation', name: 'Film & Animation', icon: 'videocam' },
  { id: 'health', name: 'Health & Fitness', icon: 'fitness-center' },
  { id: 'howto', name: 'How-to & Style', icon: 'handyman' },
  { id: 'lifestyle', name: 'Lifestyle', icon: 'weekend' },
  { id: 'news-politics', name: 'News & Politics', icon: 'article' },
  { id: 'nonprofits', name: 'Nonprofits & Activism', icon: 'volunteer-activism' },
  { id: 'pets', name: 'Pets & Animals', icon: 'pets' },
  { id: 'podcasts', name: 'Podcasts', icon: 'podcasts' },
  { id: 'science', name: 'Science & Technology', icon: 'science' },
  { id: 'travel', name: 'Travel & Events', icon: 'flight' },
  { id: 'vlogs', name: 'Vlogs', icon: 'video-camera-front' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getAllCategories = (): Category[] => {
  return categories;
};
