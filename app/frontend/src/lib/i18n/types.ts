export interface LanguageMetadata {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export interface TranslationModule {
  metadata: LanguageMetadata;
  default: Translation;
}

export interface Translation {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    loading: string;
    error: string;
    success: string;
    [key: string]: string;
  };
  config: {
    language: {
      title: string;
      select: string;
    };
    regional: {
      title: string;
      dateFormat: string;
      currency: string;
      units: string;
    };
    dateFormats: {
      ddmmyyyy: string;
      mmddyyyy: string;
      yyyymmdd: string;
    };
    currencies: {
      [key: string]: string;
    };
    units: {
      metric: string;
      imperial: string;
    };
  };
  navigation: {
    dashboard: string;
    fuelLogs: string;
    maintenance: string;
    insurance: string;
    pollution: string;
  };
  [key: string]: any;
}

export interface LanguageInfo {
  code: string;
  metadata: LanguageMetadata;
  translation: Translation;
}