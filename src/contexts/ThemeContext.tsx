import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserPreferences } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  preferences: UserPreferences | null;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPreferences(data);
      setTheme(data.theme);
      applyTheme(data.theme);
    } else {
      const { data: newPrefs } = await supabase
        .from('user_preferences')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (newPrefs) {
        setPreferences(newPrefs);
      }
    }
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);

    if (user) {
      await supabase
        .from('user_preferences')
        .update({ theme: newTheme })
        .eq('user_id', user.id);
    } else {
      localStorage.setItem('theme', newTheme);
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    if (!user) return;

    const { data } = await supabase
      .from('user_preferences')
      .update(prefs)
      .eq('user_id', user.id)
      .select()
      .single();

    if (data) {
      setPreferences(data);
      if (prefs.theme) {
        setTheme(prefs.theme);
        applyTheme(prefs.theme);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, preferences, updatePreferences }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
