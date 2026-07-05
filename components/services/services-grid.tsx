"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ServiceIcon } from "@/components/shared/service-icon";
import { SERVICE_CATEGORY_LABELS } from "@/lib/constants";
import type { Service, ServiceCategory } from "@/types";
import { cn } from "@/lib/utils";

const categories: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "individual", label: "فردی" },
  { value: "couple", label: "زوجی" },
  { value: "organizational", label: "سازمانی" },
  { value: "educational", label: "آموزشی" },
];

interface ServicesGridProps {
  services: Service[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  const [activeCategory, setActiveCategory] = useState<
    ServiceCategory | "all"
  >("all");

  const filtered =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "rounded-full",
              activeCategory === cat.value && "shadow-sm",
            )}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {filtered.map((service) => (
            <AccordionItem
              key={service.id}
              value={service.id}
              className="overflow-hidden rounded-2xl border bg-card px-2 shadow-sm"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-4 text-start">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ServiceIcon name={service.icon} className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{service.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {service.shortDescription}
                    </p>
                  </div>
                  <CategoryBadge
                    label={
                      SERVICE_CATEGORY_LABELS[service.category] ??
                      service.category
                    }
                    className="me-auto hidden sm:inline-flex"
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-muted-foreground leading-relaxed">
                {service.fullDescription}
              </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          خدمتی در این دسته یافت نشد.
        </p>
      )}
    </div>
  );
}
