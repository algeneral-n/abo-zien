/**
 * LoyaltyAgent - ???????? ????????????
 * ???????? Loyalty Program?? Points?? Rewards
 */

import { BaseAgent } from './BaseAgent';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class LoyaltyAgent extends BaseAgent {
  constructor() {
    super({
      id: 'loyalty',
      name: 'Loyalty Agent',
      description: 'Loyalty Program Management',
      capabilities: [
        'check_points',
        'add_points',
        'redeem_reward',
        'get_rewards',
        'get_history',
      ],
    });
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    switch (action) {
      case 'check_points':
        return await this.checkPoints(parameters.userId);

      case 'add_points':
        return await this.addPoints(parameters.userId, parameters.points);

      case 'redeem_reward':
        return await this.redeemReward(parameters.userId, parameters.rewardId);

      case 'get_rewards':
        return await this.getRewards();

      case 'get_history':
        return await this.getHistory(parameters.userId);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Check points
   */
  private async checkPoints(userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/loyalty/points/${userId}`);
    return await response.json();
  }

  /**
   * Add points
   */
  private async addPoints(userId: string, points: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/loyalty/points/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, points }),
    });

    return await response.json();
  }

  /**
   * Redeem reward
   */
  private async redeemReward(userId: string, rewardId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rewardId }),
    });

    return await response.json();
  }

  /**
   * Get rewards
   */
  private async getRewards(): Promise<any> {
    const response = await fetch(`${API_URL}/api/loyalty/rewards`);
    return await response.json();
  }

  /**
   * Get history
   */
  private async getHistory(userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/loyalty/history/${userId}`);
    return await response.json();
  }
}



