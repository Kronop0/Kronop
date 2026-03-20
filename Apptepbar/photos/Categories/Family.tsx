import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface FamilyCategoryProps {
  textStyles?: TextStyles;
}

// Family category - empty until implemented
const familyPhotos: any[] = [];

export const FamilyCategory = ({ textStyles }: FamilyCategoryProps) => {
  return <PhotoPlayer category="Family" photos={familyPhotos} textStyles={textStyles} />;
};
