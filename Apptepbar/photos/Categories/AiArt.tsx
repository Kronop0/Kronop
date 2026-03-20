import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface AiArtCategoryProps {
  textStyles?: TextStyles;
}

// AI Art category - empty until implemented
const aiArtPhotos: any[] = [];

export const AiArtCategory = ({ textStyles }: AiArtCategoryProps) => {
  return <PhotoPlayer category="AI Art" photos={aiArtPhotos} textStyles={textStyles} />;
};
