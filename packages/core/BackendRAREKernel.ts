/**
 * RARE 4N - Unified Kernel (المخ المركزي)
 * The central intelligence that orchestrates all engines
 */

import { RAREPersonalityEngine } from './RAREPersonalityEngine';
import { RAREPlanner } from './RAREPlanner';
import { RARECognition } from './RARECognition';
import { RAREGateway } from './RAREGateway';
import { RAREDialectEngine } from './RAREDialectEngine';
import { RAREVoiceOS } from './RAREVoiceOS';
import { RAREEmotionEngine } from './RAREEmotionEngine';
import { RAREThemeEngine } from './RAREThemeEngine';
import { RAREContextManager } from './RAREContextManager';

export class RAREKernel {
  private static _instance: RAREKernel;

  public personality: RAREPersonalityEngine;
  public planner: RAREPlanner;
  public cognition: RARECognition;
  public gateway: RAREGateway;
  public dialect: RAREDialectEngine;
  public voiceOS: RAREVoiceOS;
  public emotion: RAREEmotionEngine;
  public theme: RAREThemeEngine;
  public context: RAREContextManager;

  private constructor() {
    this.personality = new RAREPersonalityEngine();
    this.planner = new RAREPlanner();
    this.cognition = new RARECognition();
    this.gateway = new RAREGateway();
    this.dialect = new RAREDialectEngine();
    this.voiceOS = new RAREVoiceOS();
    this.emotion = new RAREEmotionEngine();
    this.theme = new RAREThemeEngine();
    this.context = RAREContextManager.getInstance();
  }

  public static get instance(): RAREKernel {
    if (!this._instance) {
      this._instance = new RAREKernel();
    }
    return this._instance;
  }

  /**
   * المعالج الرئيسي لأي طلب
   * Main processor for any user request
   */
  public async process(userInput: string, context?: any) {
    try {
      // 1) تحليل الشخصية - Analyze personality mode
      const persona = this.personality.getProfile();

      // 2) فهم السياق والذكريات - Context & Memory
      this.cognition.absorb(userInput, context);

      // 3) تحويل الطلب لخطة - Convert to executable plan
      const plan = this.planner.buildPlan(userInput, {
        persona,
        memory: this.cognition.getContext(),
        dialect: this.dialect.getDialect()
      });

      // 4) تنفيذ الخطة عبر المحركات - Execute via engines
      const result = await this.gateway.executePlan(plan);

      // 5) تطبيق أسلوب الشخصية - Apply personality style
      const styled = this.personality.applyStyleToResponse(result, persona);

      // 6) تطبيق اللهجة - Apply dialect
      const dialectStyled = this.dialect.applyDialect(styled);

      // 7) تخزين النتيجة في الذاكرة - Store in memory
      this.cognition.learn(dialectStyled, result.metadata);

      return {
        response: dialectStyled,
        persona,
        plan,
        metadata: {
          confidence: result.confidence || 0.95,
          executionTime: result.executionTime,
          enginesUsed: plan.map((p: any) => p.engine)
        }
      };
    } catch (error) {
      console.error('RAREKernel process error:', error);
      return {
        response: this.dialect.applyDialect('عذراً، حدث خطأ في المعالجة'),
        error: (error as Error).message
      };
    }
  }
}
