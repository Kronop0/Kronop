import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface CarsCategoryProps {
  textStyles?: TextStyles;
}

// Cars category - empty until implemented
const carsPhotos: any[] = [];

export const CarsCategory = ({ textStyles }: CarsCategoryProps) => {
  return <PhotoPlayer category="Cars" photos={carsPhotos} textStyles={textStyles} />;
};
