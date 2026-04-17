// Powered by OnSpace.AI
// Effects data + types — shared across EffectsPanel and live screen

export interface CameraEffect {
  id: string;
  name: string;
  icon: string;
  iconLib: 'ionicons' | 'material';
  overlayColor: string;
  overlayOpacity: number;
  previewGradient: string[];
  description: string;
}

export const EFFECTS: CameraEffect[] = [
  {
    id: 'none',
    name: 'Normal',
    icon: 'aperture-outline',
    iconLib: 'ionicons',
    overlayColor: 'transparent',
    overlayOpacity: 0,
    previewGradient: ['#333', '#555'],
    description: 'No filter',
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: 'sparkles-outline',
    iconLib: 'ionicons',
    overlayColor: '#FFB6C1',
    overlayOpacity: 0.18,
    previewGradient: ['#FF6FAB', '#FF9CC2'],
    description: 'Soft glow skin',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: 'film-outline',
    iconLib: 'ionicons',
    overlayColor: '#8B4513',
    overlayOpacity: 0.28,
    previewGradient: ['#8B4513', '#D2691E'],
    description: 'Retro warm tone',
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: 'flash-outline',
    iconLib: 'ionicons',
    overlayColor: '#A855F7',
    overlayOpacity: 0.25,
    previewGradient: ['#7C3AED', '#EC4899'],
    description: 'Electric glow',
  },
  {
    id: 'bw',
    name: 'B&W',
    icon: 'contrast-outline',
    iconLib: 'ionicons',
    overlayColor: '#000000',
    overlayOpacity: 0.12,
    previewGradient: ['#1a1a1a', '#666'],
    description: 'Monochrome',
  },
  {
    id: 'golden',
    name: 'Golden',
    icon: 'sunny-outline',
    iconLib: 'ionicons',
    overlayColor: '#FFD700',
    overlayOpacity: 0.2,
    previewGradient: ['#F59E0B', '#FCD34D'],
    description: 'Warm golden hour',
  },
];
