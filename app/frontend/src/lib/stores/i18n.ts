import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { loadAvailableLanguages, validateLanguageStructure } from '../i18n';
import type { LanguageInfo, Translation } from '../i18n/types';

// Store para idiomas disponibles
export const availableLanguages = writable<Record<string, LanguageInfo>>({});

// Store para el idioma actual
export const currentLanguage = writable<string>('en');

// Store para estado de carga
export const isLoading = writable<boolean>(true);

// Store derivado para las traducciones del idioma actual
export const translations = derived(
  [availableLanguages, currentLanguage],
  ([$availableLanguages, $currentLanguage]) => {
    return $availableLanguages[$currentLanguage]?.translation || 
           $availableLanguages['en']?.translation || 
           {};
  }
);

// Store derivado para opciones de idioma (completamente dinámico)
export const languageOptions = derived(
  availableLanguages,
  ($availableLanguages) => {
    return Object.values($availableLanguages)
      .filter(lang => validateLanguageStructure(lang))
      .sort((a, b) => a.metadata.nativeName.localeCompare(b.metadata.nativeName))
      .map(lang => ({
        code: lang.code,
        name: lang.metadata.name,
        nativeName: lang.metadata.nativeName,
        flag: lang.metadata.flag,
        rtl: lang.metadata.rtl
      }));
  }
);

// Función para inicializar el sistema
export async function initializeI18n() {
  try {
    isLoading.set(true);
    console.log('🌐 Initializing dynamic i18n system...');
    
    const languages = await loadAvailableLanguages();
    availableLanguages.set(languages);
    
    const languageCount = Object.keys(languages).length;
    const languageList = Object.values(languages).map(l => l.metadata.nativeName).join(', ');
    console.log(`✅ Loaded ${languageCount} languages: ${languageList}`);
    
    // Detectar idioma automáticamente
    if (browser) {
      const saved = localStorage.getItem('tracktor-language');
      const browser_lang = navigator.language.split('-')[0];
      
      const languageToUse = 
        (saved && languages[saved]) ? saved :
        languages[browser_lang] ? browser_lang :
        'en';
      
      console.log(`🎯 Using: ${languages[languageToUse]?.metadata.nativeName} (${languageToUse})`);
      currentLanguage.set(languageToUse);
    }
    
  } catch (error) {
    console.error('❌ i18n initialization failed:', error);
  } finally {
    isLoading.set(false);
  }
}

// Función para cambiar idioma
export function setLanguage(langCode: string) {
  currentLanguage.set(langCode);
  if (browser) {
    localStorage.setItem('tracktor-language', langCode);
  }
}

// Función de traducción
export function createTranslationFunction(translations: Translation) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      return keys[keys.length - 1]; // Fallback a la última parte de la clave
    }
    
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, param: string) => {
        return params[param]?.toString() || match;
      });
    }
    
    return value;
  };
}

export const t = derived(translations, createTranslationFunction);