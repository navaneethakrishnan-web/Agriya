import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Set with: firebase functions:secrets:set GROQ_API_KEY
const GROQ_API_KEY = defineSecret('GROQ_API_KEY');

interface AskAiRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
}

/**
 * Callable Cloud Function that proxies chat completions to Groq.
 * Deploy with: firebase deploy --only functions
 * Call from the client with the Firebase Functions SDK:
 *   const askAi = httpsCallable(functions, 'askAi');
 *   const { data } = await askAi({ messages });
 *
 * This keeps GROQ_API_KEY server-side only — swap src/services/ai/groqClient.ts
 * to call this function instead of hitting api.groq.com directly once deployed.
 */
export const askAi = onCall({ secrets: [GROQ_API_KEY] }, async (request) => {
  const { messages } = request.data as AskAiRequest;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpsError('invalid-argument', 'messages array is required');
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY.value()}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    throw new HttpsError('internal', `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return { answer: data.choices?.[0]?.message?.content ?? '' };
});
