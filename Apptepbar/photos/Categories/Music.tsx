import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface MusicCategoryProps {
  textStyles?: TextStyles;
}

// Music category - empty until implemented
const musicPhotos: any[] = [];

export const MusicCategory = ({ textStyles }: MusicCategoryProps) => {
  return <PhotoPlayer category="Music" photos={musicPhotos} textStyles={textStyles} />;
};
