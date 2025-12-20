/**
 * RARE 4N - Neural Translation Service
 * ???????? ???????????????? ???????????? ?????????????? ?????????????? ????????????????
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RAREKernel } from '../core/RAREKernel';

export interface Translation {
  key: string;
  [language: string]: string;
}

class TranslationService {
  private translations: Map<string, Translation> = new Map();
  private currentLanguage: string = 'ar';
  private kernel: RAREKernel;

  constructor() {
    this.kernel = RAREKernel.getInstance();
    this.loadLanguage();
  }

  /**
   * Load current language from storage
   */
  async loadLanguage(): Promise<void> {
    try {
      const lang = await AsyncStorage.getItem('language') || 'ar';
      this.currentLanguage = lang;
      
      // Notify Kernel about language change
      this.kernel.emit({
        type: 'language:changed',
        data: { language: lang },
        source: 'translation-service',
      });
    } catch (error) {
      console.error('Error loading language:', error);
    }
  }

  /**
   * Change language and update all UI
   */
  async changeLanguage(language: string): Promise<void> {
    try {
      this.currentLanguage = language;
      await AsyncStorage.setItem('language', language);
      
      // Notify Kernel ??? Cognitive Loop
      this.kernel.emit({
        type: 'user:input',
        data: {
          text: `change language to ${language}`,
          type: 'settings',
          language,
          action: 'update_translation_system',
        },
        source: 'ui',
      });
      
      // Emit language change event for UI updates
      this.kernel.emit({
        type: 'language:changed',
        data: { language },
        source: 'translation-service',
      });
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }

  /**
   * Translate text
   */
  t(key: string, params?: Record<string, string>): string {
    const translation = this.translations.get(key);
    if (!translation) {
      return key; // Fallback to key if translation not found
    }

    let text = translation[this.currentLanguage] || translation['ar'] || key;
    
    // Replace parameters
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{{${param}}}`, params[param]);
      });
    }

    return text;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Add/Update translation
   */
  addTranslation(key: string, translations: Record<string, string>): void {
    this.translations.set(key, { key, ...translations });
  }

  /**
   * Load translations from backend
   */
  async loadTranslations(): Promise<void> {
    // This would be called by Kernel ??? Cognitive Loop ??? Translation Agent
    // For now, we use default translations
  }
}

export const translationService = new TranslationService();
export default translationService;









