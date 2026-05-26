import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useLanguageStore } from '../store/languageStore';
import { resources } from '../translations/i18n';

export function useTranslation() {
  const storeLanguage = useAppStore((s) => s.language) || 'English';
  const langCode = useLanguageStore((s) => s.language) || 'en';

  const t = useCallback(
    (key: string, defaultValueOrOptions?: any) => {
      let defaultValue = '';
      let options: any = null;

      if (typeof defaultValueOrOptions === 'string') {
        defaultValue = defaultValueOrOptions;
      } else if (defaultValueOrOptions && typeof defaultValueOrOptions === 'object') {
        options = defaultValueOrOptions;
        if (options.defaultValue) {
          defaultValue = options.defaultValue;
        }
      }

      // Get resources for the active language, falling back to English if not defined
      const langResources = resources[langCode] || resources.en;
      
      // Look up key in the active language, falling back to English bundle, then defaultValue, then the key itself
      let translated = langResources[key] || resources.en[key] || defaultValue || key;

      // Apply interpolation locally if options are provided (like {{crop}} or {{percent}})
      if (options) {
        Object.keys(options).forEach((optKey) => {
          translated = translated.replace(
            new RegExp(`{{${optKey}}}`, 'g'),
            String(options[optKey])
          );
        });
      }

      return translated;
    },
    [langCode]
  );

  return { t, language: storeLanguage, langCode };
}
