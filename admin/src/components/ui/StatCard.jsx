import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, color = "primary", subtitle }) {
  const colorMap = {
    primary: "text-primary bg-blue-50",
    success: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    danger: "text-red-600 bg-red-50",
    purple: "text-purple-600 bg-purple-50",
    accent: "text-cyan-600 bg-cyan-50",
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-2xl font-bold font-heading mt-1">{value ?? "—"}</p>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-lg", colorMap[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
