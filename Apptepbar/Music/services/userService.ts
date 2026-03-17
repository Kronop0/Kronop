// User Management Service
import { User } from '../types';

class UserService {
  private currentUser: User | null = null;

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Set current user
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Clear user
  clearUser(): void {
    this.currentUser = null;
  }

  // Update user profile
  updateProfile(updates: Partial<User>): void {
    if (this.currentUser) {
      this.currentUser = {
        ...this.currentUser,
        ...updates,
      };
    }
  }
}

export const userService = new UserService();
