export function dispatchUnreadCount(count) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("notifications:unread-count", { detail: Number(count) || 0 })
  );
}

export function subscribeUnreadCount(handler) {
  if (typeof window === "undefined") return () => {};
  const listener = (e) => handler(e.detail);
  window.addEventListener("notifications:unread-count", listener);
  return () => window.removeEventListener("notifications:unread-count", listener);
}
