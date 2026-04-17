/**
 * KronopLoginUI.js
 * UI components for Kronop login screen
 * Contains all visual elements and styling
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';

/**
 * Kronop Login Header Component
 * Shows app name and welcome message
 */
export const KronopLoginHeader = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.appName}>Kronop</Text>
    <Text style={styles.welcomeMessage}>Welcome to Kronop</Text>
  </View>
);

/**
 * Google Login Button Component
 * Styled button with loading state
 */
export const KronopGoogleLoginButton = ({ onPress, loading, disabled }) => (
  <TouchableOpacity
    style={[styles.googleButton, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <Text style={styles.buttonText}>Google Login</Text>
    )}
  </TouchableOpacity>
);

/**
 * User Welcome Component
 * Shows welcome message with user info after login
 */
export const KronopUserWelcome = ({ user }) => (
  <View style={styles.welcomeContainer}>
    <Text style={styles.welcomeTitle}>
      Welcome, {user.name}!
    </Text>
    <Text style={styles.userEmail}>{user.email}</Text>
    <Text style={styles.userUid}>UID: {user.id}</Text>

    {user.avatar && (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{user.initials}</Text>
      </View>
    )}

    <Text style={styles.loginSuccess}>
      🎉 Successfully logged in!
    </Text>
  </View>
);

/**
 * Loading Spinner Component
 * Shows loading state with message
 */
export const KronopLoadingSpinner = ({ message = "Loading..." }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4285F4" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

/**
 * Error Message Component
 * Shows error with retry option
 */
export const KronopErrorMessage = ({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>⚠️ {error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Styles for all UI components
 */
const styles = StyleSheet.create({
  // Header Styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },

  // Button Styles
  googleButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Welcome Styles
  welcomeContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 280,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  userUid: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 16,
    textAlign: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loginSuccess: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  // Error Styles
  errorContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
