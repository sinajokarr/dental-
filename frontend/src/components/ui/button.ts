// Button styles (DESIGN_SYSTEM §7). Applied to <a>, next-intl <Link> or <button> — no wrapper component needed.
export type ButtonVariant = "primary" | "inverted" | "whatsapp" | "whatsapp-dark" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,box-shadow,transform,color] duration-200 ease-out active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 " +
  "aria-busy:cursor-progress";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-700 text-white hover:bg-navy-800 hover:shadow-glow",
  inverted: "bg-white text-navy-900 hover:bg-sky-100 focus-visible:outline-sky-400",
  whatsapp: "glass-card text-navy-900 hover:[--edge-fill:rgb(255_255_255/0.85)]",
  "whatsapp-dark": "glass-dark text-white hover:bg-navy-800 focus-visible:outline-sky-400",
  tertiary: "group rounded-none px-0 text-blue-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-5 text-sm",
  md: "min-h-13 px-7 text-base",
  lg: "min-h-14 px-8 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return `${base} ${variants[variant]} ${variant === "tertiary" ? "min-h-11" : sizes[size]}`;
}
