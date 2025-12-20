/**
 * RARE 4N - Council Agent
 * مجلس المستشارين - يعطي أفضل الآراء للمستخدم (نادر)
 * ✅ يمر عبر Kernel و Cognitive Loop فقط
 */

import { BaseAgent } from './BaseAgent';
import { RAREKernel } from '../RAREKernel';

export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  perspective: string;
}

export interface CouncilDebate {
  id: string;
  topic: string;
  question: string;
  members: CouncilMember[];
  opinions: Array<{
    memberId: string;
    memberName: string;
    opinion: string;
    reasoning: string;
    confidence: number;
  }>;
  consensus: string | null;
  recommendation: string | null;
  timestamp: number;
}

export class CouncilAgent extends BaseAgent {
  private councilMembers: CouncilMember[] = [
    {
      id: 'strategic',
      name: 'المستشار الاستراتيجي',
      role: 'Strategic Advisor',
      expertise: ['business', 'planning', 'growth'],
      perspective: 'يركز على التخطيط طويل المدى والتطور الاستراتيجي',
    },
    {
      id: 'financial',
      name: 'المستشار المالي',
      role: 'Financial Advisor',
      expertise: ['finance', 'investment', 'wealth'],
      perspective: 'يركز على التقدم المالي والاستثمار والنمو الاقتصادي',
    },
    {
      id: 'social',
      name: 'المستشار الاجتماعي',
      role: 'Social Advisor',
      expertise: ['relationships', 'networking', 'community'],
      perspective: 'يركز على التقدم الاجتماعي والعلاقات والمجتمع',
    },
    {
      id: 'health',
      name: 'المستشار الصحي',
      role: 'Health Advisor',
      expertise: ['health', 'wellness', 'fitness'],
      perspective: 'يركز على الصحة والعافية واللياقة البدنية',
    },
    {
      id: 'life',
      name: 'المستشار الحياتي',
      role: 'Life Advisor',
      expertise: ['lifestyle', 'balance', 'happiness'],
      perspective: 'يركز على التوازن الحياتي والسعادة والرفاهية',
    },
  ];

  private debates: Map<string, CouncilDebate> = new Map();
  private ownerGoals: {
    financial: string[];
    social: string[];
    health: string[];
    life: string[];
  } = {
    financial: [],
    social: [],
    health: [],
    life: [],
  };

  constructor() {
    super({
      id: 'council',
      name: 'Council Agent',
      description: 'مجلس المستشارين - يعطي أفضل الآراء للمستخدم',
      capabilities: ['debate', 'recommendation', 'advice', 'consensus', 'client_greeting', 'client_action'],
    });
  }

  protected async onInit(): Promise<void> {
    // Load owner goals from memory
    await this.loadOwnerGoals();
    
    console.log('[CouncilAgent] Initialized ✅');
  }


  /**
   * Load owner goals from Memory Engine
   */
  private async loadOwnerGoals(): Promise<void> {
    if (!this.kernel) return;
    
    // Access Memory Engine through Kernel
    const memoryEngine = this.kernel.getMemoryEngine();
    if (!memoryEngine) return;

    // Load goals from memory
    const financialGoals = await memoryEngine.query({
      tags: ['goal', 'financial', 'owner'],
      limit: 10,
    });
    const socialGoals = await memoryEngine.query({
      tags: ['goal', 'social', 'owner'],
      limit: 10,
    });
    const healthGoals = await memoryEngine.query({
      tags: ['goal', 'health', 'owner'],
      limit: 10,
    });
    const lifeGoals = await memoryEngine.query({
      tags: ['goal', 'life', 'owner'],
      limit: 10,
    });

    this.ownerGoals.financial = financialGoals.map(m => m.content?.goal || '');
    this.ownerGoals.social = socialGoals.map(m => m.content?.goal || '');
    this.ownerGoals.health = healthGoals.map(m => m.content?.goal || '');
    this.ownerGoals.life = lifeGoals.map(m => m.content?.goal || '');
  }

