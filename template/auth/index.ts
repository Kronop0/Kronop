// @ts-nocheck
export * from './types';

// Mock backend authentication system - for prototype development and when backend is unavailable
// NOTE: Mock auth is disabled for security - using real Supabase authentication
// export { useMockAuth, useMockAuthDebug } from './mock/hook';
// export { mockAuthService } from './mock/service';
// export { MockAuthRouter } from './mock/router';
// export { MockAuthProvider } from './mock/context';

// Authentication is now handled locally in /Apptepbar/login/ folder
// See: KronopAuthHandler.js, KronopSessionConfig.js, KronopLoginUI.js, Loginscreen.tsx
// All Google Sign-In and Firebase logic is centralized there