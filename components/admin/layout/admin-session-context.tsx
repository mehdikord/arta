"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdminSessionPayload } from "@/lib/admin/session";

const AdminSessionContext = createContext<AdminSessionPayload | null>(null);

export function AdminSessionProvider({
  admin,
  children,
}: {
  admin: AdminSessionPayload;
  children: ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={admin}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession requires AdminSessionProvider");
  return ctx;
}
