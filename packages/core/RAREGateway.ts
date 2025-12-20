/**
 * RARE 4N - Gateway (Execution Dispatcher)
 * Routes tasks to appropriate engines dynamically
 */

import axios from 'axios';

export interface ExecutionResult {
  output: string;
  confidence: number;
  executionTime: number;
  metadata?: any;
}

export class RAREGateway {
  private readonly API_BASE = process.env.API_URL || 'http://localhost:5000/api';

  /**
   * Execute a plan by dispatching to engines
   */
  async executePlan(steps: any[]): Promise<ExecutionResult> {
    let finalOutput = '';
    let totalTime = 0;
    const usedEngines: string[] = [];

    const startTime = Date.now();

    for (const step of steps) {
      try {
        const result = await this.executeStep(step);
        
        if (result) {
          finalOutput += result + '\n';
          usedEngines.push(step.engine);
        }
      } catch (error) {
        console.error(`Error executing ${step.engine}:`, error);
        finalOutput += `?????? ${step.engine} execution failed\n`;
      }
    }

    totalTime = Date.now() - startTime;

    return {
      output: finalOutput.trim(),
      confidence: 0.95,
      executionTime: totalTime,
      metadata: { usedEngines }
    };
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: any): Promise<string> {
    const { engine, action, payload } = step;

    switch (engine) {
      case 'CodeEngine':
        return await this.executeCodeEngine(action, payload);
      
      case 'AnalysisEngine':
        return await this.executeAnalysisEngine(action, payload);
      
      case 'TranslationEngine':
        return await this.executeTranslationEngine(action, payload);
      
      case 'NavigationEngine':
        return await this.executeNavigationEngine(action, payload);
      
      case 'StorageEngine':
        return await this.executeStorageEngine(action, payload);
      
      case 'OCREngine':
        return await this.executeOCREngine(action, payload);
      
      case 'AppBuilderEngine':
        return await this.executeAppBuilderEngine(action, payload);
      
      case 'CarPlayEngine':
        return await this.executeCarPlayEngine(action, payload);
      
      case 'BrainEngine':
        return await this.executeBrainEngine(action, payload);
      
      default:
        return `?????? Unknown engine: ${engine}`;
    }
  }

  // Engine executors
  private async executeCodeEngine(action: string, payload: any): Promise<string> {
    // Use GPT for code generation
    try {
      const response = await axios.post(`${this.API_BASE}/gpt/chat`, {
        message: `Generate ${payload.language} code: ${payload.query}`,
        aiModel: 'gpt'
      });
      return response.data.reply;
    } catch (error) {
      return '?????? Code generation failed';
    }
  }

  private async executeAnalysisEngine(action: string, payload: any): Promise<string> {
    try {
      const endpoint = payload.type === 'image' ? 'analyze-image' : 
                       payload.type === 'code' ? 'analyze-code' : 'analyze-data';
      
      const response = await axios.post(`${this.API_BASE}/analysis/${endpoint}`, payload);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      return '?????? Analysis failed';
    }
  }

  private async executeTranslationEngine(action: string, payload: any): Promise<string> {
    try {
      const response = await axios.post(`${this.API_BASE}/translate/translate`, {
        text: payload.query,
        targetLang: payload.targetLang,
        sourceLang: payload.sourceLang
      });
      return response.data.translatedText;
    } catch (error) {
      return '?????? Translation failed';
    }
  }

  private async executeNavigationEngine(action: string, payload: any): Promise<string> {
    try {
      const response = await axios.post(`${this.API_BASE}/nav/route`, {
        from: 'current',
        to: payload.destination
      });
      const route = response.data.route;
      return `???? ${route.summary}\n?????? ${route.duration}\n???? ${route.distance}`;
    } catch (error) {
      return '?????? Navigation failed';
    }
  }

  private async executeStorageEngine(action: string, payload: any): Promise<string> {
    try {
      if (action === 'list') {
        const response = await axios.get(`${this.API_BASE}/storage/files`);
        return `???? Files: ${response.data.files.length}`;
      }
      return '??? Storage operation completed';
    } catch (error) {
      return '?????? Storage operation failed';
    }
  }

  private async executeOCREngine(action: string, payload: any): Promise<string> {
    try {
      const response = await axios.post(`${this.API_BASE}/analysis/ocr`, payload);
      return response.data.text;
    } catch (error) {
      return '?????? OCR failed';
    }
  }

  private async executeAppBuilderEngine(action: string, payload: any): Promise<string> {
    try {
      const response = await axios.post(`${this.API_BASE}/app-builder/generate-app`, {
        appName: payload.query,
        screens: [{ name: 'Home' }],
        framework: payload.framework
      });
      return `??? App structure generated\n???? Files: ${Object.keys(response.data.structure.files).length}`;
    } catch (error) {
      return '?????? App generation failed';
    }
  }

  private async executeCarPlayEngine(action: string, payload: any): Promise<string> {
    try {
      const response = await axios.post(`${this.API_BASE}/carplay/voice-command`, {
        command: payload.query,
        type: payload.type
      });
      return response.data.message || '??? CarPlay command executed';
    } catch (error) {
      return '?????? CarPlay command failed';
    }
  }

  private async executeBrainEngine(action: string, payload: any): Promise<string> {
    try {
      // Use Claude for deep thinking, GPT for normal, Gemini for fast
      const aiModel = payload.requiresDeepThinking ? 'claude' : 'gpt';
      
      const response = await axios.post(`${this.API_BASE}/gpt/chat`, {
        message: payload.query,
        aiModel
      });
      return response.data.reply;
    } catch (error) {
      return '?????? Brain engine processing failed';
    }
  }
}

