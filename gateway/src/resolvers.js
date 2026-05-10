const { forward } = require('./proxy');

const tok = (ctx) => ctx?.req?.headers?.authorization || null;

module.exports = {
  Query: {
    // Auth
    me: async (_, __, ctx) => {
      const d = await forward('auth', `query { me { id email username role isActive createdAt } }`, {}, tok(ctx));
      return d?.me || null;
    },
    users: async (_, __, ctx) => {
      const d = await forward('auth', `query { users { id email username role isActive createdAt } }`, {}, tok(ctx));
      return d?.users || [];
    },

    // Vehicles - SANS updatedAt
    vehicles: async (_, __, ctx) => {
      const d = await forward('vehicle', `query { vehicles { id licensePlate brand model type status driverName createdAt positions { id latitude longitude speed address recordedAt } } }`, {}, tok(ctx));
      return d?.vehicles || [];
    },
    vehicle: async (_, { id }, ctx) => {
      const d = await forward('vehicle', `query($id:ID!) { vehicle(id:$id) { id licensePlate brand model type status driverName createdAt positions { id latitude longitude speed address recordedAt } } }`, { id }, tok(ctx));
      return d?.vehicle || null;
    },
    positionHistory: async (_, { vehicleId, limit }, ctx) => {
      const d = await forward('vehicle', `query($vehicleId:ID!, $limit:Int) { positionHistory(vehicleId:$vehicleId, limit:$limit) { id vehicleId latitude longitude speed address recordedAt } }`, { vehicleId, limit }, tok(ctx));
      return d?.positionHistory || [];
    },
    lastPosition: async (_, { vehicleId }, ctx) => {
      const d = await forward('vehicle', `query($vehicleId:ID!) { lastPosition(vehicleId:$vehicleId) { id vehicleId latitude longitude speed address recordedAt } }`, { vehicleId }, tok(ctx));
      return d?.lastPosition || null;
    },

    // Traffic
    trafficZones: async (_, __, ctx) => {
      const d = await forward('traffic', `query { trafficZones { id name description centerLatitude centerLongitude radiusMeters currentDensity isActive createdAt } }`, {}, tok(ctx));
      return d?.trafficZones || [];
    },
    trafficZone: async (_, { id }, ctx) => {
      const d = await forward('traffic', `query($id:ID!) { trafficZone(id:$id) { id name description centerLatitude centerLongitude radiusMeters currentDensity isActive createdAt } }`, { id }, tok(ctx));
      return d?.trafficZone || null;
    },
    congestedZones: async (_, __, ctx) => {
      const d = await forward('traffic', `query { congestedZones { id name centerLatitude centerLongitude currentDensity } }`, {}, tok(ctx));
      return d?.congestedZones || [];
    },
    zoneMeasurements: async (_, { zoneId, limit }, ctx) => {
      const d = await forward('traffic', `query($zoneId:ID!, $limit:Int) { zoneMeasurements(zoneId:$zoneId, limit:$limit) { id zoneId vehicleCount averageSpeed density measuredAt } }`, { zoneId, limit }, tok(ctx));
      return d?.zoneMeasurements || [];
    },
    densityStats: async (_, __, ctx) => {
      const d = await forward('traffic', `query { densityStats { low medium high } }`, {}, tok(ctx));
      return d?.densityStats || { low: 0, medium: 0, high: 0 };
    },

    // Incidents
    incidents: async (_, { type, status }, ctx) => {
      const d = await forward('incident', `query($type:IncidentType, $status:IncidentStatus) { incidents(type:$type, status:$status) { id title description type status latitude longitude address reportedBy resolvedAt createdAt } }`, { type, status }, tok(ctx));
      return d?.incidents || [];
    },
    incident: async (_, { id }, ctx) => {
      const d = await forward('incident', `query($id:ID!) { incident(id:$id) { id title description type status latitude longitude address reportedBy resolvedAt createdAt } }`, { id }, tok(ctx));
      return d?.incident || null;
    },
    activeIncidents: async (_, __, ctx) => {
      const d = await forward('incident', `query { activeIncidents { id title type status latitude longitude address createdAt } }`, {}, tok(ctx));
      return d?.activeIncidents || [];
    },

    // Notifications
    notifications: async (_, { recipientId }, ctx) => {
      const d = await forward('notification', `query($recipientId:String) { notifications(recipientId:$recipientId) { id title message type recipientId isRead relatedEntityId readAt createdAt } }`, { recipientId }, tok(ctx));
      return d?.notifications || [];
    },
    notification: async (_, { id }, ctx) => {
      const d = await forward('notification', `query($id:ID!) { notification(id:$id) { id title message type recipientId isRead readAt createdAt } }`, { id }, tok(ctx));
      return d?.notification || null;
    },
    unreadNotificationsCount: async (_, { recipientId }, ctx) => {
      const d = await forward('notification', `query($recipientId:String!) { unreadNotificationsCount(recipientId:$recipientId) }`, { recipientId }, tok(ctx));
      return d?.unreadNotificationsCount || 0;
    },
  },

  Mutation: {
    // Auth
    register: async (_, args) => {
      const d = await forward('auth', `mutation($email:String!,$username:String!,$password:String!,$role:UserRole) { register(email:$email, username:$username, password:$password, role:$role) { accessToken user { id email username role isActive createdAt } } }`, args);
      return d?.register;
    },
    login: async (_, args) => {
      const d = await forward('auth', `mutation($email:String!,$password:String!) { login(email:$email, password:$password) { accessToken user { id email username role isActive createdAt } } }`, args);
      return d?.login;
    },

    // Vehicles
    createVehicle: async (_, args, ctx) => {
      const d = await forward('vehicle', `mutation($licensePlate:String!,$brand:String!,$model:String!,$type:VehicleType,$driverName:String) { createVehicle(licensePlate:$licensePlate, brand:$brand, model:$model, type:$type, driverName:$driverName) { id licensePlate brand model type status driverName createdAt } }`, args, tok(ctx));
      return d?.createVehicle;
    },
    updateVehicle: async (_, args, ctx) => {
      const d = await forward('vehicle', `mutation($id:ID!,$licensePlate:String,$brand:String,$model:String,$type:VehicleType,$status:VehicleStatus,$driverName:String) { updateVehicle(id:$id, licensePlate:$licensePlate, brand:$brand, model:$model, type:$type, status:$status, driverName:$driverName) { id licensePlate brand model type status driverName createdAt } }`, args, tok(ctx));
      return d?.updateVehicle;
    },
    removeVehicle: async (_, { id }, ctx) => {
      const d = await forward('vehicle', `mutation($id:ID!) { removeVehicle(id:$id) }`, { id }, tok(ctx));
      return d?.removeVehicle || false;
    },
    recordPosition: async (_, args, ctx) => {
      const d = await forward('vehicle', `mutation($vehicleId:ID!,$latitude:Float!,$longitude:Float!,$speed:Float,$address:String) { recordPosition(vehicleId:$vehicleId, latitude:$latitude, longitude:$longitude, speed:$speed, address:$address) { id vehicleId latitude longitude speed address recordedAt } }`, args, tok(ctx));
      return d?.recordPosition;
    },

    // Traffic
    createTrafficZone: async (_, args, ctx) => {
      const d = await forward('traffic', `mutation($name:String!,$description:String,$centerLatitude:Float!,$centerLongitude:Float!,$radiusMeters:Float!) { createTrafficZone(name:$name, description:$description, centerLatitude:$centerLatitude, centerLongitude:$centerLongitude, radiusMeters:$radiusMeters) { id name description centerLatitude centerLongitude radiusMeters currentDensity isActive createdAt } }`, args, tok(ctx));
      return d?.createTrafficZone;
    },
    updateTrafficZone: async (_, args, ctx) => {
      const d = await forward('traffic', `mutation($id:ID!,$name:String,$description:String,$isActive:Boolean) { updateTrafficZone(id:$id, name:$name, description:$description, isActive:$isActive) { id name currentDensity isActive createdAt } }`, args, tok(ctx));
      return d?.updateTrafficZone;
    },
    measureTraffic: async (_, args, ctx) => {
      const d = await forward('traffic', `mutation($zoneId:ID!,$vehicleCount:Int!,$averageSpeed:Float,$notes:String) { measureTraffic(zoneId:$zoneId, vehicleCount:$vehicleCount, averageSpeed:$averageSpeed, notes:$notes) { id zoneId vehicleCount averageSpeed density measuredAt } }`, args, tok(ctx));
      return d?.measureTraffic;
    },

    // Incidents
    createIncident: async (_, args, ctx) => {
      const d = await forward('incident', `mutation($title:String!,$description:String,$type:IncidentType!,$latitude:Float!,$longitude:Float!,$address:String) { createIncident(title:$title, description:$description, type:$type, latitude:$latitude, longitude:$longitude, address:$address) { id title type status latitude longitude address reportedBy createdAt } }`, args, tok(ctx));
      return d?.createIncident;
    },
    updateIncidentStatus: async (_, args, ctx) => {
      const d = await forward('incident', `mutation($id:ID!,$status:IncidentStatus!) { updateIncidentStatus(id:$id, status:$status) { id title status resolvedAt createdAt } }`, args, tok(ctx));
      return d?.updateIncidentStatus;
    },
    removeIncident: async (_, { id }, ctx) => {
      const d = await forward('incident', `mutation($id:ID!) { removeIncident(id:$id) }`, { id }, tok(ctx));
      return d?.removeIncident || false;
    },

    // Notifications
    sendNotification: async (_, args, ctx) => {
      const d = await forward('notification', `mutation($title:String!,$message:String!,$type:NotificationType,$recipientId:String!,$relatedEntityId:String) { sendNotification(title:$title, message:$message, type:$type, recipientId:$recipientId, relatedEntityId:$relatedEntityId) { id title message type recipientId isRead createdAt } }`, args, tok(ctx));
      return d?.sendNotification;
    },
    markNotificationRead: async (_, { id }, ctx) => {
      const d = await forward('notification', `mutation($id:ID!) { markNotificationRead(id:$id) { id isRead readAt } }`, { id }, tok(ctx));
      return d?.markNotificationRead;
    },
    markAllNotificationsRead: async (_, { recipientId }, ctx) => {
      const d = await forward('notification', `mutation($recipientId:String!) { markAllNotificationsRead(recipientId:$recipientId) }`, { recipientId }, tok(ctx));
      return d?.markAllNotificationsRead || 0;
    },
    deleteNotification: async (_, { id }, ctx) => {
      const d = await forward('notification', `mutation($id:ID!) { deleteNotification(id:$id) }`, { id }, tok(ctx));
      return d?.deleteNotification || false;
    },
  },
};