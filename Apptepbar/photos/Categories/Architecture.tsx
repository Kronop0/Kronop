import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface ArchitectureCategoryProps {
  textStyles?: TextStyles;
}

// Architecture category - empty until implemented
const architecturePhotos: any[] = [];

export const ArchitectureCategory = ({ textStyles }: ArchitectureCategoryProps) => {
  return <PhotoPlayer category="Architecture" photos={architecturePhotos} textStyles={textStyles} />;
};
