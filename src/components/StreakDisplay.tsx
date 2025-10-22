import { useEffect, useState } from 'react';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { supabase, UserStreak } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function StreakDisplay() {
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadStreak();
    }
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setStreak(data);
    }
  };

  if (!streak) return null;

  const getStreakMessage = () => {
    if (streak.current_streak === 0) return "Start your journey today!";
    if (streak.current_streak === 1) return "Great start!";
    if (streak.current_streak < 7) return "Keep it going!";
    if (streak.current_streak < 30) return "Amazing consistency!";
    return "You're unstoppable!";
  };

  const getFlameColor = () => {
    if (streak.current_streak === 0) return "text-gray-400";
    if (streak.current_streak < 7) return "text-orange-500";
    if (streak.current_streak < 30) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-md ${streak.current_streak === 0 ? 'opacity-50' : ''}`}>
            <Flame className={`w-8 h-8 text-white ${streak.current_streak > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak.current_streak} Day Streak
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{getStreakMessage()}</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
            </div>
            <div className={`text-3xl font-bold ${getFlameColor()} dark:brightness-125`}>
              {streak.current_streak}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Best</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {streak.longest_streak}
            </div>
          </div>
        </div>
      </div>

      {streak.current_streak > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {streak.current_streak === streak.longest_streak && streak.current_streak > 1
                ? "🎉 New personal record!"
                : `Keep going to beat your record of ${streak.longest_streak} days!`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
