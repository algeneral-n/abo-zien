/**
 * RARE 4N - Research Agent (Conscious Agent)
 * Research & Evolution Agent - Self-improvement
 * ??? ??????????: ???? direct calls - Cognitive Loop ??????
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';
import { ContextStore } from '../core/ContextStore';

export interface ResearchAnalysis {
  usage: {
    totalInteractions: number;
    averagePerDay: number;
    mostUsedFeatures: string[];
    leastUsedFeatures: string[];
  };
  weaknesses: {
    feature: string;
    issue: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  improvements: {
    feature: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }[];
}

export interface EvolutionProposal {
  id: string;
  type: 'feature' | 'optimization' | 'bug_fix';
  description: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  timestamp: number;
}

export class ResearchAgent extends RAREEngine {
  readonly id = 'research-agent';
  readonly name = 'Research & Evolution Agent';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  private contextStore: ContextStore;
  protected initialized: boolean = false;
  protected running: boolean = false;
  private analysis: ResearchAnalysis = {
    usage: {
      totalInteractions: 0,
      averagePerDay: 0,
      mostUsedFeatures: [],
      leastUsedFeatures: [],
    },
    weaknesses: [],
    improvements: [],
  };
  private proposals: EvolutionProposal[] = [];

  constructor() {
    super();
    this.contextStore = ContextStore.getInstance();
  }

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    // Subscribe to Cognitive Loop commands ONLY
    if (this.kernel) {
      this.kernel.on('agent:research:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });

      // Listen to system events for analysis
      this.kernel.on('cognitive:decision', (event) => {
        this.trackUsage(event.data);
      });

      this.kernel.on('agent:*:error', (event) => {
        this.trackWeakness(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Research Agent not initialized');
    }
    this.running = true;

    // Start periodic analysis
    this.startPeriodicAnalysis();

    this.emit('research:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('research:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'research_query':
        await this.performResearch(command.parameters);
        break;
      case 'analyze_usage':
        await this.analyzeUsage();
        break;
      case 'detect_weaknesses':
        await this.detectWeaknesses();
        break;
      case 'propose_improvements':
        await this.proposeImprovements();
        break;
      case 'get_proposals':
        await this.getProposals();
        break;
    }
  }

  /**
   * Perform research
   */
  private async performResearch(parameters: any): Promise<void> {
    try {
      const { query, depth } = parameters || {};

      this.emit('research:researching', {
        query,
        depth: depth || 'medium',
      });

      // Research via backend AI
      const researchResult = {
        query,
        results: ['Research result 1', 'Research result 2'],
        sources: ['Source 1', 'Source 2'],
        summary: 'Research summary...',
      };

      this.emit('research:research_complete', {
        result: researchResult,
      });
    } catch (error: any) {
      this.emit('research:error', { error: error.message });
    }
  }

  /**
   * Analyze usage
   */
  private async analyzeUsage(): Promise<void> {
    try {
      const context = this.contextStore.getContext();
      const interactions = context.session?.interactions || [];
      const history = context.memory?.history || [];

      this.analysis.usage.totalInteractions = interactions.length + history.length;
      this.analysis.usage.averagePerDay = this.calculateAveragePerDay(interactions, history);

      // Analyze feature usage
      const featureUsage = this.analyzeFeatureUsage(interactions, history);
      this.analysis.usage.mostUsedFeatures = featureUsage.mostUsed;
      this.analysis.usage.leastUsedFeatures = featureUsage.leastUsed;

      this.emit('research:usage_analyzed', {
        analysis: this.analysis.usage,
      });
    } catch (error: any) {
      this.emit('research:error', { error: error.message });
    }
  }

  /**
   * Detect weaknesses
   */
  private async detectWeaknesses(): Promise<void> {
    try {
      const context = this.contextStore.getContext();
      const interactions = context.session?.interactions || [];

      // Analyze errors and issues
      const weaknesses = this.identifyWeaknesses(interactions);

      this.analysis.weaknesses = weaknesses;

      this.emit('research:weaknesses_detected', {
        weaknesses,
      });
    } catch (error: any) {
      this.emit('research:error', { error: error.message });
    }
  }

  /**
   * Propose improvements
   */
  private async proposeImprovements(): Promise<void> {
    try {
      const improvements = this.generateImprovements();

      this.analysis.improvements = improvements;

      // Create evolution proposals
      improvements.forEach((improvement) => {
        const proposal: EvolutionProposal = {
          id: `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'feature',
          description: improvement.suggestion,
          priority: improvement.priority,
          impact: improvement.impact,
          effort: this.estimateEffort(improvement),
          timestamp: Date.now(),
        };

        this.proposals.push(proposal);
      });

      this.emit('research:improvements_proposed', {
        improvements,
        proposals: this.proposals.slice(-10), // Last 10 proposals
      });
    } catch (error: any) {
      this.emit('research:error', { error: error.message });
    }
  }

  /**
   * Get proposals
   */
  private async getProposals(): Promise<void> {
    try {
      this.emit('research:proposals_listed', {
        proposals: this.proposals,
        count: this.proposals.length,
      });
    } catch (error: any) {
      this.emit('research:error', { error: error.message });
    }
  }

  /**
   * Track usage
   */
  private trackUsage(decision: any): void {
    this.analysis.usage.totalInteractions += 1;
  }

  /**
   * Track weakness
   */
  private trackWeakness(error: any): void {
    const weakness = {
      feature: error.agent || 'unknown',
      issue: error.error || 'unknown',
      frequency: 1,
      severity: 'medium' as const,
    };

    const existing = this.analysis.weaknesses.find(
      (w) => w.feature === weakness.feature && w.issue === weakness.issue
    );

    if (existing) {
      existing.frequency += 1;
    } else {
      this.analysis.weaknesses.push(weakness);
    }
  }

  /**
   * Calculate average per day
   */
  private calculateAveragePerDay(interactions: any[], history: any[]): number {
    const allInteractions = [...interactions, ...history];
    if (allInteractions.length === 0) return 0;

    const firstInteraction = allInteractions[0]?.timestamp || Date.now();
    const days = Math.max(1, (Date.now() - firstInteraction) / (1000 * 60 * 60 * 24));

    return allInteractions.length / days;
  }

  /**
   * Analyze feature usage
   */
  private analyzeFeatureUsage(interactions: any[], history: any[]): {
    mostUsed: string[];
    leastUsed: string[];
  } {
    const featureCounts: Record<string, number> = {};

    [...interactions, ...history].forEach((interaction) => {
      const feature = interaction.intent?.type || 'unknown';
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    const sorted = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]);

    return {
      mostUsed: sorted.slice(0, 5).map(([feature]) => feature),
      leastUsed: sorted.slice(-5).map(([feature]) => feature),
    };
  }

  /**
   * Identify weaknesses
   */
  private identifyWeaknesses(interactions: any[]): ResearchAnalysis['weaknesses'] {
    return this.analysis.weaknesses;
  }

  /**
   * Generate improvements
   */
  private generateImprovements(): ResearchAnalysis['improvements'] {
    const improvements: ResearchAnalysis['improvements'] = [];

    // Analyze weaknesses and generate improvements
    this.analysis.weaknesses.forEach((weakness) => {
      if (weakness.frequency > 5) {
        improvements.push({
          feature: weakness.feature,
          suggestion: `Fix ${weakness.issue} in ${weakness.feature}`,
          priority: weakness.severity === 'high' ? 'high' : 'medium',
          impact: 'high',
        });
      }
    });

    return improvements;
  }

  /**
   * Estimate effort
   */
  private estimateEffort(improvement: any): 'low' | 'medium' | 'high' {
    if (improvement.priority === 'high' && improvement.impact === 'high') {
      return 'high';
    }
    if (improvement.priority === 'medium' || improvement.impact === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Start periodic analysis
   */
  private startPeriodicAnalysis(): void {
    // Run analysis every hour
    setInterval(() => {
      if (this.running) {
        this.analyzeUsage();
        this.detectWeaknesses();
        this.proposeImprovements();
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  getStatus() {
    return {
      ...super.getStatus(),
      initialized: this.initialized,
      running: this.running,
      totalInteractions: this.analysis.usage.totalInteractions,
      proposalsCount: this.proposals.length,
    };
  }
}


