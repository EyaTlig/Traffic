const { gql } = require('apollo-server-express');

module.exports = gql`
  enum TrafficDensity { LOW MEDIUM HIGH }

  type TrafficMeasurement {
    id: ID!
    zoneId: String!
    vehicleCount: Int!
    averageSpeed: Float
    density: TrafficDensity!
    notes: String
    measuredAt: String!
  }

  type TrafficZone {
    id: ID!
    name: String!
    description: String
    centerLatitude: Float!
    centerLongitude: Float!
    radiusMeters: Float!
    currentDensity: TrafficDensity!
    isActive: Boolean!
    measurements: [TrafficMeasurement]
    createdAt: String!
    updatedAt: String!
  }

  type DensityStats {
    low: Int!
    medium: Int!
    high: Int!
  }

  type Query {
    trafficZones: [TrafficZone!]!
    trafficZone(id: ID!): TrafficZone
    congestedZones: [TrafficZone!]!
    zoneMeasurements(zoneId: ID!, limit: Int): [TrafficMeasurement!]!
    densityStats: DensityStats!
  }

  type Mutation {
    createTrafficZone(
      name: String!
      description: String
      centerLatitude: Float!
      centerLongitude: Float!
      radiusMeters: Float!
    ): TrafficZone!

    updateTrafficZone(
      id: ID!
      name: String
      description: String
      isActive: Boolean
    ): TrafficZone!

    measureTraffic(
      zoneId: ID!
      vehicleCount: Int!
      averageSpeed: Float
      notes: String
    ): TrafficMeasurement!
  }
`;
