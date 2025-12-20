/**
 * RARE 4N - Dialect Engine
 * Handles Arabic dialects (Egyptian, MSA, Khaleeji, Shami, etc.)
 */

export type Dialect = 'egy' | 'msa' | 'khaleeji' | 'shami' | 'maghrebi' | 'egy-tech' | 'auto';

export interface DialectProfile {
  name: string;
  patterns: string[];
  replacements: Map<string, string>;
}

export class RAREDialectEngine {
  private currentDialect: Dialect = 'egy-tech';

  private dialects: Record<Dialect, DialectProfile> = {
    'egy': {
      name: 'Egyptian Arabic',
      patterns: ['ايه', 'ليه', 'ازاي', 'كده', 'بتاع', 'يلا'],
      replacements: new Map([
        ['كيف', 'ازاي'],
        ['ماذا', 'ايه'],
        ['لماذا', 'ليه'],
        ['هكذا', 'كده']
      ])
    },
    'egy-tech': {
      name: 'Egyptian Technical (Hybrid)',
      patterns: ['كود', 'function', 'api', 'bug'],
      replacements: new Map([
        ['البرمجة', 'الكود'],
        ['الخطأ', 'الـ bug'],
        ['الدالة', 'الـ function']
      ])
    },
    'msa': {
      name: 'Modern Standard Arabic',
      patterns: ['كيف', 'ماذا', 'لماذا', 'هكذا'],
      replacements: new Map()
    },
    'khaleeji': {
      name: 'Gulf Arabic',
      patterns: ['شلون', 'وايد', 'شنو'],
      replacements: new Map([
        ['كيف', 'شلون'],
        ['كثير', 'وايد'],
        ['ماذا', 'شنو']
      ])
    },
    'shami': {
      name: 'Levantine Arabic',
      patterns: ['شو', 'كتير', 'هيك'],
      replacements: new Map([
        ['ماذا', 'شو'],
        ['كثير', 'كتير'],
        ['هكذا', 'هيك']
      ])
    },
    'maghrebi': {
      name: 'Maghrebi Arabic',
      patterns: ['كيفاش', 'بزاف', 'واش'],
      replacements: new Map([
        ['كيف', 'كيفاش'],
        ['كثير', 'بزاف'],
        ['هل', 'واش']
      ])
    },
    'auto': {
      name: 'Auto-detect',
      patterns: [],
      replacements: new Map()
    }
  };

  /**
   * Detect dialect from text
   */
  detect(text: string): Dialect {
    const lower = text.toLowerCase();

    // Egyptian detection
    if (/ايه|ليه|كده|ازاي|بتاع|يلا|ماشي|تمام/.test(lower)) {
      // Check if technical (hybrid)
      if (/code|function|api|bug|كود|برمجة/.test(lower)) {
        return 'egy-tech';
      }
      return 'egy';
    }

    // Khaleeji detection
    if (/شلون|وايد|شنو|زين/.test(lower)) {
      return 'khaleeji';
    }

    // Shami detection
    if (/شو|كتير|هيك|مبسوط/.test(lower)) {
      return 'shami';
    }

    // Maghrebi detection
    if (/كيفاش|بزاف|واش/.test(lower)) {
      return 'maghrebi';
    }

    // Default to MSA if formal Arabic
    if (/[\u0600-\u06FF]/.test(text) && !/code|function|api/.test(lower)) {
      return 'msa';
    }

    return this.currentDialect;
  }

  /**
   * Set dialect manually
   */
  setDialect(dialect: Dialect) {
    this.currentDialect = dialect;
  }

  /**
   * Get current dialect
   */
  getDialect(): Dialect {
    return this.currentDialect;
  }

  /**
   * Apply dialect to text
   */
  applyDialect(text: string): string {
    if (this.currentDialect === 'auto' || this.currentDialect === 'msa') {
      return text; // No transformation needed
    }

    const profile = this.dialects[this.currentDialect];
    let result = text;

    // Apply replacements
    profile.replacements.forEach((replacement, original) => {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      result = result.replace(regex, replacement);
    });

    return result;
  }

  /**
   * Get dialect name
   */
  getDialectName(): string {
    return this.dialects[this.currentDialect].name;
  }

  /**
   * Convert between dialects
   */
  convert(text: string, fromDialect: Dialect, toDialect: Dialect): string {
    // First, normalize to MSA
    let normalized = text;
    const fromProfile = this.dialects[fromDialect];
    
    fromProfile.replacements.forEach((replacement, original) => {
      const regex = new RegExp(`\\b${replacement}\\b`, 'g');
      normalized = normalized.replace(regex, original);
    });

    // Then convert to target dialect
    const toProfile = this.dialects[toDialect];
    toProfile.replacements.forEach((replacement, original) => {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      normalized = normalized.replace(regex, replacement);
    });

    return normalized;
  }
}
