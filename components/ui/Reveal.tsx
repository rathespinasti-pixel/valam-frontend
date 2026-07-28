import { cn } from "@/lib/utils";

// Marks a section for the shared scroll-reveal observer (see
// hooks/useScrollReveal.ts). Kept as a plain server-renderable element
// (not a client component) since it only needs the "reveal" class —
// the actual observing happens once, globally, in the root layout.
export function Reveal({
  as: As = "div",
  className,
  style,
  children,
  ...rest
}: {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  id?: string;
} & Record<string, unknown>) {
  return (
    <As className={cn("reveal", className)} style={style} {...rest}>
      {children}
    </As>
  );
}
