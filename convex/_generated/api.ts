/**
 * Mock Convex API - Generated API object
 *
 * This mimics Convex's auto-generated api object.
 * When switching to real Convex, replace this with:
 * export { api } from "convex/_generated/api";
 */

import * as ai from '../ai';
import * as ornaments from '../ornaments';
import * as session from '../session';
import * as topper from '../topper';

export const api = {
  ai,
  ornaments,
  session,
  topper,
} as const;

export type Api = typeof api;
