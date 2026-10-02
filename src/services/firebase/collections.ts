// Firestore collection names — kept in one place so the schema documented
// in README.md always matches what the code actually writes to.
export const COLLECTIONS = {
  users: 'users',
  questions: 'questions',
  answers: 'answers',
  communityPosts: 'community_posts',
  comments: 'comments',
  rewards: 'rewards',
  officers: 'officers',
  weatherCache: 'weather_cache',
  governmentSchemes: 'government_schemes',
  notifications: 'notifications',
  chatHistory: 'chat_history',
  knowledgeBase: 'knowledge_base',
  documents: 'documents',
  reports: 'reports',
} as const;
