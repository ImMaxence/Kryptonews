'use client';

import { useCallback, useEffect, useRef } from 'react';
import { fetcher } from '@/lib/client-api';
import { solveChallenge, type PowChallenge, type PowSolution } from '@/lib/pow';

/** A solution is not reused when it expires within this margin. */
const MARGIN_MS = 30_000;

/**
 * Anti-bot proof for the sign-up form. `warm()` fetches a challenge and solves it in the
 * background (called when the reader starts filling in the form); `take()` returns a
 * fresh solution and queues the next one, since each solution is single-use server-side.
 */
export function useSignupProof() {
  const pending = useRef<Promise<PowSolution> | null>(null);
  const abort = useRef<AbortController | null>(null);

  const start = useCallback(() => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const promise = fetcher<PowChallenge>('/api/auth/challenge').then((challenge) => solveChallenge(challenge, controller.signal));
    promise.catch(() => {}); // surfaced by take()
    pending.current = promise;
    return promise;
  }, []);

  const warm = useCallback(() => {
    if (!pending.current) start();
  }, [start]);

  const take = useCallback(async () => {
    let solution: PowSolution;
    try {
      solution = await (pending.current ?? start());
      if (solution.expires - Date.now() < MARGIN_MS) solution = await start();
    } catch {
      solution = await start(); // stale or failed: one more try, errors propagate
    }
    pending.current = null;
    return solution;
  }, [start]);

  useEffect(() => () => abort.current?.abort(), []);

  return { warm, take };
}
