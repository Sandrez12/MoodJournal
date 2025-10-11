import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  summary: string;
}

function analyzeSentiment(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'happy', 'joy', 'great', 'amazing', 'wonderful', 'excellent', 'good', 'love',
    'excited', 'grateful', 'blessed', 'fantastic', 'awesome', 'beautiful', 'perfect',
    'proud', 'delighted', 'cheerful', 'optimistic', 'hopeful', 'content', 'pleased',
    'thrilled', 'ecstatic', 'energized', 'peaceful', 'relaxed', 'accomplished'
  ];
  
  const negativeWords = [
    'sad', 'angry', 'upset', 'bad', 'terrible', 'awful', 'hate', 'depressed',
    'anxious', 'worried', 'stressed', 'frustrated', 'disappointed', 'hurt', 'pain',
    'lonely', 'scared', 'afraid', 'angry', 'exhausted', 'tired', 'overwhelmed',
    'miserable', 'hopeless', 'difficult', 'struggling', 'crying', 'broken'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  const totalWords = text.split(/\s+/).length;
  const emotionalWords = positiveCount + negativeCount;
  const emotionalIntensity = emotionalWords / Math.max(totalWords, 1);
  
  let sentiment: 'positive' | 'negative' | 'neutral';
  let score: number;
  let summary: string;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    score = Math.min(0.9, 0.5 + (emotionalIntensity * 0.4));
    
    if (positiveCount >= 3) {
      summary = 'Your entry radiates positivity and joy. These are precious moments to cherish and reflect upon.';
    } else {
      summary = 'There are encouraging signs in your entry. You seem to be in a good place emotionally.';
    }
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    score = Math.max(-0.9, -0.5 - (emotionalIntensity * 0.4));
    
    if (negativeCount >= 3) {
      summary = 'It sounds like you are going through a challenging time. Remember that it is okay to feel this way, and seeking support can help.';
    } else {
      summary = 'You may be experiencing some difficulties. Take time to care for yourself and remember that these feelings are temporary.';
    }
  } else {
    sentiment = 'neutral';
    score = (positiveCount - negativeCount) * 0.1;
    summary = 'Your entry reflects a balanced emotional state. This is a good time for self-reflection and planning ahead.';
  }
  
  return { sentiment, score, summary };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text content is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    const result = analyzeSentiment(text);
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to analyze sentiment' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});