/**
 * Loginscreen.tsx
 * Main login screen component for Kronop
 * Uses organized auth handler, session config, and UI components
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

// Import our organized login components
import kronopAuth from './KronopAuthHandler';
import kronopSession from './KronopSessionConfig';
import {
  KronopLoginHeader,
  KronopGoogleLoginButton,
  KronopUserWelcome,
  KronopLoadingSpinner,
  KronopErrorMessage,
} from './KronopLoginUI';

export default function Loginscreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication and load saved session
   */
  const initializeAuth = async () => {
    try {
      // Configure Google Sign-In
      kronopAuth.configureGoogleSignIn();

      // Load saved session
      const savedSession = await kronopSession.loadUserSession();
      if (savedSession) {
        setUser(kronopSession.getFormattedUserProfile(savedSession));
      }

      // Set up auth state listener
      const removeListener = kronopAuth.addAuthListener((firebaseUser) => {
        if (firebaseUser) {
          const formattedUser = kronopSession.getFormattedUserProfile(firebaseUser);
          setUser(formattedUser);
          kronopSession.saveUserSession(firebaseUser);
        } else {
          setUser(null);
          kronopSession.clearUserSession();
        }
      });

      // Check if user is already authenticated
      if (kronopAuth.isUserAuthenticated()) {
        const currentUser = kronopAuth.getCurrentUser();
        if (currentUser) {
          setUser(kronopSession.getFormattedUserProfile(currentUser));
        }
      }

      return removeListener;
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google login button press
   */
  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setError(null);

    try {
      const result = await kronopAuth.signInWithGoogle();

      if (!result.success) {
        setError(result.error);
        Alert.alert('Login Failed', result.error || 'Something went wrong');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    setError(null);
    handleGoogleLogin();
  };

  // Show loading spinner during initialization
  if (loading) {
    return (
      <View style={styles.container}>
        <KronopLoadingSpinner message="Initializing Kronop..." />
      </View>
    );
  }

  // Show user welcome screen if authenticated
  if (user) {
    return (
      <View style={styles.container}>
        <KronopLoginHeader />
        <KronopUserWelcome user={user} />
      </View>
    );
  }

  // Show login screen
  return (
    <View style={styles.container}>
      <KronopLoginHeader />

      {error && (
        <KronopErrorMessage error={error} onRetry={handleRetry} />
      )}

      <KronopGoogleLoginButton
        onPress={handleGoogleLogin}
        loading={loginLoading}
        disabled={loginLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
});