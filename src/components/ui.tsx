import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function ButtonLink({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-primary text-white hover:opacity-90",
    secondary: "bg-secondary-soft text-secondary hover:bg-[#cbdcaf]",
    ghost: "border border-outline/40 text-primary hover:bg-surface-muted"
  };

  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-surface-line bg-surface p-6 shadow-ambient ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  eyebrow,
  body
}: {
  title: string;
  eyebrow?: string;
  body?: string;
}) {
  return (
    <header className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-outline">{eyebrow}</p> : null}
      <h1 className="font-display text-3xl font-semibold leading-tight text-primary md:text-5xl">{title}</h1>
      {body ? <p className="text-base leading-7 text-outline md:text-lg">{body}</p> : null}
    </header>
  );
}
