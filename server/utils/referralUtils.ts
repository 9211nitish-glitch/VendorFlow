import { nanoid } from 'nanoid';
import { UserModel } from '../models/User';

export async function generateReferralCode(): Promise<string> {
  let referralCode: string;
  let isUnique = false;
  
  do {
    referralCode = nanoid(8);
    const existingUser = await UserModel.findByReferralCode(referralCode);
    isUnique = !existingUser;
  } while (!isUnique);
  
  return referralCode;
}