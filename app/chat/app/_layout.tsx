// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '../../../template/ui';
import { ChatProvider } from '../contexts/ChatContext';
import { SettingsProvider } from '../contexts/SettingsContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <SettingsProvider>
        <ChatProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="search" />
            <Stack.Screen name="blocked" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="call/voice/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="call/video/[id]" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="settings" />
          </Stack>
        </ChatProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
