"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserSession } from "@/components/auth/user-session-provider";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { SectionContainer } from "@/components/shared/section-container";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useUserSession();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) {
    return (
      fallback ?? (
        <SectionContainer>
          <LoadingSkeleton count={3} columns={1} />
        </SectionContainer>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback ?? (
        <SectionContainer>
          <LoadingSkeleton count={3} columns={1} />
        </SectionContainer>
      )
    );
  }

  return <>{children}</>;
}
