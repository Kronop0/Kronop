import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '../template';
import { colors } from '../constants/theme';

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'light';
  const theme = colors[scheme];

  return (
    <AlertProvider>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="videos" options={{ headerShown: false }} />
        <Stack.Screen 
          name="video-player" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="channel" 
          options={{ 
            headerShown: false,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="search" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
      </Stack>
    </AlertProvider>
  );
}
