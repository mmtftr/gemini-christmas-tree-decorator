/**
 * Session Functions
 *
 * These functions mimic Convex queries and mutations for tree sessions.
 */

import { TreeConfig, TreeSession, User, DEFAULT_QUOTAS } from '../types';

// In-memory store
let sessionStore: TreeSession | null = null;
let treeConfigStore: TreeConfig = {
  seed: 12345,
  height: 6,
  radius: 2.5,
  tiers: 7,
  color: '#1a472a',
  snowAmount: 0.3,
};

let currentUserStore: User = {
  id: 'local-user',
  name: 'Guest',
  tier: 'unlimited',
  quota: {
    ...DEFAULT_QUOTAS.unlimited,
    usedOrnaments: 0,
    usedToppers: 0,
  },
};

let listeners: Set<() => void> = new Set();
const notifyListeners = () => listeners.forEach(l => l());
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Get current session
 * Convex: query({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function get(_args: { sessionId?: string }): Promise<TreeSession | null> {
  return sessionStore;
}

/**
 * Get tree config
 * Convex: query({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function getTreeConfig(_args: { sessionId?: string }): Promise<TreeConfig> {
  return { ...treeConfigStore };
}

/**
 * Get current user
 * Convex: query({ args: {}, handler: ... }) - uses auth context
 */
export async function getCurrentUser(): Promise<User> {
  return { ...currentUserStore };
}

/**
 * Create a new session
 * Convex: mutation({ args: { name: v.string() }, handler: ... })
 */
export async function create(args: { name: string }): Promise<TreeSession> {
  sessionStore = {
    id: generateId(),
    name: args.name,
    ownerId: currentUserStore.id,
    treeConfig: { ...treeConfigStore },
    isPublic: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  notifyListeners();
  return sessionStore;
}

/**
 * Update tree config
 * Convex: mutation({ args: { sessionId, ...updates }, handler: ... })
 */
export async function updateTreeConfig(args: {
  sessionId?: string;
  updates: Partial<TreeConfig>;
}): Promise<TreeConfig> {
  treeConfigStore = { ...treeConfigStore, ...args.updates };

  if (sessionStore) {
    sessionStore.treeConfig = treeConfigStore;
    sessionStore.updatedAt = Date.now();
  }

  notifyListeners();
  return treeConfigStore;
}

/**
 * Join a session by invite code
 * Convex: mutation({ args: { inviteCode: v.string() }, handler: ... })
 */
export async function joinByCode(_args: { inviteCode: string }): Promise<TreeSession | null> {
  // Mock: would look up session by invite code
  return sessionStore;
}

/**
 * Generate invite code
 * Convex: mutation({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function generateInviteCode(_args: { sessionId: string }): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  if (sessionStore) {
    sessionStore.inviteCode = code;
    notifyListeners();
  }
  return code;
}

/**
 * Subscribe to session changes
 */
export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function _reset(): void {
  sessionStore = null;
  treeConfigStore = {
    seed: 12345,
    height: 6,
    radius: 2.5,
    tiers: 7,
    color: '#1a472a',
    snowAmount: 0.3,
  };
  notifyListeners();
}
