/**
 * Root operation types — entry points into the graph.
 */
export const rootTypeDefs = `#graphql
  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
  }

  type Mutation {
    createPost(title: String!, authorId: ID!): Post!
  }
`;
