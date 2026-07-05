"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/types/session-user";

interface UserSessionContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

const UserSessionContext = createContext<UserSessionContextValue>({
  user: null,
  isAuthenticated: false,
});

export function UserSessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <UserSessionContext.Provider
      value={{ user, isAuthenticated: !!user }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  return useContext(UserSessionContext);
}
