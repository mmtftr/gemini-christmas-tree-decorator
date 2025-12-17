/**
 * Ornament Functions
 *
 * These functions mimic Convex queries and mutations for ornaments.
 * In real Convex, these would use the database.
 */

import { OrnamentData, OrnamentType } from '../types';

// In-memory store (replaced by Convex DB in production)
let ornamentsStore: OrnamentData[] = [];
let listeners: Set<() => void> = new Set();

const notifyListeners = () => listeners.forEach(l => l());

// Generate ID (Convex generates these automatically)
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * List all ornaments for a session
 * Convex: query({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function list(_args: { sessionId?: string }): Promise<OrnamentData[]> {
  return [...ornamentsStore];
}

/**
 * Get a single ornament by ID
 * Convex: query({ args: { id: v.id("ornaments") }, handler: ... })
 */
export async function get(args: { id: string }): Promise<OrnamentData | null> {
  return ornamentsStore.find(o => o.id === args.id) ?? null;
}

/**
 * Add a new ornament
 * Convex: mutation({ args: { sessionId, type, color, position, scale }, handler: ... })
 */
export async function add(args: {
  sessionId?: string;
  type: OrnamentType;
  color: string;
  position: [number, number, number];
  scale: number;
  userId?: string;
  userName?: string;
}): Promise<OrnamentData> {
  const ornament: OrnamentData = {
    id: generateId(),
    type: args.type,
    color: args.color,
    position: args.position,
    scale: args.scale,
    userId: args.userId,
    userName: args.userName,
    createdAt: Date.now(),
  };

  ornamentsStore.push(ornament);
  notifyListeners();
  return ornament;
}

/**
 * Update an ornament
 * Convex: mutation({ args: { id, ...updates }, handler: ... })
 */
export async function update(args: {
  id: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}): Promise<boolean> {
  const index = ornamentsStore.findIndex(o => o.id === args.id);
  if (index === -1) return false;

  const { id, ...updates } = args;
  ornamentsStore[index] = { ...ornamentsStore[index], ...updates };
  notifyListeners();
  return true;
}

/**
 * Remove an ornament
 * Convex: mutation({ args: { id: v.id("ornaments") }, handler: ... })
 */
export async function remove(args: { id: string }): Promise<boolean> {
  const index = ornamentsStore.findIndex(o => o.id === args.id);
  if (index === -1) return false;

  ornamentsStore.splice(index, 1);
  notifyListeners();
  return true;
}

/**
 * Clear all ornaments for a session
 * Convex: mutation({ args: { sessionId: v.id("sessions") }, handler: ... })
 */
export async function clearAll(_args: { sessionId?: string }): Promise<void> {
  ornamentsStore = [];
  notifyListeners();
}

/**
 * Subscribe to ornament changes (for real-time updates)
 * In Convex, this is automatic with useQuery
 */
export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Internal: Reset store (for testing)
 */
export function _reset(): void {
  ornamentsStore = [];
  notifyListeners();
}
