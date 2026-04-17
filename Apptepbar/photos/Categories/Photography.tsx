import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface PhotographyCategoryProps {
  textStyles?: TextStyles;
}

// Photography category - empty until implemented
const photographyPhotos: any[] = [];

export const PhotographyCategory = ({ textStyles }: PhotographyCategoryProps) => {
  return <PhotoPlayer category="Photography" photos={photographyPhotos} textStyles={textStyles} />;
};
