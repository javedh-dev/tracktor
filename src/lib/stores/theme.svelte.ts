import { getContext, setContext } from 'svelte';
import { type ThemeName, type ThemeConfig } from '$lib/types/theme';
import { themes } from '$lib/config/themes';
import { getStoredTheme, saveTheme, applyThemeColors, setThemeClass } from '$lib/utils/theme';

const THEME_KEY = Symbol('theme');

interface ThemeStore {
	theme: ThemeName;
	setTheme: (name: ThemeName) => void;
	getThemes: () => ThemeConfig[];
	getActiveTheme: () => ThemeConfig | undefined;
	initializeTheme: () => void;
}

function createThemeStore(): ThemeStore {
	let theme = $state<ThemeName>('slate');
	let initialized = false;

	function applyTheme(name: ThemeName) {
		const themeConfig = themes[name];
		if (themeConfig) {
			applyThemeColors(themeConfig.colors, themeConfig.darkColors);
			setThemeClass(name);
		}
	}

	function initializeTheme() {
		if (initialized || typeof window === 'undefined') return;

		const storedTheme = getStoredTheme();
		if (storedTheme && storedTheme in themes) {
			theme = storedTheme;
		} else {
			theme = 'slate';
		}

		applyTheme(theme);
		initialized = true;
	}

	function setTheme(name: ThemeName) {
		if (name in themes) {
			theme = name;
			applyTheme(name);
			saveTheme(name);
		}
	}

	function getThemes(): ThemeConfig[] {
		return Object.values(themes);
	}

	function getActiveTheme(): ThemeConfig | undefined {
		return themes[theme];
	}

	return {
		get theme() {
			return theme;
		},
		set theme(value: ThemeName) {
			setTheme(value);
		},
		setTheme,
		getThemes,
		getActiveTheme,
		initializeTheme
	};
}

export const themeStore = createThemeStore();

// Context helpers for components
export function setThemeContext(store: ThemeStore) {
	return setContext(THEME_KEY, store);
}

export function getThemeContext(): ThemeStore {
	return getContext<ThemeStore>(THEME_KEY);
}
