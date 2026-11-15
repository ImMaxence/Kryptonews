'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readGuestStore } from '@/lib/guest-store';
import type { SiteConfig, User } from '@/lib/types';

interface SessionValue {
  user: User | null;
  setUser: (user: User | null) => void;
  config: SiteConfig | null;
}

const SessionContext = createContext<SessionValue>({ user: null, setUser: () => {}, config: null });

export function SessionProvider({ user: initialUser, config, children }: { user: User | null; config: SiteConfig | null; children: ReactNode }) {
  const [user, setUser] = useState(initialUser);

  // The server is the source of truth: resync after router.refresh(). A guest's demo
  // portrait and name live in this browser only (localStorage).
  useEffect(() => {
    if (!initialUser?.isGuest) return setUser(initialUser);
    const { profile } = readGuestStore();
    setUser({ ...initialUser, ...profile });
  }, [initialUser]);

  const value = useMemo(() => ({ user, setUser, config }), [user, config]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
