import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface ArtCategoryProps {
  textStyles?: TextStyles;
}

// Art category - empty until implemented
const artPhotos: any[] = [];

export const ArtCategory = ({ textStyles }: ArtCategoryProps) => {
  return <PhotoPlayer category="Art" photos={artPhotos} textStyles={textStyles} />;
};
