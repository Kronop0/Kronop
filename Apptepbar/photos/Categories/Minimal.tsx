import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface MinimalCategoryProps {
  textStyles?: TextStyles;
}

// Minimal category - empty until implemented
const minimalPhotos: any[] = [];

export const MinimalCategory = ({ textStyles }: MinimalCategoryProps) => {
  return <PhotoPlayer category="Minimal" photos={minimalPhotos} textStyles={textStyles} />;
};
