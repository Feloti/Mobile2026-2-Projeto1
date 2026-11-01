import type { Rarity } from '../services/speciesService';

export const colors = {
  background: '#F4F1E8',
  surface: '#FFFFFF',
  surfaceAlt: '#E9E3CF',

  primary: '#8CC63F',
  primaryLight: '#DCEFC0',

  accent: '#F39237',
  accentLight: '#FBD9B4',

  rare: '#6D4AA6',

  textPrimary: '#1B1B1B',
  textSecondary: 'rgba(27, 27, 27, 0.75)',
  textMuted: 'rgba(27, 27, 27, 0.45)',
  border: '#1B1B1B',
};

export function rarityColor(rarity: Rarity): string {
  if (rarity === 'rara') return colors.rare;
  if (rarity === 'incomum') return colors.accent;
  return colors.primary;
}
