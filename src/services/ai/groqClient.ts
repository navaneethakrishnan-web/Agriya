/**
 * Groq API client
 * ---------------
 * GROQ_API_KEY is read from VITE_GROQ_API_KEY (see .env.example). It ships
 * as a placeholder string "GROQ_API_KEY" until you add a real key.
 *
 * ⚠️ Production note: calling Groq directly from the browser means the key
 * is visible in the bundle/network tab. This is fine for a hackathon demo,
 * but before going live, move this call into a Firebase Cloud Function
 * (functions/src/askAi.ts already sketches the same request) and call that
 * function from the client instead, so the key never leaves the server.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function askGroq(messages: GroqMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_GROQ_MODEL as string) || 'llama-3.3-70b-versatile';

  if (!apiKey || apiKey === 'GROQ_API_KEY') {
    return simulateAnswer(messages);
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * Local fallback so the chatbot UI is fully demoable without a real key.
 * It "answers" using only the retrieved context that was passed in as a
 * system/user message, mirroring what the real model would ground itself
 * on — never inventing facts that aren't in that context.
 */
function simulateAnswer(messages: GroqMessage[]): string {
  const contextMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const question = messages.filter((m) => m.role === 'user').at(-1)?.content ?? '';

  const hasContext = contextMsg.includes('Source:');
  if (!hasContext) {
    return "I don't have enough verified information to answer that confidently yet. Try asking about crop diseases, government schemes, soil health, irrigation, or weather-based sowing advice — or post your question to the Farmer Community for peer input.";
  }

  const firstSource = contextMsg.split('\n\n')[0];
  return `Based on verified agricultural sources: ${firstSource
    .replace(/^Source: .*\n/, '')
    .trim()}\n\nThis directly relates to your question about "${question}". If you need more detail, ask a follow-up or check the source documents listed below.`;
}
