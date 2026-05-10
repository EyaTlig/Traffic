const { gql } = require('apollo-server-express');

module.exports = gql`
  enum VehicleType { CAR TRUCK BUS MOTORCYCLE EMERGENCY }
  enum VehicleStatus { ACTIVE INACTIVE MAINTENANCE }

  type GpsPosition {
    id: ID!
    vehicleId: String!
    latitude: Float!
    longitude: Float!
    speed: Float
    address: String
    recordedAt: String!
  }

  type Vehicle {
    id: ID!
    licensePlate: String!
    brand: String!
    model: String!
    type: VehicleType!
    status: VehicleStatus!
    driverName: String
    positions: [GpsPosition]
    createdAt: String!
    # updatedAt supprimé car pas dans la base de données
  }

  type Query {
    vehicles: [Vehicle!]!
    vehicle(id: ID!): Vehicle
    positionHistory(vehicleId: ID!, limit: Int): [GpsPosition!]!
    lastPosition(vehicleId: ID!): GpsPosition
  }

  type Mutation {
    createVehicle(
      licensePlate: String!
      brand: String!
      model: String!
      type: VehicleType
      driverName: String
    ): Vehicle!

    updateVehicle(
      id: ID!
      licensePlate: String
      brand: String
      model: String
      type: VehicleType
      status: VehicleStatus
      driverName: String
    ): Vehicle!

    removeVehicle(id: ID!): Boolean!

    recordPosition(
      vehicleId: ID!
      latitude: Float!
      longitude: Float!
      speed: Float
      address: String
    ): GpsPosition!
  }
`;