import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '@/lib/translations';

interface LanguageState {
  language: 'en' | 'sk';
  setLanguage: (language: 'en' | 'sk') => void;
  t: (key: string) => string;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      t: (key: string) => {
        const { language } = get();
        return translations[language]?.[key] || key;
      },
    }),
    {
      name: 'kiosk-language',
    }
  )
);
