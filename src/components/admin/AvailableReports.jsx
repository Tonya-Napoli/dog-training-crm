import React from 'react';

const AvailableReports = () => {
  const reports = [
    { 
      name: 'Client Growth Report', 
      description: 'Track client acquisition over time',
      status: 'Available'
    },
    { 
      name: 'Trainer Performance Report', 
      description: 'Analyze trainer effectiveness and metrics',
      status: 'Coming Soon'
    },
    { 
      name: 'Revenue Analysis', 
      description: 'Financial performance and revenue trends',
      status: 'Coming Soon'
    },
    { 
      name: 'Training Progress Summary', 
      description: 'Overall training program effectiveness',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold mb-4 text-gray-800">Available Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800">{report.name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                report.status === 'Available' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {report.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{report.description}</p>
            <button 
              className={`text-sm ${
                report.status === 'Available'
                  ? 'text-blue-600 hover:text-blue-800 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={report.status !== 'Available'}
            >
              {report.status === 'Available' ? 'Generate Report' : 'Coming Soon'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableReports;