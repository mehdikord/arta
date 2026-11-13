"use client";

import type { ReactNode } from "react";
import { Direction } from "radix-ui";

/**
 * Radix primitives (Select, DropdownMenu, Tabs, ScrollArea, …) read the
 * reading direction from context, not from the DOM `dir` attribute.
 * Without this, keyboard navigation, submenu sides and scrollbars behave LTR.
 */
export function AdminDirectionProvider({ children }: { children: ReactNode }) {
  return <Direction.DirectionProvider dir="rtl">{children}</Direction.DirectionProvider>;
}
