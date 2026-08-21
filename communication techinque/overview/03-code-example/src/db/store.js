/**
 * In-memory store — one inbox, three delivery techniques.
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
