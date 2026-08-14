/**
 * In-memory store.
 * In a real service this would be Postgres / Mongo / etc.
 * Kept mutable so mutations feel realistic during learning.
 */
export const store = {
  users: [],
  posts: [],
  sequences: {
    postId: 100,
  },
};

export function nextPostId() {
  store.sequences.postId += 1;
  return String(store.sequences.postId);
}
