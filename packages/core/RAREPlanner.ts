/**
 * RARE 4N - Intelligent Planner
 * Converts user requests into executable task plans
 */

export interface PlanStep {
  engine: string;
  action: string;
  payload: any;
  priority: number;
  dependencies?: string[];
}

export interface PlanContext {
  persona?: any;
  memory?: any;
  dialect?: string;
}

export class RAREPlanner {
  /**
   * Build execution plan from user query
   */
  buildPlan(query: string, context?: PlanContext): PlanStep[] {
    const steps: PlanStep[] = [];
    const lower = query.toLowerCase();

    // Code generation
    if (this.isCodeRequest(lower)) {
      steps.push({
        engine: 'CodeEngine',
        action: 'generate',
        payload: { query, language: this.detectLanguage(lower) },
        priority: 1
      });
    }

    // Data analysis
    if (this.isAnalysisRequest(lower)) {
      steps.push({
        engine: 'AnalysisEngine',
        action: 'analyze',
        payload: { query, type: this.detectAnalysisType(lower) },
        priority: 1
      });
    }

    // Translation
    if (this.isTranslationRequest(lower)) {
      steps.push({
        engine: 'TranslationEngine',
        action: 'translate',
        payload: { 
          query, 
          targetLang: this.detectTargetLanguage(lower),
          sourceLang: this.detectSourceLanguage(lower)
        },
        priority: 1
      });
    }

    // Navigation
    if (this.isNavigationRequest(lower)) {
      steps.push({
        engine: 'NavigationEngine',
        action: 'navigate',
        payload: { query, destination: this.extrREMOVED(lower) },
        priority: 1
      });
    }

    // File operations
    if (this.isFileRequest(lower)) {
      steps.push({
        engine: 'StorageEngine',
        action: this.detectFileAction(lower),
        payload: { query },
        priority: 2
      });
    }

    // OCR
    if (this.isOCRRequest(lower)) {
      steps.push({
        engine: 'OCREngine',
        action: 'extract',
        payload: { query },
        priority: 1
      });
    }

    // App Building
    if (this.isAppBuildRequest(lower)) {
      steps.push({
        engine: 'AppBuilderEngine',
        action: 'generate',
        payload: { 
          query, 
          type: this.detectAppType(lower),
          framework: this.detectFramework(lower)
        },
        priority: 1
      });
    }

    // CarPlay
    if (this.isCarPlayRequest(lower)) {
      steps.push({
        engine: 'CarPlayEngine',
        action: 'command',
        payload: { query, type: this.detectCarPlayType(lower) },
        priority: 1
      });
    }

    // Default: Brain Engine for conversation
    if (steps.length === 0 || this.needsConversation(lower)) {
      steps.push({
        engine: 'BrainEngine',
        action: 'respond',
        payload: { 
          query, 
          context,
          requiresDeepThinking: this.requiresDeepThinking(lower)
        },
        priority: steps.length === 0 ? 1 : 3
      });
    }

    // Sort by priority
    return steps.sort((a, b) => a.priority - b.priority);
  }

  // Detection methods
  private isCodeRequest(text: string): boolean {
    return /??????|code|function|class|api|component|write.*code|create.*function|build.*api/.test(text);
  }

  private isAnalysisRequest(text: string): boolean {
    return /??????|analysis|analyze|??????????|data|statistics|insights|examine/.test(text);
  }

  private isTranslationRequest(text: string): boolean {
    return /????????|translate|translation|??????????/.test(text);
  }

  private isNavigationRequest(text: string): boolean {
    return /????????|navigate|route|????????|????????|????????|destination/.test(text);
  }

  private isFileRequest(text: string): boolean {
    return /??????|file|??????|upload|download|??????????|save|??????/.test(text);
  }

  private isOCRRequest(text: string): boolean {
    return /ocr|?????????????? ????????|extract text|scan|??????/.test(text);
  }

  private isAppBuildRequest(text: string): boolean {
    return /build.*app|create.*app|???????? ??????????|???????? app|generate.*app/.test(text);
  }

  private isCarPlayRequest(text: string): boolean {
    return /carplay|car|navigation|??????????|??????????/.test(text);
  }

  private needsConversation(text: string): boolean {
    return /??????|explain|??????|what|????????|how|??????|why|tell me/.test(text);
  }

  private requiresDeepThinking(text: string): boolean {
    return /complex|????????|deep|????????|strategy|????????????????????|philosophy/.test(text);
  }

  // Extraction methods
  private detectLanguage(text: string): string {
    if (/python/.test(text)) return 'python';
    if (/javascript|js|node/.test(text)) return 'javascript';
    if (/typescript|ts/.test(text)) return 'typescript';
    if (/react/.test(text)) return 'react';
    if (/java\b/.test(text)) return 'java';
    return 'javascript';
  }

  private detectAnalysisType(text: string): string {
    if (/image|????????/.test(text)) return 'image';
    if (/data|????????????/.test(text)) return 'data';
    if (/code|??????/.test(text)) return 'code';
    return 'general';
  }

  private detectTargetLanguage(text: string): string {
    if (/to english|????????????????????/.test(text)) return 'en';
    if (/to arabic|??????????????/.test(text)) return 'ar';
    if (/to french|????????????????/.test(text)) return 'fr';
    return 'auto';
  }

  private detectSourceLanguage(text: string): string {
    return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
  }

  private extrREMOVED(text: string): string {
    const match = text.match(/(?:??????|to)\s+([^??,]+)/i);
    return match ? match[1].trim() : 'unknown';
  }

  private detectFileAction(text: string): string {
    if (/??????|upload/.test(text)) return 'upload';
    if (/??????????|download/.test(text)) return 'download';
    if (/??????|delete/.test(text)) return 'delete';
    return 'list';
  }

  private detectAppType(text: string): string {
    if (/mobile/.test(text)) return 'mobile';
    if (/web/.test(text)) return 'web';
    if (/api/.test(text)) return 'api';
    return 'mobile';
  }

  private detectFramework(text: string): string {
    if (/react native|expo/.test(text)) return 'expo';
    if (/next/.test(text)) return 'next';
    if (/react/.test(text)) return 'react';
    return 'expo';
  }

  private detectCarPlayType(text: string): string {
    if (/navigate|????????/.test(text)) return 'navigation';
    if (/call|????????/.test(text)) return 'call';
    if (/play|??????/.test(text)) return 'media';
    return 'assistant';
  }
}

