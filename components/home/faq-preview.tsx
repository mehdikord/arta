import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { getFaqs } from "@/lib/data";

export async function FaqPreview() {
  const faqs = (await getFaqs()).slice(0, 5);

  return (
    <SectionContainer className="bg-muted/30">
      <SectionTitle
        title="سوالات پرتکرار"
        subtitle="پاسخ سریع به رایج‌ترین سوالات"
        centered
      />

      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-xl border bg-card px-4 shadow-sm"
            >
              <AccordionTrigger className="text-start hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="link">
          <Link href="/faq">
            مشاهده همه سوالات
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
