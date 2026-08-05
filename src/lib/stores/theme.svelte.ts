import { type ThemeName, type ThemeConfig, type DarkVariant } from '$lib/types/theme';
import { themes } from '$lib/config/themes';
import {
  getStoredTheme,
  saveTheme,
  applyThemeColors,
  setThemeClass,
  getStoredDarkVariant,
  saveDarkVariant,
  setDarkVariantAttr
} from '$lib/utils/theme';

const DARK_VARIANTS: DarkVariant[] = ['default', 'dim', 'oled'];

interface ThemeStore {
  theme: ThemeName;
  darkVariant: DarkVariant;
  setTheme: (name: ThemeName) => void;
  setDarkVariant: (variant: DarkVariant) => void;
  getThemes: () => ThemeConfig[];
  getActiveTheme: () => ThemeConfig | undefined;
  initializeTheme: () => void;
}

function createThemeStore(): ThemeStore {
  let theme = $state<ThemeName>('slate');
  let darkVariant = $state<DarkVariant>('default');
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
    theme = storedTheme && storedTheme in themes ? storedTheme : 'slate';
    applyTheme(theme);

    const storedVariant = getStoredDarkVariant();
    darkVariant =
      storedVariant && DARK_VARIANTS.includes(storedVariant) ? storedVariant : 'default';
    setDarkVariantAttr(darkVariant);

    initialized = true;
  }

  function setTheme(name: ThemeName) {
    if (name in themes) {
      theme = name;
      applyTheme(name);
      saveTheme(name);
    }
  }

  function setDarkVariant(variant: DarkVariant) {
    if (DARK_VARIANTS.includes(variant)) {
      darkVariant = variant;
      setDarkVariantAttr(variant);
      saveDarkVariant(variant);
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
    get darkVariant() {
      return darkVariant;
    },
    set darkVariant(value: DarkVariant) {
      setDarkVariant(value);
    },
    setTheme,
    setDarkVariant,
    getThemes,
    getActiveTheme,
    initializeTheme
  };
}

export const themeStore = createThemeStore();
