const { gql } = require('apollo-server-express');

module.exports = gql`
  enum NotificationType { INCIDENT CONGESTION SYSTEM ALERT }

  type Notification {
    id: ID!
    title: String!
    message: String!
    type: NotificationType!
    recipientId: String!
    isRead: Boolean!
    relatedEntityId: String
    readAt: String
    createdAt: String!
  }

  type Query {
    notifications(recipientId: String): [Notification!]!
    notification(id: ID!): Notification
    unreadNotificationsCount(recipientId: String!): Int!
  }

  type Mutation {
    sendNotification(
      title: String!
      message: String!
      type: NotificationType
      recipientId: String!
      relatedEntityId: String
    ): Notification!

    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead(recipientId: String!): Int!
    deleteNotification(id: ID!): Boolean!
  }
`;
