import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface StreetCategoryProps {
  textStyles?: TextStyles;
}

// Street category - empty until implemented
const streetPhotos: any[] = [];

export const StreetCategory = ({ textStyles }: StreetCategoryProps) => {
  return <PhotoPlayer category="Street" photos={streetPhotos} textStyles={textStyles} />;
};
