export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}

export function truncate(text, length = 100) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "..." : text;
}