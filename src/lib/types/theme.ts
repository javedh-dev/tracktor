export type ThemeName =
  | 'slate'
  | 'stone'
  | 'red'
  | 'rose'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'yellow'
  | 'teal'
  | 'indigo'
  | 'pink';

/** Dark-mode contrast style, independent of the accent color chosen via ThemeName. */
export type DarkVariant = 'default' | 'dim' | 'oled';

export interface ThemeColors {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  border?: string;
  input?: string;
  ring?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  [key: string]: string | undefined;
}

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  active: boolean;
  colors?: ThemeColors;
  darkColors?: ThemeColors;
}
