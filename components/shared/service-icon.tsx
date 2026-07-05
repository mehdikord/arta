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
import { cn } from "@/lib/utils";

interface ServiceIconProps {
  name: string;
  className?: string;
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const iconClass = cn("size-6", className);

  switch (name) {
    case "heart-handshake":
      return <HeartHandshake className={iconClass} />;
    case "baby":
      return <Baby className={iconClass} />;
    case "sprout":
      return <Sprout className={iconClass} />;
    case "building-2":
      return <Building2 className={iconClass} />;
    case "users":
      return <Users className={iconClass} />;
    case "clipboard-list":
      return <ClipboardList className={iconClass} />;
    case "graduation-cap":
      return <GraduationCap className={iconClass} />;
    case "brain":
    default:
      return <Brain className={iconClass} />;
  }
}
