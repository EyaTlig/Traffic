import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const DensityChart = ({ stats = { low: 0, medium: 0, high: 0 } }) => {
  const data = [
    { name: 'Trafic Fluide', value: stats.low, color: '#22c55e' },
    { name: 'Trafic Dense', value: stats.medium, color: '#eab308' },
    { name: 'Très Congestionné', value: stats.high, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const total = stats.low + stats.medium + stats.high;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Distribution du Trafic</h3>
      {total === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DensityChart;