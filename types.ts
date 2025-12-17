// ============================================
// ORNAMENT TYPES
// ============================================

// Currently available ornaments (procedural geometry)
export const ORNAMENT_TYPES = [
  'sphere',
  'cube',
  'diamond',
  'giftBox',
  'snowflake',
  'heart',
] as const;

export type OrnamentType = typeof ORNAMENT_TYPES[number];

// Placeholder for future GLB-based ornaments
export const FUTURE_ORNAMENT_TYPES = [
  'star',
  'candyCane',
  'bell',
  'icicle',
  'gingerbread',
  'ribbon',
] as const;

export const ORNAMENT_CATEGORIES = {
  classic: ['sphere', 'diamond'],
  shapes: ['cube', 'heart'],
  festive: ['giftBox', 'snowflake'],
} as const;

export type OrnamentCategory = keyof typeof ORNAMENT_CATEGORIES;

// ============================================
// ORNAMENT DATA (prepared for multi-user)
// ============================================

export interface OrnamentData {
  id: string;
  type: OrnamentType;
  color: string;
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];

  // Multi-user fields (will be populated by Convex)
  userId?: string;
  userName?: string;
  createdAt?: number;
}

// ============================================
// TREE TOPPER
// ============================================

export type TopperType = 'star' | 'angel' | 'bow' | 'snowflake';

export interface TreeTopperData {
  id: string;
  type: TopperType;
  color: string;
  scale: number;
  glow: boolean;

  // Multi-user fields
  userId?: string;
  userName?: string;
  createdAt?: number;
}

// ============================================
// TREE CONFIGURATION
// ============================================

export interface TreeConfig {
  seed: number;
  height: number;
  radius: number;
  tiers: number;
  color: string;
  snowAmount: number;
}

// ============================================
// USER & QUOTAS (prepared for Convex + payments)
// ============================================

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;

  // Quota tracking
  quota: UserQuota;

  // Subscription tier
  tier: 'free' | 'basic' | 'premium' | 'unlimited';
}

export interface UserQuota {
  maxOrnaments: number;
  usedOrnaments: number;
  maxToppers: number;
  usedToppers: number;

  // Premium features
  canUseSpecialOrnaments: boolean;
  canUseCustomColors: boolean;
  canUseAnimations: boolean;
}

export const DEFAULT_QUOTAS: Record<User['tier'], Omit<UserQuota, 'usedOrnaments' | 'usedToppers'>> = {
  free: {
    maxOrnaments: 10,
    maxToppers: 1,
    canUseSpecialOrnaments: false,
    canUseCustomColors: false,
    canUseAnimations: false,
  },
  basic: {
    maxOrnaments: 50,
    maxToppers: 1,
    canUseSpecialOrnaments: true,
    canUseCustomColors: true,
    canUseAnimations: false,
  },
  premium: {
    maxOrnaments: 200,
    maxToppers: 3,
    canUseSpecialOrnaments: true,
    canUseCustomColors: true,
    canUseAnimations: true,
  },
  unlimited: {
    maxOrnaments: Infinity,
    maxToppers: Infinity,
    canUseSpecialOrnaments: true,
    canUseCustomColors: true,
    canUseAnimations: true,
  },
};

// ============================================
// SHARED TREE SESSION (for multi-user collab)
// ============================================

export interface TreeSession {
  id: string;
  name: string;
  ownerId: string;

  // Tree state
  treeConfig: TreeConfig;
  topper?: TreeTopperData;

  // Sharing
  isPublic: boolean;
  inviteCode?: string;

  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface SessionParticipant {
  sessionId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: number;
  isOnline: boolean;
  cursorPosition?: [number, number, number];
}

// ============================================
// AI THEME GENERATION
// ============================================

export enum ThemeType {
  CLASSIC = 'classic',
  FROZEN = 'frozen',
  CANDY = 'candy',
  GOLDEN = 'golden',
  MIDNIGHT = 'midnight'
}

export interface GeneratedTheme {
  treeColor: string;
  ornamentColors: string[];
  snowAmount: number;
  backgroundColor: string;
  description: string;
}

// ============================================
// UI STATE
// ============================================

export type EditorMode = 'view' | 'decorate' | 'topper';

export interface EditorState {
  mode: EditorMode;
  selectedOrnamentType: OrnamentType;
  selectedTopperType: TopperType;
  selectedColor: string;
  activePlacement: [number, number, number] | null;
}

// ============================================
// REAL-TIME EVENTS (for Convex subscriptions)
// ============================================

export type OrnamentEvent =
  | { type: 'ornament_added'; ornament: OrnamentData }
  | { type: 'ornament_removed'; ornamentId: string }
  | { type: 'ornament_updated'; ornament: OrnamentData }
  | { type: 'topper_changed'; topper: TreeTopperData | null }
  | { type: 'tree_config_changed'; config: TreeConfig }
  | { type: 'participant_joined'; participant: SessionParticipant }
  | { type: 'participant_left'; participantId: string }
  | { type: 'cursor_moved'; userId: string; position: [number, number, number] };
