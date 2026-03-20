import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface GamingCategoryProps {
  textStyles?: TextStyles;
}

// Gaming category data
const gamingPhotos = [
  {
    id: 'game1',
    url: 'https://picsum.photos/400/600?random=game1',
    caption: 'Epic gaming moment',
    user: { id: '1', name: 'GameMaster' },
    likes: 7890,
    comments: 567,
    category: 'Gaming'
  },
  {
    id: 'game2',
    url: 'https://picsum.photos/400/600?random=game2',
    caption: 'Intense gameplay',
    user: { id: '2', name: 'ProGamer' },
    likes: 8901,
    comments: 678,
    category: 'Gaming'
  },
  {
    id: 'game3',
    url: 'https://picsum.photos/400/600?random=game3',
    caption: 'Virtual adventure',
    user: { id: '3', name: 'VirtualLife' },
    likes: 9012,
    comments: 789,
    category: 'Gaming'
  }
];

export const GamingCategory = ({ textStyles }: GamingCategoryProps) => {
  return <PhotoPlayer category="Gaming" photos={gamingPhotos} textStyles={textStyles} />;
};
