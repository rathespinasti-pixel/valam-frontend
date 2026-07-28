import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "sun" | "outline" | "outline-dark";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

// Thin typed wrapper around the original `.btn` / `.btn-*` classes — deliberately
// not a shadcn Button, since shadcn's default Tailwind theme would change the
// pill shape/shadow/hover colors that are part of the existing design.
export function Button({ variant = "primary", block, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("btn", `btn-${variant}`, block && "btn-block", className)}
      {...props}
    />
  );
}
