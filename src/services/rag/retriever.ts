import type { RagSource } from '@/types';
import { keywordRetrieve } from './knowledgeBase';

export interface RetrievalResult {
  contextText: string;
  sources: RagSource[];
  confidence: number; // 0..1
}

/**
 * retrieveContext()
 * -----------------
 * Step 2-4 of the RAG workflow in the brief:
 *   User Question → Retrieve relevant documents → Search trusted
 *   agricultural database → Combine retrieved context
 *
 * Swap `keywordRetrieve` for a real embeddings + vector-search call
 * (e.g. a Cloud Function hitting a hosted embedding model + Pinecone/
 * Firestore vector search) without changing this function's return shape.
 */
export function retrieveContext(query: string): RetrievalResult {
  const { results, confidence } = keywordRetrieve(query, 3);

  const sources: RagSource[] = results.map(({ doc }) => ({
    id: doc.id,
    title: doc.title,
    snippet: doc.content.slice(0, 140) + '…',
    type: doc.type,
  }));

  const contextText = results
    .map(({ doc }) => `Source: ${doc.title}\n${doc.content}`)
    .join('\n\n');

  return { contextText, sources, confidence };
}

export const LOW_CONFIDENCE_THRESHOLD = 0.22;
