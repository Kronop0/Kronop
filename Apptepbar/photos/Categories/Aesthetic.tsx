import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface AestheticCategoryProps {
  textStyles?: TextStyles;
}

// Aesthetic category - empty until implemented
const aestheticPhotos: any[] = [];

export const AestheticCategory = ({ textStyles }: AestheticCategoryProps) => {
  return <PhotoPlayer category="Aesthetic" photos={aestheticPhotos} textStyles={textStyles} />;
};
