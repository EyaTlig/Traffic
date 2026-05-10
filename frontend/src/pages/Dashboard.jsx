import React from 'react';
import { useQuery, gql } from '@apollo/client';
import StatsCards from '../components/Dashboard/StatsCards';
import RecentIncidents from '../components/Dashboard/RecentIncidents';
import TrafficMap from '../components/Dashboard/TrafficMap';
import DensityChart from '../components/Dashboard/DensityChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const DASHBOARD_QUERY = gql`
  query DashboardData {
    activeIncidents {
      id
      title
      type
      status
      latitude
      longitude
      address
      createdAt
    }
    congestedZones {
      id
      name
      currentDensity
      centerLatitude
      centerLongitude
    }
    densityStats {
      low
      medium
      high
    }
  }
`;

const Dashboard = () => {
  const { loading, error, data } = useQuery(DASHBOARD_QUERY);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble du trafic urbain</p>
      </div>

      <StatsCards stats={data?.densityStats} incidentCount={data?.activeIncidents?.length} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficMap incidents={data?.activeIncidents} zones={data?.congestedZones} />
        <DensityChart stats={data?.densityStats} />
      </div>
      
      <RecentIncidents incidents={data?.activeIncidents?.slice(0, 5)} />
    </div>
  );
};

export default Dashboard;