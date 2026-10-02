import { retrieveContext, LOW_CONFIDENCE_THRESHOLD } from '@/services/rag/retriever';
import { askGroq } from './groqClient';
import type { RagSource } from '@/types';

export interface AskResult {
  answer: string;
  confidence: number;
  sources: RagSource[];
  followUps: string[];
}

const LOW_CONFIDENCE_MESSAGE =
  "I don't have enough verified information to answer that confidently. Please try rephrasing, or post this question in the Farmer Community — if no one answers within 48 hours, it will automatically be escalated to an Agriculture Officer.";

/**
 * askAgriya()
 * -----------
 * Full pipeline from the brief:
 *   User Question → Retrieve documents → Search trusted DB → Combine
 *   context → Send to Grok API → Generate answer → Display confidence
 *   score → if low, show the "not enough verified information" message
 *   instead of a hallucinated answer.
 */
export async function askAgriya(
  question: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  language = 'English'
): Promise<AskResult> {
  const { contextText, sources, confidence } = retrieveContext(question);

  if (confidence < LOW_CONFIDENCE_THRESHOLD) {
    return {
      answer: LOW_CONFIDENCE_MESSAGE,
      confidence,
      sources: [],
      followUps: [
        'Post this in the Farmer Community forum',
        'Ask about a specific crop, pest, or scheme instead',
      ],
    };
  }

  const systemPrompt = `You are AGRIYA, an agricultural advisory assistant for Indian farmers. Answer ONLY using the verified context below — never invent facts, dosages, or scheme figures that are not present in it. Respond in clear, simple ${language}. Keep answers under 120 words unless the question needs a step-by-step process.\n\n${contextText}`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.slice(-6),
    { role: 'user' as const, content: question },
  ];

  const answer = await askGroq(messages);

  return {
    answer,
    confidence,
    sources,
    followUps: buildFollowUps(sources),
  };
}

function buildFollowUps(sources: RagSource[]): string[] {
  if (!sources.length) return [];
  const first = sources[0];
  const suggestions: Record<string, string[]> = {
    'Crop Manual': ['What are early symptoms to watch for?', 'What organic alternatives are available?'],
    'Government Document': ['Who is eligible for this scheme?', 'How do I apply near me?'],
    'Soil Report': ['How often should I retest my soil?', 'What crop suits this soil type best?'],
    'Weather Report': ['What should I do if rainfall is delayed?', 'Which crops suit this forecast?'],
    'Research Paper': ['Can you simplify this further?'],
  };
  return suggestions[first.type] ?? ['Tell me more about this'];
}
