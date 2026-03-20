import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface AllCategoryProps {
  textStyles?: TextStyles;
}

// All category - real data from R2 service
const allPhotos: any[] = []; // Empty array - PhotoPlayer will fetch real data

export const AllCategory = ({ textStyles }: AllCategoryProps) => {
  return <PhotoPlayer category="All" photos={allPhotos} textStyles={textStyles} />;
};
