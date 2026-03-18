/**
 * KronopSessionConfig.js
 * Session management and user data configuration for Kronop
 * Handles user session persistence and profile formatting
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class KronopSessionConfig {
  constructor() {
    this.SESSION_KEY = 'kronop_user_session';
    this.currentUser = null;
  }

  /**
   * Save user session to AsyncStorage
   * @param {object} userData - User data from Firebase auth
   * @returns {Promise<void>}
   */
  async saveUserSession(userData) {
    try {
      const sessionData = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        lastLoginAt: userData.lastLoginAt,
        savedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      console.log('✅ User session saved');
    } catch (error) {
      console.error('❌ Failed to save user session:', error);
      throw error;
    }
  }

  /**
   * Load user session from AsyncStorage
   * @returns {Promise<object|null>} - User session data or null
   */
  async loadUserSession() {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        const userData = JSON.parse(sessionData);
        this.currentUser = userData;
        console.log('✅ User session loaded');
        return userData;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to load user session:', error);
      return null;
    }
  }

  /**
   * Clear user session from AsyncStorage
   * @returns {Promise<void>}
   */
  async clearUserSession() {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      this.currentUser = null;
      console.log('✅ User session cleared');
    } catch (error) {
      console.error('❌ Failed to clear user session:', error);
      throw error;
    }
  }

  /**
   * Check if user session exists
   * @returns {Promise<boolean>}
   */
  async hasValidSession() {
    try {
      const sessionData = await this.loadUserSession();
      return sessionData !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get formatted user profile for UI display
   * @param {object} userData - Raw user data
   * @returns {object} - Formatted user profile
   */
  getFormattedUserProfile(userData) {
    if (!userData) return null;

    return {
      id: userData.id,
      name: userData.displayName || userData.email?.split('@')[0] || 'User',
      email: userData.email,
      avatar: userData.photoURL,
      initials: this.generateInitials(userData.displayName || userData.email),
      emailVerified: userData.emailVerified,
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt,
      isNewUser: this.isNewUser(userData),
    };
  }

  /**
   * Generate user initials from name or email
   * @param {string} nameOrEmail - User's display name or email
   * @returns {string} - User initials
   */
  generateInitials(nameOrEmail) {
    if (!nameOrEmail) return 'U';

    // If it's an email, use the part before @
    const name = nameOrEmail.includes('@')
      ? nameOrEmail.split('@')[0]
      : nameOrEmail;

    // Split by spaces and take first letter of each word
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, 2) // Take first 2 words max
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return initials || 'U';
  }

  /**
   * Check if user is new (created recently)
   * @param {object} userData - User data
   * @returns {boolean}
   */
  isNewUser(userData) {
    if (!userData.createdAt) return false;

    const createdDate = new Date(userData.createdAt);
    const now = new Date();
    const daysSinceCreation = (now - createdDate) / (1000 * 60 * 60 * 24);

    // Consider user "new" if account created within last 7 days
    return daysSinceCreation <= 7;
  }

  /**
   * Get session metadata
   * @returns {Promise<object>} - Session metadata
   */
  async getSessionMetadata() {
    try {
      const sessionData = await this.loadUserSession();
      if (!sessionData) return null;

      return {
        sessionExists: true,
        lastSaved: sessionData.savedAt,
        userId: sessionData.id,
        email: sessionData.email,
        isVerified: sessionData.emailVerified,
      };
    } catch (error) {
      return {
        sessionExists: false,
        error: error.message,
      };
    }
  }

  /**
   * Update user profile data
   * @param {object} updates - Profile updates
   * @returns {Promise<void>}
   */
  async updateUserProfile(updates) {
    try {
      const currentSession = await this.loadUserSession();
      if (!currentSession) {
        throw new Error('No active session to update');
      }

      const updatedSession = {
        ...currentSession,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.saveUserSession(updatedSession);
      console.log('✅ User profile updated');
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Get current user data
   * @returns {object|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Export session data for backup/debugging
   * @returns {Promise<object>}
   */
  async exportSessionData() {
    try {
      const sessionData = await this.loadUserSession();
      const metadata = await this.getSessionMetadata();

      return {
        session: sessionData,
        metadata,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        exportedAt: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
const kronopSession = new KronopSessionConfig();
export default kronopSession;
