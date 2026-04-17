import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface AnimalsCategoryProps {
  textStyles?: TextStyles;
}

// Animals category - empty until implemented
const animalsPhotos: any[] = [];

export const AnimalsCategory = ({ textStyles }: AnimalsCategoryProps) => {
  return <PhotoPlayer category="Animals" photos={animalsPhotos} textStyles={textStyles} />;
};
