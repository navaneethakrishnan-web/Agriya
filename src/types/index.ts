export type UserRole = 'farmer' | 'officer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  mobile?: string;
  village?: string;
  district?: string;
  state?: string;
  preferredLanguage: string;
  crops: string[];
  farmSize?: string;
  photoURL?: string;
  rewardPoints: number;
  role: UserRole;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  confidence?: number;
  sources?: RagSource[];
  liked?: 'up' | 'down' | null;
  imageUrl?: string;
  fileName?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface RagSource {
  id: string;
  title: string;
  snippet: string;
  type: 'Government Document' | 'Crop Manual' | 'Soil Report' | 'Weather Report' | 'Research Paper';
}

export type ForumCategory =
  | 'Crops'
  | 'Pests'
  | 'Diseases'
  | 'Weather'
  | 'Government Schemes'
  | 'Equipment'
  | 'Organic Farming';

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorVillage?: string;
  title: string;
  description: string;
  category: ForumCategory;
  crop?: string;
  images?: string[];
  location?: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  hasAcceptedAnswer: boolean;
  escalated?: boolean;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  accepted: boolean;
  isOfficer?: boolean;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  points: number;
  reason: string;
  timestamp: number;
}

export interface RedeemableItem {
  id: string;
  name: string;
  category: 'Seeds' | 'Fertilizers' | 'Equipment' | 'Coupons';
  pointsCost: number;
  partner: string;
  imageUrl?: string;
  stock: number;
}

export interface GovScheme {
  id: string;
  name: string;
  description: string;
  state: string;
  category: string;
  eligibility: string;
  benefit: string;
  deadline?: string;
  applyUrl?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  uvIndex: number;
  condition: string;
  locationName: string;
  forecast: DayForecast[];
  advisory: string[];
}

export interface DayForecast {
  day: string;
  high: number;
  low: number;
  rainChance: number;
  condition: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'Krishi Kendra' | 'Agriculture Office' | 'Fertilizer Shop' | 'Seed Shop' | 'Soil Testing Lab';
  lat: number;
  lng: number;
  distanceKm: number;
  address: string;
}

export interface AppNotification {
  id: string;
  type: 'weather' | 'subsidy' | 'reply' | 'reward' | 'forum';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}
