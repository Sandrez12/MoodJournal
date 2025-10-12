import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Save, Loader2, Edit, X } from 'lucide-react';
import { supabase, JournalEntry as JournalEntryType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface JournalEntryProps {
  onEntrySaved: () => void;
  todayEntry?: JournalEntryType | null;
}

export function JournalEntry({ onEntrySaved, todayEntry }: JournalEntryProps) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (todayEntry && isEditing) {
      setContent(todayEntry.content);
    } else if (!isEditing) {
      setContent('');
    }
  }, [todayEntry, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please write something before submitting');
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-sentiment`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment');
      }

      const analysis = await response.json();

      setIsAnalyzing(false);
      setIsSaving(true);

      if (isEditing && todayEntry) {
        const { error: updateError } = await supabase
          .from('journal_entries')
          .update({
            content: content.trim(),
            sentiment: analysis.sentiment,
            sentiment_score: analysis.score,
            ai_summary: analysis.summary,
          })
          .eq('id', todayEntry.id);

        if (updateError) throw updateError;
      } else {
        const today = new Date().toISOString().split('T')[0];

        const { data: existingEntry } = await supabase
          .from('journal_entries')
          .select('id')
          .eq('user_id', user!.id)
          .eq('entry_date', today)
          .maybeSingle();

        if (existingEntry) {
          setError('You already have an entry for today. Edit it instead.');
          setIsAnalyzing(false);
          setIsSaving(false);
          return;
        }

        const { error: insertError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user!.id,
            content: content.trim(),
            sentiment: analysis.sentiment,
            sentiment_score: analysis.score,
            ai_summary: analysis.summary,
            entry_date: today,
          });

        if (insertError) throw insertError;
      }

      setContent('');
      setIsEditing(false);
      onEntrySaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setIsAnalyzing(false);
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setContent('');
    setError('');
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError('');
  };

  if (todayEntry && !isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Today's Entry Saved</h2>
              <p className="text-sm text-gray-600">You can edit it if you want to add more</p>
            </div>
          </div>
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
          >
            <Edit className="w-4 h-4" />
            Edit Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Today\'s Entry' : 'How are you feeling today?'}
            </h2>
            <p className="text-sm text-gray-600">Share your thoughts and emotions</p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Today I feel... Write freely about your day, emotions, thoughts, or anything on your mind."
          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
          disabled={isAnalyzing || isSaving}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {content.length} characters
          </div>
          <button
            type="submit"
            disabled={isAnalyzing || isSaving || !content.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Update Entry' : 'Save Entry'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
