import { useState, useEffect } from 'react';
import { X, Moon, Sun, Bell, BellOff, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme, preferences, updatePreferences } = useTheme();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');

  useEffect(() => {
    if (preferences) {
      setReminderEnabled(preferences.reminder_enabled);
      setReminderTime(preferences.reminder_time.substring(0, 5));
    }
  }, [preferences]);

  const handleReminderToggle = async () => {
    const newValue = !reminderEnabled;
    setReminderEnabled(newValue);
    await updatePreferences({ reminder_enabled: newValue });
  };

  const handleTimeChange = async (time: string) => {
    setReminderTime(time);
    await updatePreferences({ reminder_time: `${time}:00` });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400" />
                )}
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch to {theme === 'light' ? 'dark' : 'light'} mode
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Reminders</h3>
            <div className="space-y-4">
              <button
                onClick={handleReminderToggle}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {reminderEnabled ? (
                    <Bell className="w-5 h-5 text-green-500" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reminderEnabled ? 'Reminders On' : 'Reminders Off'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified to write daily
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${reminderEnabled ? 'bg-green-500' : 'bg-gray-300'} relative`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </button>

              {reminderEnabled && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <label className="font-medium text-gray-900 dark:text-white">
                      Reminder Time
                    </label>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    We'll remind you to write in your journal at this time every day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
