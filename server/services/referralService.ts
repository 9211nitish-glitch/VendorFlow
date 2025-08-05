import { ReferralModel } from '../models/Referral';

export class ReferralService {
  static async processReferralCommissions(referrerId: number, referredId: number, packagePrice: number) {
    try {
      await ReferralModel.createReferralChain(referrerId, referredId, packagePrice);
      console.log('Referral commissions processed successfully');
    } catch (error) {
      console.error('Error processing referral commissions:', error);
      throw error;
    }
  }

  static async calculateCommission(level: number, packagePrice: number): number {
    const rates = {
      1: 0.10, // 10%
      2: 0.05, // 5%
      3: 0.04, // 4%
      4: 0.03, // 3%
      5: 0.02  // 2%
    };

    return packagePrice * (rates[level as keyof typeof rates] || 0);
  }
}
