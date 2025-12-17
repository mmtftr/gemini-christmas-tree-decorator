/**
 * API Abstraction Layer
 *
 * This module provides a clean interface that mimics Convex's API patterns.
 * When Convex is added, replace this file's implementations with Convex calls.
 *
 * To migrate to Convex:
 * 1. Install Convex: npx convex dev
 * 2. Create corresponding functions in convex/ folder
 * 3. Update this file to import from 'convex/react' and use real mutations/actions
 */

import { OrnamentData, TreeTopperData, TreeConfig, OrnamentType, TopperType } from '../types';

// ============================================
// ORNAMENTS API
// ============================================

// In-memory store (will be replaced by Convex DB)
let ornamentsStore: OrnamentData[] = [];
let ornamentListeners: Set<() => void> = new Set();

const notifyOrnamentListeners = () => ornamentListeners.forEach(l => l());
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const ornaments = {
  /** List all ornaments. Convex: query */
  list: async (): Promise<OrnamentData[]> => [...ornamentsStore],

  /** Get ornament by ID. Convex: query */
  get: async (id: string): Promise<OrnamentData | null> =>
    ornamentsStore.find(o => o.id === id) ?? null,

  /** Add ornament. Convex: mutation */
  add: async (data: {
    type: OrnamentType;
    color: string;
    position: [number, number, number];
    scale: number;
    userId?: string;
    userName?: string;
  }): Promise<OrnamentData> => {
    const ornament: OrnamentData = {
      id: generateId(),
      ...data,
      createdAt: Date.now(),
    };
    ornamentsStore.push(ornament);
    notifyOrnamentListeners();
    return ornament;
  },

  /** Update ornament. Convex: mutation */
  update: async (id: string, updates: Partial<OrnamentData>): Promise<boolean> => {
    const index = ornamentsStore.findIndex(o => o.id === id);
    if (index === -1) return false;
    ornamentsStore[index] = { ...ornamentsStore[index], ...updates };
    notifyOrnamentListeners();
    return true;
  },

  /** Remove ornament. Convex: mutation */
  remove: async (id: string): Promise<boolean> => {
    const index = ornamentsStore.findIndex(o => o.id === id);
    if (index === -1) return false;
    ornamentsStore.splice(index, 1);
    notifyOrnamentListeners();
    return true;
  },

  /** Clear all ornaments. Convex: mutation */
  clearAll: async (): Promise<void> => {
    ornamentsStore = [];
    notifyOrnamentListeners();
  },

  /** Subscribe to changes. In Convex, useQuery handles this automatically */
  subscribe: (callback: () => void): (() => void) => {
    ornamentListeners.add(callback);
    return () => ornamentListeners.delete(callback);
  }
};

// ============================================
// TOPPER API
// ============================================

let topperStore: TreeTopperData | null = null;
let topperListeners: Set<() => void> = new Set();

const notifyTopperListeners = () => topperListeners.forEach(l => l());

export const topper = {
  /** Get current topper. Convex: query */
  get: async (): Promise<TreeTopperData | null> => topperStore,

  /** Set topper. Convex: mutation */
  set: async (data: {
    type: TopperType;
    color: string;
    scale: number;
    glow: boolean;
    userId?: string;
    userName?: string;
  } | null): Promise<TreeTopperData | null> => {
    if (data === null) {
      topperStore = null;
      notifyTopperListeners();
      return null;
    }
    topperStore = {
      id: generateId(),
      ...data,
      createdAt: Date.now(),
    };
    notifyTopperListeners();
    return topperStore;
  },

  /** Subscribe to changes */
  subscribe: (callback: () => void): (() => void) => {
    topperListeners.add(callback);
    return () => topperListeners.delete(callback);
  }
};

// ============================================
// SESSION API
// ============================================

let treeConfigStore: TreeConfig = {
  seed: 12345,
  height: 6,
  radius: 2.5,
  tiers: 7,
  color: '#1a472a',
  snowAmount: 0.3,
};

let sessionListeners: Set<() => void> = new Set();
const notifySessionListeners = () => sessionListeners.forEach(l => l());

export const session = {
  /** Get tree config. Convex: query */
  getTreeConfig: async (): Promise<TreeConfig> => ({ ...treeConfigStore }),

  /** Update tree config. Convex: mutation */
  updateTreeConfig: async (updates: Partial<TreeConfig>): Promise<TreeConfig> => {
    treeConfigStore = { ...treeConfigStore, ...updates };
    notifySessionListeners();
    return treeConfigStore;
  },

  /** Subscribe to changes */
  subscribe: (callback: () => void): (() => void) => {
    sessionListeners.add(callback);
    return () => sessionListeners.delete(callback);
  }
};

// ============================================
// UNIFIED API EXPORT
// ============================================

/**
 * Main API object - mimics Convex's api structure
 *
 * Usage:
 *   import { api } from '../lib/api';
 *   const ornaments = await api.ornaments.list();
 */
export const api = {
  ornaments,
  topper,
  session,
} as const;

export type Api = typeof api;
