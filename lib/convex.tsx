/**
 * Mock Convex React Hooks
 *
 * These hooks mimic Convex's React bindings.
 * When switching to real Convex, replace with:
 * export { useQuery, useMutation, useAction, ConvexProvider } from "convex/react";
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Re-export the api for convenience
export { api } from '../convex/_generated/api';

// ============================================
// TYPES
// ============================================

type QueryFunction<Args, Result> = (args: Args) => Promise<Result>;
type MutationFunction<Args, Result> = (args: Args) => Promise<Result>;
type ActionFunction<Args, Result> = (args: Args) => Promise<Result>;

type FunctionReference = {
  (...args: any[]): Promise<any>;
  subscribe?: (callback: () => void) => () => void;
};

// ============================================
// MOCK CONVEX PROVIDER
// ============================================

interface ConvexContextValue {
  // In real Convex, this would hold the client connection
  isConnected: boolean;
}

const ConvexContext = createContext<ConvexContextValue | null>(null);

interface ConvexProviderProps {
  children: React.ReactNode;
  // In real Convex: client: ConvexReactClient
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  const [isConnected] = useState(true);

  return (
    <ConvexContext.Provider value={{ isConnected }}>
      {children}
    </ConvexContext.Provider>
  );
}

export function useConvex() {
  const context = useContext(ConvexContext);
  if (!context) {
    throw new Error('useConvex must be used within a ConvexProvider');
  }
  return context;
}

// ============================================
// useQuery - For reading data with real-time updates
// ============================================

/**
 * Subscribe to a query and get real-time updates.
 *
 * In real Convex:
 * const data = useQuery(api.ornaments.list, { sessionId });
 *
 * @param queryFn - The query function from the api object
 * @param args - Arguments to pass to the query
 * @returns The query result, or undefined while loading
 */
export function useQuery<Args extends Record<string, any>, Result>(
  queryFn: QueryFunction<Args, Result> & { subscribe?: (cb: () => void) => () => void },
  args: Args
): Result | undefined {
  const [data, setData] = useState<Result | undefined>(undefined);
  const [, forceUpdate] = useState({});
  const argsRef = useRef(args);
  argsRef.current = args;

  // Initial fetch
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const result = await queryFn(argsRef.current);
        if (mounted) {
          setData(result);
        }
      } catch (error) {
        console.error('Query error:', error);
      }
    };

    fetchData();

    // Subscribe to updates if available
    const unsubscribe = queryFn.subscribe?.(() => {
      fetchData();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [queryFn]);

  return data;
}

// ============================================
// useMutation - For modifying data
// ============================================

/**
 * Get a function to call a mutation.
 *
 * In real Convex:
 * const addOrnament = useMutation(api.ornaments.add);
 * await addOrnament({ type: 'sphere', color: '#ff0000', ... });
 *
 * @param mutationFn - The mutation function from the api object
 * @returns A function that calls the mutation
 */
export function useMutation<Args, Result>(
  mutationFn: MutationFunction<Args, Result>
): (args: Args) => Promise<Result> {
  const mutate = useCallback(
    async (args: Args): Promise<Result> => {
      try {
        return await mutationFn(args);
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    [mutationFn]
  );

  return mutate;
}

// ============================================
// useAction - For calling backend actions (like AI)
// ============================================

/**
 * Get a function to call an action.
 * Actions are for operations that need backend resources (like API keys).
 *
 * In real Convex:
 * const generateTheme = useAction(api.ai.generateTheme);
 * const theme = await generateTheme({ prompt: "winter wonderland" });
 *
 * @param actionFn - The action function from the api object
 * @returns A function that calls the action
 */
export function useAction<Args, Result>(
  actionFn: ActionFunction<Args, Result>
): (args: Args) => Promise<Result> {
  const [isLoading, setIsLoading] = useState(false);

  const runAction = useCallback(
    async (args: Args): Promise<Result> => {
      setIsLoading(true);
      try {
        return await actionFn(args);
      } catch (error) {
        console.error('Action error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [actionFn]
  );

  return runAction;
}

/**
 * Same as useAction but returns loading state too
 */
export function useActionWithStatus<Args, Result>(
  actionFn: ActionFunction<Args, Result>
): {
  runAction: (args: Args) => Promise<Result>;
  isLoading: boolean;
  error: Error | null;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runAction = useCallback(
    async (args: Args): Promise<Result> => {
      setIsLoading(true);
      setError(null);
      try {
        return await actionFn(args);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [actionFn]
  );

  return { runAction, isLoading, error };
}

// ============================================
// Utility Types for API
// ============================================

export type FunctionArgs<T extends FunctionReference> = T extends (args: infer A) => any ? A : never;
export type FunctionReturnType<T extends FunctionReference> = T extends (...args: any[]) => Promise<infer R> ? R : never;
