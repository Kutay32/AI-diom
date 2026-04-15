import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800",
  secondary: "bg-slate-900 text-slate-50 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-800 hover:bg-slate-200",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
};

export function Button({ asChild, className, variant = "primary", type = "button", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl px-5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        variantClassMap[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
