// src/components/admin/StatsGrid.jsx
import React from 'react';
import StatsCard from './StatsCard';

const StatsGrid = ({ stats, timeFilter }) => {
  const statsConfig = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      color: 'blue',
      subtitle: timeFilter === 'all' ? 'All time' : 'In selected period'
    },
    {
      title: 'Active Trainers', 
      value: stats.activeTrainers,
      color: 'green',
      subtitle: timeFilter === 'all' ? 'Currently active' : 'Joined in period'
    },
    {
      title: 'New Inquiries',
      value: stats.newInquiries, 
      color: 'yellow',
      subtitle: 'Status: New'
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      color: 'purple', 
      subtitle: 'All statuses'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsConfig.map(config => (
        <StatsCard key={config.title} {...config} />
      ))}
    </div>
  );
};

export default StatsGrid;