"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaqSearch } from "./faq-search";
import { FaqCategories } from "./faq-categories";
import type { FAQ } from "@/types";

interface FaqListProps {
  faqs: FAQ[];
  categories: string[];
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-accent/30 px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function FaqList({ faqs, categories }: FaqListProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, search, activeCategory]);

  return (
    <div className="space-y-6">
      <FaqSearch value={search} onChange={setSearch} />
      <FaqCategories
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {filtered.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-3">
          {filtered.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-xl border bg-card px-4 shadow-sm"
            >
              <AccordionTrigger className="text-start hover:no-underline">
                <div className="flex flex-1 flex-wrap items-center gap-2 pe-4">
                  <span>{highlightText(faq.question, search)}</span>
                  <Badge variant="outline" className="text-xs">
                    {faq.category}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {highlightText(faq.answer, search)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          سوالی با این مشخصات یافت نشد.
        </p>
      )}

      <div className="rounded-2xl border bg-muted/30 p-8 text-center">
        <h3 className="font-semibold">سوال دیگری دارید؟</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          تیم پشتیبانی ما آماده پاسخگویی به شماست
        </p>
        <Button asChild className="mt-4">
          <Link href="/contact">
            تماس با ما
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
