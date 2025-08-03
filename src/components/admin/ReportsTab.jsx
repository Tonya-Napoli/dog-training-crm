import React, { useState } from 'react';
import { useReportsData } from '../../hooks/useReportsData';
import TimeFilter from './TimeFilter';
import StatsGrid from './StatsGrid';
import AvailableReports from './AvailableReports';

const ReportsTab = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const { stats, loading } = useReportsData(timeFilter);

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
        <StatsGrid stats={stats} timeFilter={timeFilter} />
        <AvailableReports />
      </div>
    </div>
  );
};

export default ReportsTab;