const axios = require('axios');

const SERVICES = {
  auth:         process.env.AUTH_URL         || 'http://localhost:3001/graphql',
  vehicle:      process.env.VEHICLE_URL      || 'http://localhost:3002/graphql',
  traffic:      process.env.TRAFFIC_URL      || 'http://localhost:3003/graphql',
  incident:     process.env.INCIDENT_URL     || 'http://localhost:3004/graphql',
  notification: process.env.NOTIFICATION_URL || 'http://localhost:3005/graphql',
};

async function forward(service, query, variables = {}, token = null) {
  const url = SERVICES[service];
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = token;

  try {
    const { data } = await axios.post(url, { query, variables }, { headers });
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data;
  } catch (err) {
    if (err.message) throw new Error(err.message);
    throw new Error(`Service ${service} unavailable`);
  }
}

module.exports = { forward };
