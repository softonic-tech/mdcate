import { Inbox } from "lucide-react";

export default function EmptyState({ message = "No data found", icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-muted">
      <Icon size={48} strokeWidth={1.5} />
      <p className="mt-3 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
