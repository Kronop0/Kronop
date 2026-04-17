import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface TravelCategoryProps {
  textStyles?: TextStyles;
}

// Travel category - empty until implemented
const travelPhotos: any[] = [];

export const TravelCategory = ({ textStyles }: TravelCategoryProps) => {
  return <PhotoPlayer category="Travel" photos={travelPhotos} textStyles={textStyles} />;
};
