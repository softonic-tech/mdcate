const DISMISS_KEY = "medprep_upgrade_modal_dismissed";

function userKey(userId) {
  return userId ? `${DISMISS_KEY}_${userId}` : DISMISS_KEY;
}

export function isUpgradeModalDismissed(userId) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(userKey(userId)) === "1";
}

export function dismissUpgradeModal(userId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(userKey(userId), "1");
}

export function clearUpgradeModalDismissed(userId) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(userKey(userId));
}
