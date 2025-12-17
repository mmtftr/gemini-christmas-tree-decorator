/**
 * Tree Topper Functions
 *
 * These functions mimic Convex queries and mutations for the tree topper.
 */

import { TreeTopperData, TopperType } from '../types';

// In-memory store
let topperStore: TreeTopperData | null = null;
let listeners: Set<() => void> = new Set();

const notifyListeners = () => listeners.forEach(l => l());
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Get the current topper
 * Convex: query({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function get(_args: { sessionId?: string }): Promise<TreeTopperData | null> {
  return topperStore;
}

/**
 * Set the tree topper
 * Convex: mutation({ args: { sessionId, type, color, scale, glow }, handler: ... })
 */
export async function set(args: {
  sessionId?: string;
  type: TopperType;
  color: string;
  scale: number;
  glow: boolean;
  userId?: string;
  userName?: string;
} | null): Promise<TreeTopperData | null> {
  if (args === null) {
    topperStore = null;
    notifyListeners();
    return null;
  }

  topperStore = {
    id: generateId(),
    type: args.type,
    color: args.color,
    scale: args.scale,
    glow: args.glow,
    userId: args.userId,
    userName: args.userName,
    createdAt: Date.now(),
  };

  notifyListeners();
  return topperStore;
}

/**
 * Remove the topper
 * Convex: mutation({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function remove(_args: { sessionId?: string }): Promise<void> {
  topperStore = null;
  notifyListeners();
}

/**
 * Subscribe to topper changes
 */
export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function _reset(): void {
  topperStore = null;
  notifyListeners();
}
