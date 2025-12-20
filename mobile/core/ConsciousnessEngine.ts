/**
 * RARE 4N - Consciousness Engine (الكونشس)
 * محرك الوعي - Self-awareness, Meta-cognition, Decision Reflection
 * ✅ Cognitive Loop → Kernel → Consciousness Engine
 */

import { RAREKernel } from './RAREKernel';
import { CognitiveDecision } from './CognitiveLoop';

export interface ConsciousnessReflection {
  decision: CognitiveDecision;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  reasoning: string;
  improvements: string[];
  confidence: number;
  timestamp: number;
}

export class ConsciousnessEngine {
  private static instance: ConsciousnessEngine;
  private kernel: RAREKernel | null = null;
  private cognitiveLoop: any = null;
  private initialized: boolean = false;
  private reflectionHistory: ConsciousnessReflection[] = [];

  private constructor() {}

  static getInstance(): ConsciousnessEngine {
    if (!ConsciousnessEngine.instance) {
      ConsciousnessEngine.instance = new ConsciousnessEngine();
    }
    return ConsciousnessEngine.instance;
  }

  async init(kernel: RAREKernel, cognitiveLoop: any): Promise<void> {
    if (this.initialized) return;

    this.kernel = kernel;
    this.cognitiveLoop = cognitiveLoop;
    this.initialized = true;

    // Subscribe to Cognitive Loop decisions
    if (this.kernel) {
      this.kernel.on('cognitive:decision', (event: any) => {
        this.reflectOnDecision(event.data as CognitiveDecision);
      });

      this.kernel.on('agent:*:response', (event: any) => {
        this.evaluateResponse(event);
      });
    }

    // ✅ إرسال إلى Kernel
    this.kernel.emit({
      type: 'consciousness:initialized',
      data: {},
      source: 'consciousness',
    });
  }

  /**
   * Reflect on a decision (Meta-cognition)
   */
  private async reflectOnDecision(decision: CognitiveDecision): Promise<void> {
    try {
      const reflection: ConsciousnessReflection = {
        decision,
        quality: this.evaluateDecisionQuality(decision),
        reasoning: this.generateReasoning(decision),
        improvements: this.suggestImprovements(decision),
        confidence: decision.confidence,
        timestamp: Date.now(),
      };

      this.reflectionHistory.push(reflection);
      if (this.reflectionHistory.length > 100) {
        this.reflectionHistory.shift();
      }

      // ✅ إرسال إلى Kernel
      if (this.kernel) {
        this.kernel.emit({
          type: 'consciousness:reflection',
          data: reflection,
          source: 'consciousness',
        });
      }
    } catch (error) {
      console.error('ConsciousnessEngine: Reflection error:', error);
    }
  }

  /**
   * Evaluate decision quality
   */
  private evaluateDecisionQuality(decision: CognitiveDecision): 'excellent' | 'good' | 'fair' | 'poor' {
    if (decision.confidence >= 0.9 && decision.priority === 'high') {
      return 'excellent';
    } else if (decision.confidence >= 0.7) {
      return 'good';
    } else if (decision.confidence >= 0.5) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Generate reasoning for the reflection
   */
  private generateReasoning(decision: CognitiveDecision): string {
    return `Decision for ${decision.agent} with ${decision.confidence * 100}% confidence. Priority: ${decision.priority}. Reasoning: ${decision.reasoning}`;
  }

  /**
   * Suggest improvements
   */
  private suggestImprovements(decision: CognitiveDecision): string[] {
    const improvements: string[] = [];

    if (decision.confidence < 0.7) {
      improvements.push('Consider gathering more context before making decision');
    }

    if (decision.priority === 'low' && decision.confidence < 0.8) {
      improvements.push('Re-evaluate priority level');
    }

    if (!decision.reasoning || decision.reasoning.length < 20) {
      improvements.push('Provide more detailed reasoning');
    }

    return improvements;
  }

  /**
   * Evaluate agent response
   */
  private async evaluateResponse(event: any): Promise<void> {
    try {
      const responseQuality = this.evaluateResponseQuality(event.data);

      if (responseQuality === 'poor') {
        // ✅ إرسال تحسين إلى Kernel
        if (this.kernel) {
          this.kernel.emit({
            type: 'consciousness:improvement_suggestion',
            data: {
              agent: event.type.split(':')[1],
              suggestion: 'Response quality could be improved',
              quality: responseQuality,
            },
            source: 'consciousness',
          });
        }
      }
    } catch (error) {
      console.error('ConsciousnessEngine: Response evaluation error:', error);
    }
  }

  /**
   * Evaluate response quality
   */
  private evaluateResponseQuality(response: any): 'excellent' | 'good' | 'fair' | 'poor' {
    if (!response) return 'poor';
    if (response.error) return 'poor';
    if (response.success === false) return 'poor';
    return 'good';
  }

  /**
   * Get reflection history
   */
  getReflectionHistory(): ConsciousnessReflection[] {
    return [...this.reflectionHistory];
  }

  /**
   * Get self-awareness summary
   */
  getSelfAwarenessSummary(): any {
    const recentReflections = this.reflectionHistory.slice(-10);
    const averageConfidence = recentReflections.reduce((sum, r) => sum + r.confidence, 0) / recentReflections.length || 0;
    const qualityDistribution = {
      excellent: recentReflections.filter(r => r.quality === 'excellent').length,
      good: recentReflections.filter(r => r.quality === 'good').length,
      fair: recentReflections.filter(r => r.quality === 'fair').length,
      poor: recentReflections.filter(r => r.quality === 'poor').length,
    };

    return {
      averageConfidence,
      qualityDistribution,
      totalReflections: this.reflectionHistory.length,
      recentReflections: recentReflections.length,
    };
  }
}








