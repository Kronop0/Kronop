import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface TechnicalCategoryProps {
  textStyles?: TextStyles;
}

// Technical category - empty until implemented
const technicalPhotos: any[] = [];

export const TechnicalCategory = ({ textStyles }: TechnicalCategoryProps) => {
  return <PhotoPlayer category="Technical" photos={technicalPhotos} textStyles={textStyles} />;
};
