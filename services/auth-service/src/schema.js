const { gql } = require('apollo-server-express');

module.exports = gql`
  enum UserRole {
    ADMIN
    OPERATOR
  }

  type User {
    id: ID!
    email: String!
    username: String!
    role: UserRole!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthResponse {
    accessToken: String!
    user: User!
  }

  type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    register(email: String!, username: String!, password: String!, role: UserRole): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
  }
`;
