import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface SpaceCategoryProps {
  textStyles?: TextStyles;
}

// Space category - empty until implemented
const spacePhotos: any[] = [];

export const SpaceCategory = ({ textStyles }: SpaceCategoryProps) => {
  return <PhotoPlayer category="Space" photos={spacePhotos} textStyles={textStyles} />;
};
