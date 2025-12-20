/**
 * RARE 4N - Auto Builder Agent (Conscious Agent)
 * ??????? Auto Builder Agent - ?????? ????????????
 * Auto App Generation, Libraries, Systems, Themes, EAS Builds
 * Controlled 100% by Cognitive Loop
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { AppBuilder } from '../services/api';

export class BuilderAgent extends RAREEngine {
  readonly id = 'builder-agent';
  readonly name = 'Auto Builder Agent';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;
  private buildQueue: any[] = [];

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    // Subscribe to Cognitive Loop commands ONLY
    if (this.kernel) {
      this.kernel.on('agent:builder:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Builder Agent not initialized');
    }
    this.running = true;
    this.emit('builder:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('builder:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'build_app':
        await this.buildApp(command.parameters);
        break;
      case 'generate_code':
        await this.generateCode(command.parameters);
        break;
      case 'get_templates':
        await this.getTemplates();
        break;
      case 'get_systems':
        await this.getSystems();
        break;
      case 'get_themes':
        await this.getThemes();
        break;
      case 'trigger_eas_build':
        await this.triggerEASBuild(command.parameters);
        break;
      case 'get_build_status':
        await this.getBuildStatus(command.parameters);
        break;
    }
  }

  /**
   * Build app (from Cognitive Loop)
   */
  private async buildApp(parameters: any): Promise<void> {
    try {
      this.emit('builder:building', { appName: parameters.appName });
      
      const result = await AppBuilder.generate(parameters);
      
      this.emit('builder:app_built', { 
        result,
        appName: parameters.appName,
      });
    } catch (error) {
      this.emit('builder:error', { error, action: 'build_app' });
    }
  }

  /**
   * Generate code (from Cognitive Loop)
   */
  private async generateCode(parameters: any): Promise<void> {
    try {
      this.emit('builder:generating', {});
      
      const result = await AppBuilder.generateComponent(parameters);
      
      this.emit('builder:code_generated', { result });
    } catch (error) {
      this.emit('builder:error', { error, action: 'generate_code' });
    }
  }

  /**
   * Get templates (from Cognitive Loop)
   */
  private async getTemplates(): Promise<void> {
    try {
      const templates = await AppBuilder.getTemplates();
      this.emit('builder:templates', { templates });
    } catch (error) {
      this.emit('builder:error', { error, action: 'get_templates' });
    }
  }

  /**
   * Get systems (from Cognitive Loop)
   */
  private async getSystems(): Promise<void> {
    try {
      const systems = await AppBuilder.getSystems();
      this.emit('builder:systems', { systems });
    } catch (error) {
      this.emit('builder:error', { error, action: 'get_systems' });
    }
  }

  /**
   * Get themes (from Cognitive Loop)
   */
  private async getThemes(): Promise<void> {
    try {
      const themes = await AppBuilder.getThemes();
      this.emit('builder:themes', { themes });
    } catch (error) {
      this.emit('builder:error', { error, action: 'get_themes' });
    }
  }

  /**
   * Trigger EAS build (from Cognitive Loop)
   */
  private async triggerEASBuild(parameters: any): Promise<void> {
    try {
      this.emit('builder:build_triggered', { 
        platform: parameters.platform,
        buildType: parameters.buildType,
      });
      
      // EAS build logic (via backend or direct)
      const result = await AppBuilder.build(parameters);
      
      this.emit('builder:build_started', { 
        buildId: result.buildId,
        status: 'in_progress',
      });
    } catch (error) {
      this.emit('builder:error', { error, action: 'trigger_eas_build' });
    }
  }

  /**
   * Get build status (from Cognitive Loop)
   */
  private async getBuildStatus(parameters: any): Promise<void> {
    try {
      const status = await AppBuilder.getBuildStatus(parameters.buildId);
      this.emit('builder:build_status', { status });
    } catch (error) {
      this.emit('builder:error', { error, action: 'get_build_status' });
    }
  }

  getStatus() {
    return {
      ...super.getStatus(),
      initialized: this.initialized,
      running: this.running,
      queueLength: this.buildQueue.length,
    };
  }
}

