"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FaqSearch({ value, onChange, className }: FaqSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="جستجو در سوالات..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ps-10"
        aria-label="جستجو در سوالات متداول"
      />
    </div>
  );
}
