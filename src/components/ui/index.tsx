import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-fire-500 to-fire-600 text-white shadow-lg shadow-fire-900/40 hover:from-fire-400 hover:to-fire-500",
    secondary:
      "bg-surface-700 text-text-primary border border-surface-600 hover:bg-surface-600",
    ghost: "text-fire-400 hover:bg-surface-800",
  };

  const sizes = {
    sm: "text-sm px-4 py-2 gap-1.5",
    md: "text-base px-6 py-3 gap-2",
    lg: "text-lg px-8 py-4 gap-2.5",
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-5 ${glow ? "glow-fire-box" : ""} ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Badge Chip ───────────────────────────────────────────────────────────────

interface BadgeChipProps {
  emoji: string;
  name: string;
  locked?: boolean;
}

export function BadgeChip({ emoji, name, locked = false }: BadgeChipProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
        locked
          ? "border-surface-700 bg-surface-800/50 opacity-40 grayscale"
          : "border-fire-800/60 bg-fire-900/20"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span
        className={`text-xs font-semibold text-center leading-tight ${
          locked ? "text-text-muted" : "text-fire-300"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

// ─── Day Dot ──────────────────────────────────────────────────────────────────

interface DayDotProps {
  dayNumber: number;
  status: "completed" | "available" | "locked" | "today";
}

export function DayDot({ dayNumber, status }: DayDotProps) {
  const styles = {
    completed: "bg-fire-500 text-white border-fire-400",
    available: "bg-surface-700 text-text-secondary border-surface-600 hover:border-fire-600",
    locked: "bg-surface-800 text-text-muted border-surface-700 opacity-40",
    today: "bg-fire-500/20 text-fire-300 border-fire-500 animate-pulse-fire",
  };

  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${styles[status]}`}
    >
      {status === "completed" ? "✓" : dayNumber}
    </div>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest px-5 mb-3">
      {children}
    </h2>
  );
}
