// src/components/admin/TimeFilter.jsx
import React from 'react';
import { TIME_PERIODS } from '../../constants/adminConstants';

const TimeFilter = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Time Period
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {TIME_PERIODS.map(period => (
        <option key={period.value} value={period.value}>
          {period.label}
        </option>
      ))}
    </select>
  </div>
);

export default TimeFilter;