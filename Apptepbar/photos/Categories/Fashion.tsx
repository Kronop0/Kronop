import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface FashionCategoryProps {
  textStyles?: TextStyles;
}

// Fashion category - empty until implemented
const fashionPhotos: any[] = [];

export const FashionCategory = ({ textStyles }: FashionCategoryProps) => {
  return <PhotoPlayer category="Fashion" photos={fashionPhotos} textStyles={textStyles} />;
};
