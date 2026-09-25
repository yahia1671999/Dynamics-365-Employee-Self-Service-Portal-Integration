export type ThemeMode = 'light' | 'dark';

export type AccentColorKey =
  | 'blue'
  | 'teal'
  | 'green'
  | 'purple'
  | 'crimson'
  | 'orange'
  | 'navy'
  | 'charcoal';

export interface AccentColorConfig {
  key: AccentColorKey;
  nameAr: string;
  nameEn: string;
  primary: string;
  hover: string;
  active: string;
  lightBg: string;
  lightBorder: string;
  headerBg: string;
  headerHover: string;
  headerBorder: string;
  headerSurface: string;
}

export type LanguageCode = 'ar' | 'en';
export type TextDirection = 'rtl' | 'ltr';

export interface PersonalizationSettings {
  themeMode: ThemeMode;
  accentColor: AccentColorKey;
  language: LanguageCode;
  direction: TextDirection;
  customLabels: Record<string, string>;
}

export interface CustomizableLabelItem {
  key: string;
  category: 'nav' | 'kpi' | 'profile' | 'action' | 'table';
  categoryTitleAr: string;
  categoryTitleEn: string;
  defaultAr: string;
  defaultEn: string;
}
