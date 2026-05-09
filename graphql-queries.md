# Requêtes GraphQL de test
# Endpoint : http://localhost:4000/graphql

# ════════════════ AUTH ════════════════

mutation Register {
  register(email: "admin@traffic.tn", username: "Admin", password: "Admin123!", role: ADMIN) {
    accessToken
    user { id email role }
  }
}

mutation Login {
  login(email: "admin@traffic.tn", password: "Admin123!") {
    accessToken
    user { id email role }
  }
}

# Header : Authorization: Bearer <token>
query Me {
  me { id email username role isActive }
}

# ════════════════ VÉHICULES ════════════════

mutation CreateVehicle {
  createVehicle(licensePlate: "TN-123-ABC", brand: "Renault", model: "Clio", type: CAR, driverName: "Mohamed") {
    id licensePlate brand model status
  }
}

query Vehicles {
  vehicles {
    id licensePlate brand model status
    positions { latitude longitude speed recordedAt }
  }
}

mutation RecordPosition {
  recordPosition(vehicleId: "<id>", latitude: 36.8189, longitude: 10.1658, speed: 50.5, address: "Av. Bourguiba") {
    id latitude longitude speed recordedAt
  }
}

query PositionHistory {
  positionHistory(vehicleId: "<id>", limit: 10) {
    latitude longitude speed recordedAt
  }
}

# ════════════════ TRAFIC ════════════════

mutation CreateZone {
  createTrafficZone(name: "Centre Tunis", centerLatitude: 36.8189, centerLongitude: 10.1658, radiusMeters: 500) {
    id name currentDensity
  }
}

mutation MeasureTraffic {
  measureTraffic(zoneId: "<id>", vehicleCount: 45, averageSpeed: 15.0) {
    id vehicleCount density measuredAt
  }
}

query CongestedZones {
  congestedZones { id name currentDensity }
}

query DensityStats {
  densityStats { low medium high }
}

# ════════════════ INCIDENTS ════════════════

mutation CreateIncident {
  createIncident(
    title: "Accident A1"
    type: ACCIDENT
    latitude: 36.85
    longitude: 10.19
    address: "Autoroute A1 km 12"
  ) {
    id title type status reportedBy createdAt
  }
}

query ActiveIncidents {
  activeIncidents { id title type status address createdAt }
}

mutation UpdateStatus {
  updateIncidentStatus(id: "<id>", status: IN_PROGRESS) {
    id status updatedAt
  }
}

mutation ResolveIncident {
  updateIncidentStatus(id: "<id>", status: RESOLVED) {
    id status resolvedAt
  }
}

# ════════════════ NOTIFICATIONS ════════════════

mutation SendNotif {
  sendNotification(
    title: "Congestion détectée"
    message: "Zone Centre Tunis : trafic élevé"
    type: CONGESTION
    recipientId: "<userId>"
  ) {
    id title isRead createdAt
  }
}

query MyNotifications {
  notifications(recipientId: "<userId>") {
    id title message isRead createdAt
  }
}

mutation MarkRead {
  markNotificationRead(id: "<id>") { id isRead readAt }
}

mutation MarkAllRead {
  markAllNotificationsRead(recipientId: "<userId>")
}

query UnreadCount {
  unreadNotificationsCount(recipientId: "<userId>")
}
