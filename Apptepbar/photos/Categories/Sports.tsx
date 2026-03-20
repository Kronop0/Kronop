import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface SportsCategoryProps {
  textStyles?: TextStyles;
}

// Sports category - empty until implemented
const sportsPhotos: any[] = [];

export const SportsCategory = ({ textStyles }: SportsCategoryProps) => {
  return <PhotoPlayer category="Sports" photos={sportsPhotos} textStyles={textStyles} />;
};
