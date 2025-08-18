// src/components/admin/AvailableReports.jsx
import React from 'react';

const AvailableReports = () => {
  const reports = [
    { name: 'Client Growth Report', description: 'Track client acquisition over time' },
    { name: 'Trainer Performance Report', description: 'Analyze trainer effectiveness and metrics' },
    { name: 'Revenue Analysis', description: 'Financial performance and revenue trends' },
    { name: 'Training Progress Summary', description: 'Overall training program effectiveness' }
  ];

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Available Reports</h3>
        <ul className="space-y-2">
          {reports.map((report, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium text-gray-800">{report.name}</span>
              <p className="text-gray-600 text-xs">{report.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AvailableReports;