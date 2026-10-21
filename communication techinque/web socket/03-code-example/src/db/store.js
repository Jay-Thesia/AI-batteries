/**
 * In-memory store.
 * In a real service this would be Postgres / Redis / etc.
 */
export const store = {
  messages: [],
  sequences: {
    messageId: 100,
  },
};

export function nextMessageId() {
  store.sequences.messageId += 1;
  return String(store.sequences.messageId);
}
