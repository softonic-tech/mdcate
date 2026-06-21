import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Spinner({ className, size = 24 }) {
  return <Loader2 className={cn("animate-spin text-primary", className)} size={size} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size={32} />
    </div>
  );
}
