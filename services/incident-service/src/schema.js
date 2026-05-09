const { gql } = require('apollo-server-express');

module.exports = gql`
  enum IncidentType { ACCIDENT ROADWORK ROAD_CLOSED TRAFFIC_JAM }
  enum IncidentStatus { REPORTED IN_PROGRESS RESOLVED }

  type Incident {
    id: ID!
    title: String!
    description: String
    type: IncidentType!
    status: IncidentStatus!
    latitude: Float!
    longitude: Float!
    address: String
    reportedBy: String
    resolvedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    incidents(type: IncidentType, status: IncidentStatus): [Incident!]!
    incident(id: ID!): Incident
    activeIncidents: [Incident!]!
  }

  type Mutation {
    createIncident(
      title: String!
      description: String
      type: IncidentType!
      latitude: Float!
      longitude: Float!
      address: String
    ): Incident!

    updateIncidentStatus(id: ID!, status: IncidentStatus!): Incident!

    removeIncident(id: ID!): Boolean!
  }
`;
