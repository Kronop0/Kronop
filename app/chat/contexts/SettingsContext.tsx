// Powered by OnSpace.AI
import React, { createContext, useState, ReactNode, useCallback } from 'react';

export interface SettingItem {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  iconLib: 'ionicons' | 'material';
  enabled: boolean;
}

interface SettingsContextType {
  settings: SettingItem[];
  toggleSetting: (key: string) => void;
  isEnabled: (key: string) => boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const INITIAL_SETTINGS: SettingItem[] = [
  { key: 'ghost_mode', label: 'Ghost Mode', subtitle: 'Hide your online status from others', icon: 'eye-off-outline', iconLib: 'ionicons', enabled: false },
  { key: 'hide_last_seen', label: 'Hide Last Seen', subtitle: "Don't show when you were last active", icon: 'time-outline', iconLib: 'ionicons', enabled: false },
  { key: 'read_receipts', label: 'Read Receipts', subtitle: 'Show ticks when messages are read', icon: 'checkmark-done-outline', iconLib: 'ionicons', enabled: true },
  { key: 'typing_indicator', label: 'Typing Indicator', subtitle: 'Show typing... when composing', icon: 'chatbubble-ellipses-outline', iconLib: 'ionicons', enabled: true },
  { key: 'message_preview', label: 'Message Preview', subtitle: 'Show message content in notifications', icon: 'notifications-outline', iconLib: 'ionicons', enabled: true },
  { key: 'auto_delete', label: 'Auto-Delete Messages', subtitle: 'Automatically delete messages after 24h', icon: 'timer-outline', iconLib: 'ionicons', enabled: false },
  { key: 'screenshot_alert', label: 'Screenshot Alert', subtitle: 'Get notified when chat is screenshotted', icon: 'camera-outline', iconLib: 'ionicons', enabled: false },
];

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingItem[]>(INITIAL_SETTINGS);

  const toggleSetting = useCallback((key: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s));
  }, []);

  const isEnabled = useCallback((key: string) => {
    return settings.find(s => s.key === key)?.enabled ?? false;
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting, isEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}
