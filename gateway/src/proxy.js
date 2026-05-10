const axios = require('axios');

const SERVICES = {
  auth:         process.env.AUTH_URL         || 'http://auth-service:3001/graphql',
  vehicle:      process.env.VEHICLE_URL      || 'http://vehicle-service:3002/graphql',
  traffic:      process.env.TRAFFIC_URL      || 'http://traffic-service:3003/graphql',
  incident:     process.env.INCIDENT_URL     || 'http://incident-service:3004/graphql',
  notification: process.env.NOTIFICATION_URL || 'http://notification-service:3005/graphql',
};

async function forward(service, query, variables = {}, token = null) {
  const url = SERVICES[service];
  if (!url) {
    throw new Error(`Service ${service} not found`);
  }

  const headers = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = token;
  }

  console.log(`[Proxy] Forwarding to ${service}: ${url}`);
  console.log(`[Proxy] Query: ${query.substring(0, 100)}...`);

  try {
    const response = await axios({
      method: 'post',
      url: url,
      data: { query, variables },
      headers: headers,
      timeout: 30000,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });

    if (response.data.errors) {
      console.error(`[Proxy] GraphQL errors from ${service}:`, response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  } catch (err) {
    console.error(`[Proxy] Error calling ${service}:`, err.message);
    if (err.response) {
      console.error(`[Proxy] Response status: ${err.response.status}`);
      console.error(`[Proxy] Response data:`, err.response.data);
    }
    throw new Error(`Service ${service} unavailable: ${err.message}`);
  }
}

module.exports = { forward };