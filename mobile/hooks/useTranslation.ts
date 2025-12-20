/**
 * RARE 4N - Translation Hook
 * Hook للترجمة التلقائية عند تغيير اللغة
 */

import { useState, useEffect } from 'react';
import { translationService } from '../services/translationService';
import { RAREKernel } from '../core/RAREKernel';

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('ar');
  const [translations, setTranslations] = useState<Map<string, any>>(new Map());
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // Load current language
    const lang = translationService.getCurrentLanguage();
    setCurrentLanguage(lang);

    // Listen for language changes
    const unsubscribe = kernel.on('language:changed', (event) => {
      setCurrentLanguage(event.data.language);
      // Force re-render of all components using translations
      setTranslations(new Map(translations));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    return translationService.t(key, params);
  };

  const changeLanguage = async (language: string) => {
    await translationService.changeLanguage(language);
    setCurrentLanguage(language);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
  };
}








