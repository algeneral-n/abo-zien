/**
 * RARE 4N - Policy Engine
 * ???????? ???????????????? ????????????????
 * 
 * ????????: ???????????????????? ?????????????? ???????????????? ????????????
 */

export interface Policy {
  id: string;
  name: string;
  type: 'permission' | 'security' | 'usage' | 'privacy';
  rules: PolicyRule[];
  enabled: boolean;
  priority: number;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'require_auth';
  params?: Record<string, any>;
}

export interface PolicyDecision {
  allowed: boolean;
  action: string;
  reason: string;
  requiresAuth?: boolean;
  warning?: string;
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private policies: Map<string, Policy> = new Map();
  private initialized: boolean = false;

  private constructor() {
    // Initialize default policies
    this.initializeDefaultPolicies();
  }

  static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  /**
   * Initialize Policy Engine
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Load policies from storage if needed
    // await this.loadPolicies();

    this.initialized = true;
    console.log('??? PolicyEngine initialized');
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    // Voice Recording Policy
    this.policies.set('voice_recording', {
      id: 'voice_recording',
      name: 'Voice Recording',
      type: 'permission',
      enabled: true,
      priority: 1,
      rules: [
        {
          id: 'voice_permission',
          condition: 'requires_microphone',
          action: 'require_auth',
        },
      ],
    });

    // Camera Policy
    this.policies.set('camera_access', {
      id: 'camera_access',
      name: 'Camera Access',
      type: 'permission',
      enabled: true,
      priority: 1,
      rules: [
        {
          id: 'camera_permission',
          condition: 'requires_camera',
          action: 'require_auth',
        },
      ],
    });

    // Location Policy
    this.policies.set('location_access', {
      id: 'location_access',
      name: 'Location Access',
      type: 'permission',
      enabled: true,
      priority: 1,
      rules: [
        {
          id: 'location_permission',
          condition: 'requires_location',
          action: 'require_auth',
        },
      ],
    });

    // File Access Policy
    this.policies.set('file_access', {
      id: 'file_access',
      name: 'File Access',
      type: 'security',
      enabled: true,
      priority: 2,
      rules: [
        {
          id: 'vault_access',
          condition: 'accessing_vault',
          action: 'require_auth',
        },
      ],
    });

    // AI Usage Policy
    this.policies.set('ai_usage', {
      id: 'ai_usage',
      name: 'AI Usage',
      type: 'usage',
      enabled: true,
      priority: 3,
      rules: [
        {
          id: 'ai_rate_limit',
          condition: 'excessive_ai_calls',
          action: 'warn',
        },
      ],
    });

    // Privacy Policy
    this.policies.set('privacy', {
      id: 'privacy',
      name: 'Privacy Protection',
      type: 'privacy',
      enabled: true,
      priority: 1,
      rules: [
        {
          id: 'data_sharing',
          condition: 'sharing_personal_data',
          action: 'require_auth',
        },
      ],
    });
  }

  /**
   * Evaluate policy decision
   */
  evaluate(context: {
    action: string;
    resource?: string;
    user?: any;
    params?: Record<string, any>;
  }): PolicyDecision {
    try {
      // Get relevant policies
      const relevantPolicies = this.getRelevantPolicies(context.action);

      // No policies found - allow by default
      if (relevantPolicies.length === 0) {
        return {
          allowed: true,
          action: context.action,
          reason: 'No policies defined',
        };
      }

      // Evaluate each policy
      for (const policy of relevantPolicies) {
        if (!policy.enabled) continue;

        for (const rule of policy.rules) {
          const result = this.evaluateRule(rule, context);
          if (!result.allowed) {
            return result;
          }
        }
      }

      // All policies passed
      return {
        allowed: true,
        action: context.action,
        reason: 'All policies passed',
      };
    } catch (error) {
      console.error('PolicyEngine evaluation error:', error);
      // Fail-safe: deny on error
      return {
        allowed: false,
        action: context.action,
        reason: 'Policy evaluation error',
      };
    }
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(
    rule: PolicyRule,
    context: { action: string; resource?: string; params?: Record<string, any> }
  ): PolicyDecision {
    // Simple rule evaluation logic
    switch (rule.action) {
      case 'allow':
        return {
          allowed: true,
          action: context.action,
          reason: 'Policy allows action',
        };

      case 'deny':
        return {
          allowed: false,
          action: context.action,
          reason: 'Policy denies action',
        };

      case 'warn':
        return {
          allowed: true,
          action: context.action,
          reason: 'Action allowed with warning',
          warning: `Warning: ${rule.condition}`,
        };

      case 'require_auth':
        return {
          allowed: true,
          action: context.action,
          reason: 'Authentication required',
          requiresAuth: true,
        };

      default:
        return {
          allowed: true,
          action: context.action,
          reason: 'Unknown rule action',
        };
    }
  }

  /**
   * Get relevant policies for an action
   */
  private getRelevantPolicies(action: string): Policy[] {
    const policies: Policy[] = [];

    // Map actions to policies
    if (action.includes('voice') || action.includes('record')) {
      const policy = this.policies.get('voice_recording');
      if (policy) policies.push(policy);
    }

    if (action.includes('camera') || action.includes('scan')) {
      const policy = this.policies.get('camera_access');
      if (policy) policies.push(policy);
    }

    if (action.includes('location') || action.includes('map')) {
      const policy = this.policies.get('location_access');
      if (policy) policies.push(policy);
    }

    if (action.includes('file') || action.includes('vault')) {
      const policy = this.policies.get('file_access');
      if (policy) policies.push(policy);
    }

    if (action.includes('ai') || action.includes('gpt')) {
      const policy = this.policies.get('ai_usage');
      if (policy) policies.push(policy);
    }

    // Sort by priority
    return policies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Add or update policy
   */
  setPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Enable/disable policy
   */
  setPolicyEnabled(policyId: string, enabled: boolean): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.enabled = enabled;
    }
  }

  /**
   * Get all policies
   */
  getAllPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }
}

