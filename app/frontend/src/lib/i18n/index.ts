import type { Translation, LanguageInfo, TranslationModule } from './types';

// Función para cargar automáticamente idiomas con sus metadatos
export async function loadAvailableLanguages(): Promise<Record<string, LanguageInfo>> {
  const languages: Record<string, LanguageInfo> = {};
  
  try {
    // Detectar automáticamente archivos de traducción
    const translationModules = import.meta.glob('./translations/*.ts', { eager: false });
    
    // Extraer códigos de idioma de los nombres de archivo
    const languageCodes = Object.keys(translationModules).map(path => {
      const match = path.match(/\/translations\/(\w+)\.ts$/);
      return match ? match[1] : null;
    }).filter(Boolean) as string[];
    
    console.log(`🔍 Detected language files: ${languageCodes.join(', ')}`);
    
    // Cargar cada archivo con sus metadatos
    for (const langCode of languageCodes) {
      try {
        const module = await import(`./translations/${langCode}.ts`) as TranslationModule;
        
        // Validar que el módulo tenga metadatos
        if (!module.metadata) {
          console.warn(`⚠️ Language ${langCode} missing metadata, skipping`);
          continue;
        }
        
        // Validar que el código coincida
        if (module.metadata.code !== langCode) {
          console.warn(`⚠️ Language ${langCode} metadata code mismatch, skipping`);
          continue;
        }
        
        languages[langCode] = {
          code: langCode,
          metadata: module.metadata,
          translation: module.default
        };
        
        console.log(`✅ Loaded ${module.metadata.nativeName} (${langCode})`);
        
      } catch (error) {
        console.warn(`❌ Failed to load ${langCode}:`, error);
      }
    }
    
    // Verificar que al menos inglés esté disponible
    if (!languages.en) {
      console.warn('⚠️ English not found, creating fallback');
      languages.en = createFallbackLanguage();
    }
    
  } catch (error) {
    console.error('❌ Error detecting languages:', error);
    languages.en = createFallbackLanguage();
  }
  
  return languages;
}

// Crear idioma de respaldo mínimo
function createFallbackLanguage(): LanguageInfo {
  return {
    code: 'en',
    metadata: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false
    },
    translation: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success'
      },
      config: {
        language: { title: 'Language', select: 'Select Language' },
        regional: { title: 'Regional Settings', dateFormat: 'Date Format', currency: 'Currency', units: 'Units' },
        dateFormats: { ddmmyyyy: 'DD/MM/YYYY', mmddyyyy: 'MM/DD/YYYY', yyyymmdd: 'YYYY-MM-DD' },
        currencies: { usd: 'US Dollar ($)', eur: 'Euro (€)' },
        units: { metric: 'Metric', imperial: 'Imperial' }
      },
      navigation: {
        dashboard: 'Dashboard',
        fuelLogs: 'Fuel Logs',
        maintenance: 'Maintenance',
        insurance: 'Insurance',
        pollution: 'Pollution'
      }
    }
  };
}

// Validar estructura completa de idioma
export function validateLanguageStructure(languageInfo: LanguageInfo): boolean {
  const { metadata, translation } = languageInfo;
  
  // Validar metadatos
  if (!metadata.code || !metadata.name || !metadata.nativeName || !metadata.flag) {
    return false;
  }
  
  // Validar estructura de traducción
  const requiredKeys = ['common', 'config', 'navigation'];
  for (const key of requiredKeys) {
    if (!translation[key]) {
      return false;
    }
  }
  
  return true;
}