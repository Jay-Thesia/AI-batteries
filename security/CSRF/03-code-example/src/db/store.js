/**
 * In-memory store.
 * Sessions hold csrfToken — identity (cookie) and intent (token) stay separate.
 */
export const store = {
  users: [],
  sessions: new Map(),
};
