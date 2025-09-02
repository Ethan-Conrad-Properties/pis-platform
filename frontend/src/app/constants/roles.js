// -------------------------------------------------------------------
// roles.js
// Central place to define user roles and helpers for role checking.
// Used throughout the app to control access (e.g. only Directors
// can add properties, only IT/Directors can view edit history).
// -------------------------------------------------------------------

// Role constants
export const ROLES = {
  IT: "IT",
  Director: "Director",
  USER: "User",
  PM: "PropertyManager",
  Broker: "Broker",
  AP: "AP",
};

// Generic helper: check if session contains a given role
export function hasRole(session, role) {
  return session?.user?.roles?.includes(role);
}

// Specific helpers for convenience
export function isIT(session) {
  return hasRole(session, ROLES.IT);
}

export function isDirector(session) {
  return hasRole(session, ROLES.Director);
}

export function isPM(session) {
  return hasRole(session, ROLES.PM);
}

export function isBroker(session) {
  return hasRole(session, ROLES.Broker);
}

export function isAP(session) {
  return hasRole(session, ROLES.AP);
}