  /**
   * Execute action (required by BaseAgent)
   */
  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    switch (action) {
      case 'start_debate':
        return await this.startDebate(parameters.topic, parameters.question);
      
      case 'get_recommendation':
        return await this.getRecommendation(parameters.question, parameters.context);
      
      case 'update_goals':
        return await this.updateGoals(parameters.goals);
      
      case 'get_goals':
        return await this.getGoals();
      
      case 'client_greeting':
        return await this.getClientGreeting(parameters.clientInfo);
      
      case 'client_action':
        return await this.getClientAction(parameters.clientRequest, parameters.context);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Start a council debate on a topic
   */
  private async startDebate(topic: string, question: string): Promise<CouncilDebate> {
    const debateId = `debate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get opinions from each council member
    const opinions = await Promise.all(
      this.councilMembers.map(async (member) => {
        const opinion = await this.getMemberOpinion(member, question, topic);
        return {
          memberId: member.id,
          memberName: member.name,
          opinion: opinion.opinion,
          reasoning: opinion.reasoning,
          confidence: opinion.confidence,
        };
      })
    );

    // Generate consensus and recommendation
    const consensus = this.generateConsensus(opinions);
    const recommendation = this.generateRecommendation(opinions, consensus, topic);

    const debate: CouncilDebate = {
      id: debateId,
      topic,
      question,
      members: this.councilMembers,
      opinions,
      consensus,
      recommendation,
      timestamp: Date.now(),
    };

    this.debates.set(debateId, debate);

    // Emit result via Kernel
    this.kernel?.emit({
      type: 'agent:council:response',
      data: {
        debate,
        discussions: Array.from(this.debates.values()),
      },
      timestamp: Date.now(),
      source: 'council',
    });

    return debate;
  }

  /**
   * Get opinion from a council member
   */
  private async getMemberOpinion(
    member: CouncilMember,
    question: string,
    topic: string
  ): Promise<{ opinion: string; reasoning: string; confidence: number }> {
    // Use AI Engine to generate opinion based on member's perspective
    if (!this.kernel) {
      // Fallback
      return {
        opinion: `من وجهة نظر ${member.name}: يجب التركيز على ${member.perspective}`,
        reasoning: member.perspective,
        confidence: 0.7,
      };
    }
    
    const aiEngine = this.kernel.getEngine('ai');
    if (!aiEngine) {
      // Fallback
      return {
        opinion: `من وجهة نظر ${member.name}: يجب التركيز على ${member.perspective}`,
        reasoning: member.perspective,
        confidence: 0.7,
      };
    }

    const prompt = `أنت ${member.name} (${member.role})، متخصص في ${member.expertise.join(' و ')}.
    
وجهة نظرك: ${member.perspective}

الهدف: التطور المستمر والتقدم المالي والاجتماعي والحياتي والصحي لنادر (المستخدم).

السؤال: ${question}
الموضوع: ${topic}

أعط رأيك كخبير، مع التركيز على:
1. كيف يساعد هذا نادر في التطور؟
2. ما هي الفوائد المالية/الاجتماعية/الحياتية/الصحية؟
3. ما هي التوصيات العملية؟

الولاء: أنت مخلص جداً لنادر وتريد الأفضل له دائماً.`;

    try {
      const response = await aiEngine.executeAction('ai_chat', {
        message: prompt,
        context: {
          member: member.name,
          role: member.role,
          perspective: member.perspective,
        },
      });

      return {
        opinion: response.response || response.text || `رأي ${member.name}`,
        reasoning: `بناءً على خبرة ${member.name} في ${member.expertise.join(' و ')}`,
        confidence: 0.85,
      };
    } catch (error) {
      console.error(`[CouncilAgent] Error getting opinion from ${member.name}:`, error);
      return {
        opinion: `من وجهة نظر ${member.name}: يجب التركيز على ${member.perspective}`,
        reasoning: member.perspective,
        confidence: 0.7,
      };
    }
  }

  /**
   * Generate consensus from opinions
   */
  private generateConsensus(opinions: any[]): string {
    // Analyze common themes
    const themes: Map<string, number> = new Map();
    
    opinions.forEach(opinion => {
      const words = opinion.opinion.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) {
          themes.set(word, (themes.get(word) || 0) + 1);
        }
      });
    });

    const topThemes = Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    return `الإجماع العام: التركيز على ${topThemes.join(' و ')} لتحقيق التطور المستمر لنادر.`;
  }

  /**
   * Generate final recommendation
   */
  private generateRecommendation(opinions: any[], consensus: string, topic: string): string {
    const topOpinions = opinions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return `التوصية النهائية من المجلس:

${consensus}

الآراء الرئيسية:
${topOpinions.map((o, i) => `${i + 1}. ${o.memberName}: ${o.opinion.substring(0, 100)}...`).join('\n')}

الهدف: التطور المستمر والتقدم المالي والاجتماعي والحياتي والصحي لنادر.

الإجراء المقترح: اتباع نهج متوازن يجمع بين أفضل الآراء مع التركيز على تحقيق أهداف نادر.`;
  }

  /**
   * Get recommendation for a specific question
   */
  private async getRecommendation(question: string, context?: any): Promise<string> {
    const debate = await this.startDebate('general', question);
    return debate.recommendation || debate.consensus || 'لا توجد توصية متاحة حالياً';
  }

  /**
   * Update owner goals
   */
  private async updateGoals(goals: {
    financial?: string[];
    social?: string[];
    health?: string[];
    life?: string[];
  }): Promise<void> {
    if (goals.financial) this.ownerGoals.financial = goals.financial;
    if (goals.social) this.ownerGoals.social = goals.social;
    if (goals.health) this.ownerGoals.health = goals.health;
    if (goals.life) this.ownerGoals.life = goals.life;

    // Store in Memory Engine
    if (!this.kernel) return;
    
    const memoryEngine = this.kernel.getMemoryEngine();
    if (memoryEngine) {
      if (goals.financial) {
        goals.financial.forEach(goal => {
          memoryEngine.storeLearning({
            id: `goal_financial_${Date.now()}`,
            type: 'goal',
            category: 'financial',
            content: { goal, owner: 'nader' },
            importance: 0.9,
            tags: ['goal', 'financial', 'owner'],
          });
        });
      }
      // Similar for other goals...
    }
  }

  /**
   * Get current goals
   */
  private getGoals(): typeof this.ownerGoals {
    return { ...this.ownerGoals };
  }

  /**
   * Get client greeting recommendation
   */
  private async getClientGreeting(clientInfo: any): Promise<string> {
    const question = `كيف أرحب بعميل جديد اسمه ${clientInfo.name || 'العميل'}؟`;
    const recommendation = await this.getRecommendation(question, {
      clientInfo,
      type: 'greeting',
    });

    return recommendation || `مرحباً ${clientInfo.name || 'عزيزي العميل'}! أهلاً بك في RARE 4N. كيف يمكنني مساعدتك اليوم؟`;
  }

  /**
   * Get action recommendation for client request
   */
  private async getClientAction(clientRequest: string, context?: any): Promise<string> {
    const question = `ماذا يجب أن أفعل عندما يطلب العميل: "${clientRequest}"؟`;
    const recommendation = await this.getRecommendation(question, {
      clientRequest,
      context,
      type: 'client_action',
    });

    return recommendation || `يجب معالجة طلب العميل بسرعة وكفاءة مع الحفاظ على رضاه.`;
  }
}

