import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Brain,
  Building2,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  Sprout,
  Users,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  "heart-handshake": HeartHandshake,
  baby: Baby,
  sprout: Sprout,
  "building-2": Building2,
  users: Users,
  "clipboard-list": ClipboardList,
  "graduation-cap": GraduationCap,
};

export function getServiceIcon(name: string): LucideIcon {
  return iconMap[name] ?? Brain;
}
