import type { ThemeName, ThemeConfig, DarkVariant } from '$lib/types/theme';

const THEME_STORAGE_KEY = 'tracktor-theme';
const DARK_VARIANT_STORAGE_KEY = 'tracktor-dark-variant';

/**
 * Get the theme from localStorage
 */
export function getStoredTheme(): ThemeName | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return (stored as ThemeName) || null;
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Check if dark mode is currently active
 */
function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Apply theme CSS variables to document
 * Applies different colors based on dark/light mode
 */
export function applyThemeColors(
  lightColors?: ThemeConfig['colors'],
  darkColors?: ThemeConfig['darkColors']
): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const colors = isDarkMode() ? darkColors || lightColors : lightColors;

  if (!colors) return;

  // Only apply theme-specific colors (primary, accent, etc.)
  // Don't override base colors (background, foreground) which are controlled by dark mode
  const themeColorMap: Record<string, string> = {
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    ring: '--ring'
  };

  Object.entries(colors).forEach(([key, value]) => {
    if (value && key in themeColorMap) {
      const cssVar = themeColorMap[key];
      root.style.setProperty(cssVar, value);
    }
  });
}

/**
 * Add or remove theme class from HTML element
 */
export function setThemeClass(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
}

/**
 * Get the dark mode variant from localStorage
 */
export function getStoredDarkVariant(): DarkVariant | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(DARK_VARIANT_STORAGE_KEY) as DarkVariant) || null;
}

/**
 * Save the dark mode variant to localStorage
 */
export function saveDarkVariant(variant: DarkVariant): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DARK_VARIANT_STORAGE_KEY, variant);
}

/**
 * Apply the dark mode variant attribute, read by the `.dark[data-dark-variant=...]` CSS overrides
 */
export function setDarkVariantAttr(variant: DarkVariant): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-dark-variant', variant);
}
