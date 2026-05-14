// Owns the shared button class variants used by app shells and feature screens.
// Keeps shadcn-style control styling centralized while this repo has a small UI layer.
// Must stay presentational so links and buttons can choose their own semantics.
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-[color:oklch(0.33_0.075_31.5)] bg-[linear-gradient(180deg,oklch(0.46_0.09_34),oklch(0.34_0.07_31))] text-[color:oklch(0.985_0.004_84.5)] shadow-[0_10px_30px_-16px_rgba(93,47,28,0.85)] hover:-translate-y-px hover:shadow-[0_18px_36px_-18px_rgba(93,47,28,0.95)] focus-visible:outline-[color:oklch(0.36_0.08_33.5)]",
  secondary:
    "border border-[color:oklch(0.88_0.014_74)] bg-white/88 text-[color:oklch(0.26_0.026_40.5)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:border-[color:oklch(0.8_0.022_57)] hover:bg-[color:oklch(0.985_0.005_84.5)] focus-visible:outline-[color:oklch(0.36_0.08_33.5)]",
  ghost:
    "text-[color:oklch(0.45_0.025_39)] hover:bg-[color:oklch(0.95_0.012_76)] hover:text-[color:oklch(0.24_0.025_40)] focus-visible:outline-[color:oklch(0.36_0.08_33.5)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}
