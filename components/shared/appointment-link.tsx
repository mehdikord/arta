"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSession } from "@/components/auth/user-session-provider";
import { cn } from "@/lib/utils";

interface AppointmentLinkProps {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  label?: string;
  showIcon?: boolean;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function AppointmentLink({
  size = "default",
  variant = "default",
  className,
  label = "رزرو نوبت",
  showIcon = true,
}: AppointmentLinkProps) {
  const { isAuthenticated } = useUserSession();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const href =
    mounted && isAuthenticated
      ? "/appointment"
      : "/auth/login?redirect=/appointment";

  return (
    <Button asChild size={size} variant={variant} className={cn(className)}>
      <Link href={href}>
        {showIcon && <Calendar className="size-4" />}
        {label}
      </Link>
    </Button>
  );
}
