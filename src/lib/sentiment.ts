/**
 * Análisis de sentimiento basado en léxico (español e inglés), sin servicios externos.
 * Cuenta palabras positivas y negativas e invierte el signo cuando van precedidas de una negación
 * ("no estoy feliz", "not happy").
 */

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface AnalysisResult {
  sentiment: Sentiment;
  score: number; // de -1 a 1
  summary: string;
}

const POSITIVE = new Set([
  // inglés
  'happy', 'joy', 'great', 'amazing', 'wonderful', 'excellent', 'good', 'love', 'excited', 'grateful',
  'blessed', 'fantastic', 'awesome', 'beautiful', 'perfect', 'proud', 'delighted', 'cheerful', 'optimistic',
  'hopeful', 'content', 'pleased', 'thrilled', 'ecstatic', 'energized', 'peaceful', 'relaxed', 'accomplished',
  // español (sin tildes: el texto se normaliza)
  'feliz', 'alegre', 'alegria', 'genial', 'increible', 'maravilloso', 'maravillosa', 'excelente', 'bueno',
  'buena', 'bien', 'amor', 'quiero', 'emocionado', 'emocionada', 'agradecido', 'agradecida', 'bendecido',
  'fantastico', 'fantastica', 'hermoso', 'hermosa', 'perfecto', 'perfecta', 'orgulloso', 'orgullosa',
  'contento', 'contenta', 'optimista', 'esperanza', 'esperanzado', 'esperanzada', 'tranquilo', 'tranquila',
  'relajado', 'relajada', 'logre', 'logrado', 'lograda', 'motivado', 'motivada', 'disfrute', 'disfrutando',
  'satisfecho', 'satisfecha', 'sonrei', 'gracias',
]);

const NEGATIVE = new Set([
  // inglés
  'sad', 'angry', 'upset', 'bad', 'terrible', 'awful', 'hate', 'depressed', 'anxious', 'worried', 'stressed',
  'frustrated', 'disappointed', 'hurt', 'pain', 'lonely', 'scared', 'afraid', 'exhausted', 'tired',
  'overwhelmed', 'miserable', 'hopeless', 'difficult', 'struggling', 'crying', 'broken',
  // español
  'triste', 'enojado', 'enojada', 'molesto', 'molesta', 'malo', 'mala', 'mal', 'terrible', 'horrible',
  'odio', 'deprimido', 'deprimida', 'ansioso', 'ansiosa', 'ansiedad', 'preocupado', 'preocupada',
  'estresado', 'estresada', 'estres', 'frustrado', 'frustrada', 'decepcionado', 'decepcionada', 'dolor',
  'solo', 'sola', 'asustado', 'asustada', 'miedo', 'agotado', 'agotada', 'cansado', 'cansada',
  'abrumado', 'abrumada', 'desesperanzado', 'dificil', 'luchando', 'llorando', 'llore', 'roto', 'rota',
  'angustia', 'culpa', 'rabia',
]);

const NEGATIONS = new Set(['no', 'not', 'never', 'nunca', 'jamas', 'sin', 'ni', 'nada', "don't", 'dont', "isn't", 'isnt']);

const normalize = (text: string): string[] =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z']+/)
    .filter(Boolean);

export function analyzeSentiment(text: string): AnalysisResult {
  const tokens = normalize(text);
  let positive = 0;
  let negative = 0;

  tokens.forEach((token, i) => {
    const polarity = POSITIVE.has(token) ? 1 : NEGATIVE.has(token) ? -1 : 0;
    if (polarity === 0) return;

    // Una negación en las dos palabras anteriores invierte el sentido.
    const negated = tokens.slice(Math.max(0, i - 2), i).some((t) => NEGATIONS.has(t));
    const effective = negated ? -polarity : polarity;
    if (effective > 0) positive++;
    else negative++;
  });

  const emotional = positive + negative;
  const intensity = emotional / Math.max(tokens.length, 1);

  if (positive > negative) {
    return {
      sentiment: 'positive',
      score: Math.min(0.9, 0.5 + intensity * 0.4),
      summary:
        positive >= 3
          ? 'Your entry radiates positivity and joy. These are precious moments to cherish and reflect upon.'
          : 'There are encouraging signs in your entry. You seem to be in a good place emotionally.',
    };
  }

  if (negative > positive) {
    return {
      sentiment: 'negative',
      score: Math.max(-0.9, -0.5 - intensity * 0.4),
      summary:
        negative >= 3
          ? 'It sounds like you are going through a challenging time. Remember that it is okay to feel this way, and seeking support can help.'
          : 'You may be experiencing some difficulties. Take time to care for yourself and remember that these feelings are temporary.',
    };
  }

  return {
    sentiment: 'neutral',
    score: 0,
    summary: 'Your entry reflects a balanced emotional state. This is a good time for self-reflection and planning ahead.',
  };
}
