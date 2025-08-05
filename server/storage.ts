import { User, InsertUser } from "@shared/schema";

// This storage interface is maintained for compatibility
// but the actual implementation uses MySQL through models
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    // This is maintained for compatibility but not used
    // The actual implementation uses UserModel.findById
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // This is maintained for compatibility but not used
    // The actual implementation uses UserModel.findByEmail
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // This is maintained for compatibility but not used
    // The actual implementation uses UserModel.create
    throw new Error("Use UserModel.create instead");
  }
}

export const storage = new MemStorage();
