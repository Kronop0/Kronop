import React from 'react';
import { PhotoPlayer } from '../PhotoPlayer';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface WallpaperCategoryProps {
  textStyles?: TextStyles;
}

// Wallpaper category - empty until implemented
const wallpaperPhotos: any[] = [];

export const WallpaperCategory = ({ textStyles }: WallpaperCategoryProps) => {
  return <PhotoPlayer category="Wallpaper" photos={wallpaperPhotos} textStyles={textStyles} />;
};
