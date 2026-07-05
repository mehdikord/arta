import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: 1 | 2 | 3;
}

export function AnimateIn({ children, className, delay }: AnimateInProps) {
  return (
    <div
      className={cn(
        "animate-fade-in-up",
        delay === 1 && "animate-fade-in-delay-1",
        delay === 2 && "animate-fade-in-delay-2",
        delay === 3 && "animate-fade-in-delay-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
