/**
 * KronopAuthHandler.js
 * Handles all Google authentication and Firebase logic for Kronop
 * Central authentication handler for Google Sign-In integration
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithCredential, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../src/config/firebase';

class KronopAuthHandler {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = [];

    this.initializeAuth();
  }

  /**
   * Initialize Firebase auth state listener
   */
  initializeAuth() {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        this.user = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          createdAt: firebaseUser.metadata.creationTime,
          lastLoginAt: firebaseUser.metadata.lastSignInTime,
        };
        this.isAuthenticated = true;
        console.log(`User UID: ${firebaseUser.uid}`);
      } else {
        this.user = null;
        this.isAuthenticated = false;
      }

      // Notify all listeners
      this.listeners.forEach(listener => listener(this.user));
    });
  }

  /**
   * Configure Google Sign-In with web client ID
   */
  configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }

  /**
   * Perform Google Sign-In
   * @returns {Promise<{success: boolean, error?: string, user?: object}>}
   */
  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === 'success') {
        const { idToken } = response.data;
        const googleCredential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, googleCredential);
        return { success: true, user: this.user };
      }

      if (response.type === 'cancelled') {
        return { success: false, error: 'User cancelled login' };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async signOut() {
    try {
      await GoogleSignin.signOut();
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user
   * @returns {object|null}
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Add auth state change listener
   * @param {function} listener - Callback function(user) => void
   * @returns {function} - Remove listener function
   */
  addAuthListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get user's Firebase ID token
   * @returns {Promise<string|null>}
   */
  async getIdToken() {
    try {
      return await auth.currentUser?.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }
}

// Export singleton instance
const kronopAuth = new KronopAuthHandler();
export default kronopAuth;
