import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface MacroCategoryProps {
  textStyles?: TextStyles;
}

// Macro category - empty until implemented
const macroPhotos: any[] = [];

export const MacroCategory = ({ textStyles }: MacroCategoryProps) => {
  return <PhotoPlayer category="Macro" photos={macroPhotos} textStyles={textStyles} />;
};
