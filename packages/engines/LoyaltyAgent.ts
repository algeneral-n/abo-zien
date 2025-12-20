/**
 * RARE 4N - Loyalty Agent (Conscious Agent)
 * Loyalty & Personal Memory Agent
 * ❌ ممنوع: أي direct calls - Cognitive Loop فقط
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { ContextStore } from '../core/ContextStore';

export interface LoyaltyPoints {
  total: number;
  level: number;
  nextLevel: number;
  progress: number;
}

export interface LoyaltyReward {
  id: string;
  type: string;
  points: number;
  description: string;
  timestamp: number;
}

export interface PersonalMemory {
  preferences: Record<string, any>;
  projects: any[];
  workflows: any[];
  documents: any[];
}

export class LoyaltyAgent extends RAREEngine {
  readonly id = 'loyalty-agent';
  readonly name = 'Loyalty & Personal Memory Agent';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  protected initialized: boolean = false;
  protected running: boolean = false;
  private points: LoyaltyPoints = {
    total: 0,
    level: 1,
    nextLevel: 100,
    progress: 0,
  };
  private rewards: LoyaltyReward[] = [];
  private memory: PersonalMemory = {
    preferences: {},
    projects: [],
    workflows: [],
    documents: [],
  };

  constructor() {
    super();
    this.contextStore = ContextStore.getInstance();
  }

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    // Subscribe to Cognitive Loop commands ONLY
    if (this.kernel) {
      this.kernel.on('agent:loyalty:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }

    // Load loyalty data
    await this.loadLoyaltyData();
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Loyalty Agent not initialized');
    }
    this.running = true;
    this.emit('loyalty:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    await this.saveLoyaltyData();
    this.emit('loyalty:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'loyalty_check':
        await this.getLoyaltyStatus();
        break;
      case 'add_points':
        await this.addPoints(command.parameters);
        break;
      case 'get_memory':
        await this.getMemory(command.parameters);
        break;
      case 'save_memory':
        await this.saveMemory(command.parameters);
        break;
      case 'get_projects':
        await this.getProjects();
        break;
      case 'save_project':
        await this.saveProject(command.parameters);
        break;
    }
  }

  /**
   * Get loyalty status
   */
  private async getLoyaltyStatus(): Promise<void> {
    try {
      this.emit('loyalty:status', {
        points: this.points,
        rewards: this.rewards.slice(-10), // Last 10 rewards
        memory: {
          projectsCount: this.memory.projects.length,
          workflowsCount: this.memory.workflows.length,
          documentsCount: this.memory.documents.length,
        },
      });
    } catch (error: any) {
      this.emit('loyalty:error', { error: error.message });
    }
  }

  /**
   * Add loyalty points
   */
  private async addPoints(parameters: any): Promise<void> {
    try {
      const points = parameters.points || 0;
      const reason = parameters.reason || 'activity';

      this.points.total += points;

      // Check level up
      if (this.points.total >= this.points.nextLevel) {
        this.points.level += 1;
        this.points.nextLevel = this.points.level * 100;
        this.emit('loyalty:level_up', {
          level: this.points.level,
        });
      }

      // Update progress
      this.points.progress = (this.points.total % 100) / 100;

      // Add reward
      const reward: LoyaltyReward = {
        id: `reward_${Date.now()}`,
        type: reason,
        points,
        description: `Earned ${points} points for ${reason}`,
        timestamp: Date.now(),
      };

      this.rewards.push(reward);

      // Keep last 100 rewards
      if (this.rewards.length > 100) {
        this.rewards.shift();
      }

      this.emit('loyalty:points_added', {
        points: this.points,
        reward,
      });
    } catch (error: any) {
      this.emit('loyalty:error', { error: error.message });
    }
  }

  /**
   * Get personal memory
   */
  private async getMemory(parameters: any): Promise<void> {
    try {
      const { type } = parameters || {};

      if (type) {
        this.emit('loyalty:memory_retrieved', {
          type,
          data: this.memory[type as keyof PersonalMemory] || [],
        });
      } else {
        this.emit('loyalty:memory_retrieved', {
          memory: this.memory,
        });
      }
    } catch (error: any) {
      this.emit('loyalty:error', { error: error.message });
    }
  }

  /**
   * Save personal memory
   */
  private async saveMemory(parameters: any): Promise<void> {
    try {
      const { type, data } = parameters || {};

      if (type && data) {
        if (Array.isArray(this.memory[type as keyof PersonalMemory])) {
          (this.memory[type as keyof PersonalMemory] as any[]).push(data);
        } else {
          (this.memory[type as keyof PersonalMemory] as any) = {
            ...(this.memory[type as keyof PersonalMemory] as any),
            ...data,
          };
        }
      }

      await this.saveLoyaltyData();

      this.emit('loyalty:memory_saved', {
        type,
        data,
      });
    } catch (error: any) {
      this.emit('loyalty:error', { error: error.message });
    }
  }

  /**
   * Get projects
   */
  private async getProjects(): Promise<void> {
    try {
      this.emit('loyalty:projects_listed', {
        projects: this.memory.projects,
        count: this.memory.projects.length,
      });
    } catch (error: any) {
      this.emit('loyalty:error', { error: error.message });
    }
  }

  /**
   * Save project
   */
  private async saveProject(parameters: any): Promise<void> {
    try {
      const project = parameters.project || {};

      const projectData = {
        id: `project_${Date.now()}`,
        ...project,
        createdAt: Date.now(),
      };

      this.memory.projects.push(projectData);

      await this.saveLoyaltyData();

      this.emit('loyalty:project_saved', {
        project: projectData,
      });
    } catch (error: any) {
      this.emit('loyalty:error', { error: error.message });
    }
  }

  /**
   * Load loyalty data
   */
  private async loadLoyaltyData(): Promise<void> {
    try {
      const context = this.contextStore.getContext();
      const stored = context.memory?.preferences?.loyalty;

      if (stored) {
        this.points = stored.points || this.points;
        this.rewards = stored.rewards || this.rewards;
        this.memory = stored.memory || this.memory;
      }
    } catch (error) {
      console.error('Failed to load loyalty data:', error);
    }
  }

  /**
   * Save loyalty data
   */
  private async saveLoyaltyData(): Promise<void> {
    try {
      this.contextStore.updateContext({
        memory: {
          preferences: {
            loyalty: {
              points: this.points,
              rewards: this.rewards,
              memory: this.memory,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to save loyalty data:', error);
    }
  }

  getStatus() {
    return {
      ...super.getStatus(),
      initialized: this.initialized,
      running: this.running,
      points: this.points.total,
      level: this.points.level,
    };
  }
}

