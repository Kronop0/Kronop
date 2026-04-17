import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface FoodCategoryProps {
  textStyles?: TextStyles;
}

// Food category - empty until implemented
const foodPhotos: any[] = [];

export const FoodCategory = ({ textStyles }: FoodCategoryProps) => {
  return <PhotoPlayer category="Food" photos={foodPhotos} textStyles={textStyles} />;
};
