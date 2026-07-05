import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionContainer } from "@/components/shared/section-container";

export default function Loading() {
  return (
    <MainLayout>
      <SectionContainer>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
      </div>
      <LoadingSkeleton count={6} columns={3} />
      </SectionContainer>
    </MainLayout>
  );
}
