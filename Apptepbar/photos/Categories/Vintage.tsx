import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface VintageCategoryProps {
  textStyles?: TextStyles;
}

// Vintage category - empty until implemented
const vintagePhotos: any[] = [];

export const VintageCategory = ({ textStyles }: VintageCategoryProps) => {
  return <PhotoPlayer category="Vintage" photos={vintagePhotos} textStyles={textStyles} />;
};
