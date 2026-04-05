import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false, headerTransparent: true }} />
          <Stack.Screen name="stream" options={{ headerShown: false, headerTransparent: true, animation: 'slide_from_bottom' }} />
        </Stack>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
