const { gql } = require('apollo-server-express');

module.exports = gql`
  # Enums
  enum UserRole { ADMIN OPERATOR }
  enum VehicleType { CAR TRUCK BUS MOTORCYCLE EMERGENCY }
  enum VehicleStatus { ACTIVE INACTIVE MAINTENANCE }
  enum TrafficDensity { LOW MEDIUM HIGH }
  enum IncidentType { ACCIDENT ROADWORK ROAD_CLOSED TRAFFIC_JAM }
  enum IncidentStatus { REPORTED IN_PROGRESS RESOLVED }
  enum NotificationType { INCIDENT CONGESTION SYSTEM ALERT }

  # Auth
  type User {
    id: ID!
    email: String!
    username: String!
    role: UserRole!
    isActive: Boolean!
    createdAt: String!
  }
  type AuthResponse {
    accessToken: String!
    user: User!
  }

  # Vehicle
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
  }

  # Traffic
  type TrafficMeasurement {
    id: ID!
    zoneId: String!
    vehicleCount: Int!
    averageSpeed: Float
    density: TrafficDensity!
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
    createdAt: String!
    updatedAt: String
  }
  type DensityStats { low: Int! medium: Int! high: Int! }

  # Incident
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
    updatedAt: String
  }

  # Notification
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

  # Queries
  type Query {
    # Auth
    me: User
    users: [User!]!

    # Vehicles
    vehicles: [Vehicle!]!
    vehicle(id: ID!): Vehicle
    positionHistory(vehicleId: ID!, limit: Int): [GpsPosition!]!
    lastPosition(vehicleId: ID!): GpsPosition

    # Traffic
    trafficZones: [TrafficZone!]!
    trafficZone(id: ID!): TrafficZone
    congestedZones: [TrafficZone!]!
    zoneMeasurements(zoneId: ID!, limit: Int): [TrafficMeasurement!]!
    densityStats: DensityStats!

    # Incidents
    incidents(type: IncidentType, status: IncidentStatus): [Incident!]!
    incident(id: ID!): Incident
    activeIncidents: [Incident!]!

    # Notifications
    notifications(recipientId: String): [Notification!]!
    notification(id: ID!): Notification
    unreadNotificationsCount(recipientId: String!): Int!
  }

  # Mutations
  type Mutation {
    # Auth
    register(email: String!, username: String!, password: String!, role: UserRole): AuthResponse!
    login(email: String!, password: String!): AuthResponse!

    # Vehicles
    createVehicle(licensePlate: String!, brand: String!, model: String!, type: VehicleType, driverName: String): Vehicle!
    updateVehicle(id: ID!, licensePlate: String, brand: String, model: String, type: VehicleType, status: VehicleStatus, driverName: String): Vehicle!
    removeVehicle(id: ID!): Boolean!
    recordPosition(vehicleId: ID!, latitude: Float!, longitude: Float!, speed: Float, address: String): GpsPosition!

    # Traffic
    createTrafficZone(name: String!, description: String, centerLatitude: Float!, centerLongitude: Float!, radiusMeters: Float!): TrafficZone!
    updateTrafficZone(id: ID!, name: String, description: String, isActive: Boolean): TrafficZone!
    measureTraffic(zoneId: ID!, vehicleCount: Int!, averageSpeed: Float, notes: String): TrafficMeasurement!

    # Incidents
    createIncident(title: String!, description: String, type: IncidentType!, latitude: Float!, longitude: Float!, address: String): Incident!
    updateIncidentStatus(id: ID!, status: IncidentStatus!): Incident!
    removeIncident(id: ID!): Boolean!

    # Notifications
    sendNotification(title: String!, message: String!, type: NotificationType, recipientId: String!, relatedEntityId: String): Notification!
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead(recipientId: String!): Int!
    deleteNotification(id: ID!): Boolean!
  }
`;