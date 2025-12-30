import type { ThemeName, ThemeConfig } from '$lib/types/theme';

const THEME_STORAGE_KEY = 'tracktor-theme';

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
export function isDarkMode(): boolean {
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
 * Reset theme to default (remove all custom theme variables)
 */
export function resetThemeColors(): void {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	const customProps = ['primary', 'primary-foreground', 'ring'];

	customProps.forEach((prop) => {
		root.style.removeProperty(`--${prop}`);
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
 * Get the current system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
