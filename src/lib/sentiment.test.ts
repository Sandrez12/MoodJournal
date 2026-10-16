import { describe, expect, it } from 'vitest';
import { analyzeSentiment } from './sentiment';

describe('analyzeSentiment', () => {
  it('detecta texto positivo en inglés y en español', () => {
    expect(analyzeSentiment('I feel happy and grateful today').sentiment).toBe('positive');
    expect(analyzeSentiment('Hoy me siento feliz y agradecida, fue un día maravilloso').sentiment).toBe('positive');
  });

  it('detecta texto negativo en inglés y en español', () => {
    expect(analyzeSentiment('I am sad and exhausted').sentiment).toBe('negative');
    expect(analyzeSentiment('Estoy muy triste, cansado y con mucha ansiedad').sentiment).toBe('negative');
  });

  it('invierte el sentido con negaciones', () => {
    expect(analyzeSentiment('no estoy feliz').sentiment).toBe('negative');
    expect(analyzeSentiment('I am not sad').sentiment).toBe('positive');
  });

  it('ignora tildes y mayúsculas', () => {
    expect(analyzeSentiment('INCREÍBLE, ¡qué día tan MARAVILLOSO!').sentiment).toBe('positive');
  });

  it('devuelve neutral si no hay palabras emocionales o hay empate', () => {
    expect(analyzeSentiment('Fui a la tienda y compré pan').sentiment).toBe('neutral');
    expect(analyzeSentiment('feliz pero triste').sentiment).toBe('neutral');
  });

  it('mantiene la puntuación dentro de [-1, 1]', () => {
    const muyPositivo = analyzeSentiment('feliz feliz feliz feliz');
    const muyNegativo = analyzeSentiment('triste triste triste triste');
    expect(muyPositivo.score).toBeLessThanOrEqual(0.9);
    expect(muyNegativo.score).toBeGreaterThanOrEqual(-0.9);
  });

  it('no falla con texto vacío', () => {
    expect(analyzeSentiment('').sentiment).toBe('neutral');
  });
});
