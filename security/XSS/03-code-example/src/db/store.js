/**
 * In-memory store.
 * Comments are data — never pre-rendered HTML.
 */
export const store = {
  comments: [],
  sequences: {
    commentId: 100,
  },
};

export function nextCommentId() {
  store.sequences.commentId += 1;
  return String(store.sequences.commentId);
}
