import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
const fontScale = PixelRatio.getFontScale();

export function fluidSize(size: number, maxScale: number = 1.15): number {
  const scaled = size * Math.min(scale, maxScale);
  return Platform.OS === 'android'
    ? PixelRatio.roundToNearestPixel(scaled) / fontScale
    : Math.round(scaled);
}

export const fluid = {
  xs: fluidSize(11),
  sm: fluidSize(12),
  md: fluidSize(14),
  lg: fluidSize(16),
  xl: fluidSize(18),
  xxl: fluidSize(20),
  xxxl: fluidSize(24),
  display: fluidSize(28),
};
