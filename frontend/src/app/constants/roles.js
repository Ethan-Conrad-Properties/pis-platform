export const ROLES = {
  IT: "IT",
  Director: "Director",
  USER: "User",
  PM: "PropertyManager",
  Broker: "Broker",
  AP: "AP",
};


export function hasRole(session, role) {
  return session?.user?.roles?.includes(role);
}

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