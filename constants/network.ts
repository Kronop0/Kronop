import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ==================== NETWORK CONFIGURATION ====================
// Render deployment URL configuration - ALWAYS use Render URL for production

const PORT = 10000; // Render default port

// Use Render URL for deployment - PRIMARY
const getApiBaseUrl = () => {
  const configuredBase =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_BASE_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_URL ||
    'https://kronop-76zy.onrender.com';

  const cleanBase = configuredBase.replace(/\/+$/, '');
  console.log('[NETWORK_CONFIG]: Using Render production URL');
  return cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
};

export const API_BASE_URL = getApiBaseUrl();
export const DEV_PORT = PORT;

