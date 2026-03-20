import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface NatureCategoryProps {
  textStyles?: TextStyles;
}

// Nature category - empty until implemented
const naturePhotos: any[] = [];

export const NatureCategory = ({ textStyles }: NatureCategoryProps) => {
  return <PhotoPlayer category="Nature" photos={naturePhotos} textStyles={textStyles} />;
};
