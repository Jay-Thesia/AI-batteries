export const userTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String
    posts: [Post!]!
  }
`;
