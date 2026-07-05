import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/shared/category-badge";
import { AppointmentLink } from "@/components/shared/appointment-link";
import { ServiceIcon } from "@/components/shared/service-icon";
import { SERVICE_CATEGORY_LABELS } from "@/lib/constants";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
      <div className="h-1 bg-gradient-to-l from-primary to-accent" />
      <CardContent className="p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ServiceIcon name={service.icon} />
        </div>
        <CategoryBadge
          label={
            SERVICE_CATEGORY_LABELS[service.category] ?? service.category
          }
        />
        <h3 className="mt-3 text-lg font-semibold group-hover:text-primary">
          {service.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {service.shortDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <AppointmentLink size="sm" />
          <Button asChild size="sm" variant="outline">
            <Link href="/contact">
              <MessageCircle className="size-4" />
              تماس
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
