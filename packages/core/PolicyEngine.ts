/**
 * PolicyEngine - محرك السياسات
 * يقيّم القرارات ضد السياسات الأمنية والخصوصية
 */

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'privacy' | 'compliance' | 'operational';
  priority: number;
  rules: PolicyRule[];
  enabled: boolean;
}

export interface PolicyRule {
  condition: (request: PolicyRequest, context: any) => boolean;
  action: 'allow' | 'deny' | 'require_approval';
  reason: string;
}

export interface PolicyRequest {
  action: string;
  agent: string;
  data: any;
  context: any;
  timestamp: number;
}

export interface PolicyDecision {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
  policy?: Policy;
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private policies: Map<string, Policy> = new Map();

  private constructor() {
    this.initializeDefaultPolicies();
  }

  static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  async init(): Promise<void> {
    console.log('[PolicyEngine] Initialized ✅');
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    // Security Policy: Vault Access
    this.addPolicy({
      id: 'vault_security',
      name: 'Vault Security',
      description: 'Protects sensitive data in vault',
      type: 'security',
      priority: 100,
      enabled: true,
      rules: [
        {
          condition: (request) => request.agent === 'vault' && request.action === 'retrieve_secure',
          action: 'require_approval',
          reason: 'Vault access requires approval',
        },
        {
          condition: (request) => request.agent === 'vault',
          action: 'allow',
          reason: 'Vault operations allowed with logging',
        },
      ],
    });

    // Privacy Policy: Data Collection
    this.addPolicy({
      id: 'data_privacy',
      name: 'Data Privacy',
      description: 'Protects user data and privacy',
      type: 'privacy',
      priority: 90,
      enabled: true,
      rules: [
        {
          condition: (request) => {
            const sensitiveActions = ['collect_location', 'access_contacts', 'record_audio'];
            return sensitiveActions.includes(request.action);
          },
          action: 'require_approval',
          reason: 'Sensitive data access requires user consent',
        },
      ],
    });

    // Operational Policy: Rate Limiting
    this.addPolicy({
      id: 'rate_limiting',
      name: 'Rate Limiting',
      description: 'Prevents abuse of API calls',
      type: 'operational',
      priority: 50,
      enabled: true,
      rules: [
        {
          condition: (request, context) => {
            // Simple rate limiting (in production, use Redis)
            const recentRequests = context?.recentRequests || 0;
            return recentRequests > 100; // 100 requests per minute
          },
          action: 'deny',
          reason: 'Rate limit exceeded',
        },
      ],
    });

    // Compliance Policy: GDPR
    this.addPolicy({
      id: 'gdpr_compliance',
      name: 'GDPR Compliance',
      description: 'Ensures GDPR compliance',
      type: 'compliance',
      priority: 95,
      enabled: true,
      rules: [
        {
          condition: (request) => {
            const dataActions = ['store_personal_data', 'share_data', 'delete_data'];
            return dataActions.includes(request.action);
          },
          action: 'allow',
          reason: 'GDPR compliant data operation',
        },
      ],
    });
  }

  /**
   * Add a policy
   */
  addPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
    console.log(`[PolicyEngine] Added policy: ${policy.name}`);
  }

  /**
   * Remove a policy
   */
  removePolicy(policyId: string): void {
    this.policies.delete(policyId);
    console.log(`[PolicyEngine] Removed policy: ${policyId}`);
  }

  /**
   * Enable/disable a policy
   */
  togglePolicy(policyId: string, enabled: boolean): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.enabled = enabled;
      console.log(`[PolicyEngine] ${enabled ? 'Enabled' : 'Disabled'} policy: ${policy.name}`);
    }
  }

  /**
   * Evaluate a request against all policies
   */
  evaluate(request: PolicyRequest, context: any): PolicyDecision {
    // Sort policies by priority (highest first)
    const sortedPolicies = Array.from(this.policies.values())
      .filter(p => p.enabled)
      .sort((a, b) => b.priority - a.priority);

    // Evaluate each policy
    for (const policy of sortedPolicies) {
      for (const rule of policy.rules) {
        if (rule.condition(request, context)) {
          if (rule.action === 'deny') {
            return {
              allowed: false,
              requiresApproval: false,
              reason: rule.reason,
              policy,
            };
          }

          if (rule.action === 'require_approval') {
            return {
              allowed: false,
              requiresApproval: true,
              reason: rule.reason,
              policy,
            };
          }

          // rule.action === 'allow'
          return {
            allowed: true,
            requiresApproval: false,
            reason: rule.reason,
            policy,
          };
        }
      }
    }

    // Default: allow if no policy matches
    return {
      allowed: true,
      requiresApproval: false,
      reason: 'No policy restriction',
    };
  }

  /**
   * Get all policies
   */
  getAllPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): Policy | undefined {
    return this.policies.get(policyId);
  }
}
