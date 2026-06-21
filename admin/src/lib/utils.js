import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function truncate(str, length) {
  if (!str) return "";
  return str.length <= length ? str : str.slice(0, length) + "...";
}

// Extract name from populated or plain ID field
export function getName(field, fallback = "—") {
  if (!field) return fallback;
  if (typeof field === "string") return field;
  return field.name || field.title || field.username || fallback;
}
