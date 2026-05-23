const { gql } = require('graphql-tag');

module.exports = gql`
  enum NotificationType {
    INCIDENT
    CONGESTION
    SYSTEM
    ALERT
  }

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

  type Subscription {
    """
    Pushed to a specific recipient in real-time when a new notification
    is created for them via sendNotification.
    """
    notificationReceived(recipientId: String!): Notification!

    """
    Pushed whenever any notification for a recipient is marked as read
    (individually or via markAllNotificationsRead).
    """
    notificationRead(recipientId: String!): Notification!
  }
`;