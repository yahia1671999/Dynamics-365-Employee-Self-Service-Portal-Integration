import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  PersonalizationSettings,
  ThemeMode,
  AccentColorKey,
  AccentColorConfig,
  LanguageCode,
  TextDirection,
} from '../types/personalization.types';
import {
  personalizationService,
  ACCENT_COLORS,
  CUSTOMIZABLE_LABELS,
  DEFAULT_SETTINGS,
} from '../services/personalizationService';

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  accentConfig: AccentColorConfig;
  isDark: boolean;
  language: LanguageCode;
  direction: TextDirection;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColorKey) => void;
  setLanguage: (lang: LanguageCode) => void;
  setCustomLabel: (key: string, label: string) => void;
  resetCustomLabel: (key: string) => void;
  restoreDefaults: () => void;
  t: (key: string, fallbackAr?: string, fallbackEn?: string) => string;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

interface PersonalizationProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({
  children,
  userId,
}) => {
  const [settings, setSettings] = useState<PersonalizationSettings>(() => {
    return personalizationService.getSettings(userId);
  });

  // Reload settings if userId changes
  useEffect(() => {
    const loaded = personalizationService.getSettings(userId);
    setSettings(loaded);
    personalizationService.applyThemeToDom(loaded);
  }, [userId]);

  // Apply to DOM on initial mount & setting changes
  useEffect(() => {
    personalizationService.applyThemeToDom(settings);
  }, [settings]);

  const updateSettings = useCallback(
    (updater: (prev: PersonalizationSettings) => PersonalizationSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        personalizationService.saveSettings(userId, next);
        return next;
      });
    },
    [userId]
  );

  const setThemeMode = useCallback(
    (themeMode: ThemeMode) => {
      updateSettings((prev) => ({ ...prev, themeMode }));
    },
    [updateSettings]
  );

  const setAccentColor = useCallback(
    (accentColor: AccentColorKey) => {
      updateSettings((prev) => ({ ...prev, accentColor }));
    },
    [updateSettings]
  );

  const setLanguage = useCallback(
    (language: LanguageCode) => {
      const direction: TextDirection = language === 'ar' ? 'rtl' : 'ltr';
      updateSettings((prev) => ({ ...prev, language, direction }));
    },
    [updateSettings]
  );

  const setCustomLabel = useCallback(
    (key: string, label: string) => {
      updateSettings((prev) => ({
        ...prev,
        customLabels: {
          ...prev.customLabels,
          [key]: label,
        },
      }));
    },
    [updateSettings]
  );

  const resetCustomLabel = useCallback(
    (key: string) => {
      updateSettings((prev) => {
        const nextLabels = { ...prev.customLabels };
        delete nextLabels[key];
        return {
          ...prev,
          customLabels: nextLabels,
        };
      });
    },
    [updateSettings]
  );

  const restoreDefaults = useCallback(() => {
    const defaults = personalizationService.resetSettings(userId);
    setSettings(defaults);
  }, [userId]);

  // Resolution helper for visible labels
  const t = useCallback(
    (key: string, fallbackAr?: string, fallbackEn?: string): string => {
      // 1. User custom label override takes precedence
      const custom = settings.customLabels[key];
      if (custom && custom.trim() !== '') {
        return custom.trim();
      }

      // 2. Built-in catalog lookup
      const item = CUSTOMIZABLE_LABELS.find((l) => l.key === key);
      if (item) {
        return settings.language === 'en' ? item.defaultEn : item.defaultAr;
      }

      // 3. Explicit fallbacks
      if (settings.language === 'en') {
        return fallbackEn || fallbackAr || key;
      }
      return fallbackAr || fallbackEn || key;
    },
    [settings.customLabels, settings.language]
  );

  const accentConfig = useMemo(() => {
    return ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue;
  }, [settings.accentColor]);

  const value = useMemo(
    () => ({
      settings,
      accentConfig,
      isDark: settings.themeMode === 'dark',
      language: settings.language,
      direction: settings.direction,
      setThemeMode,
      setAccentColor,
      setLanguage,
      setCustomLabel,
      resetCustomLabel,
      restoreDefaults,
      t,
    }),
    [
      settings,
      accentConfig,
      setThemeMode,
      setAccentColor,
      setLanguage,
      setCustomLabel,
      resetCustomLabel,
      restoreDefaults,
      t,
    ]
  );

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = (): PersonalizationContextType => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};
