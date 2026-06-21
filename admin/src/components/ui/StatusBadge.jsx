import { cn } from "@/lib/utils";

const variants = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function StatusBadge({ children, variant = "default", className }) {
  return (
    <span className={cn("badge-status", variants[variant], className)}>
      {children}
    </span>
  );
}
