import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeamMember } from "@/types";

interface TeamCardProps {
  member: TeamMember;
}

export function TeamCard({ member }: TeamCardProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6 text-center">
        <Avatar className="mx-auto size-20 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {member.isManagement && (
          <Badge variant="secondary" className="mt-3">
            مدیریت
          </Badge>
        )}
        <h3 className="mt-3 font-semibold group-hover:text-primary">
          {member.name}
        </h3>
        <p className="text-sm text-accent">{member.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>
      </CardContent>
    </Card>
  );
}
