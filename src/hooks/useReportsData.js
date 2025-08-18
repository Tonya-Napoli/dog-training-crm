// src/components/admin/ReportsTab.jsx
import React, { useState } from 'react';
import AvailableReports from './AvailableReports.jsx';
import { useReportsData } from '../../hooks/useReportsData.js';

const ReportsTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1month');
  const { stats, loading, refetch } = useReportsData(selectedPeriod);

  if (loading) {
    return <div className="text-center py-4">Loading reports...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
        <button
          onClick={refetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Data
        </button>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report Period:
        </label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="1week">Last Week</option>
          <option value="1month">Last Month</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Total Clients</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalClients}</p>
          <p className="text-sm text-gray-600">In selected period</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Active Trainers</h3>
          <p className="text-2xl font-bold text-green-600">{stats.activeTrainers}</p>
          <p className="text-sm text-gray-600">In selected period</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900">New Inquiries</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.newInquiries}</p>
          <p className="text-sm text-gray-600">Awaiting response</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">Total Inquiries</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalInquiries}</p>
          <p className="text-sm text-gray-600">In selected period</p>
        </div>
      </div>

      {/* Period Summary */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Summary for {selectedPeriod === 'today' ? 'Today' : 
                      selectedPeriod === '1week' ? 'Last Week' : 
                      selectedPeriod === '1month' ? 'Last Month' : 
                      selectedPeriod === '6months' ? 'Last 6 Months' : 
                      selectedPeriod === '1year' ? 'Last Year' : 'All Time'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-blue-800">Client Growth</h4>
            <p className="text-2xl font-bold text-blue-600">{stats.totalClients}</p>
            <p className="text-sm text-gray-600">New clients registered</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-green-800">Trainer Activity</h4>
            <p className="text-2xl font-bold text-green-600">{stats.activeTrainers}</p>
            <p className="text-sm text-gray-600">Active trainers</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-yellow-800">Conversion Rate</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.totalInquiries > 0 
                ? Math.round((stats.totalClients / stats.totalInquiries) * 100) 
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Inquiries to clients</p>
          </div>
        </div>
      </div>

      <AvailableReports />
    </div>
  );
};

export default ReportsTab;