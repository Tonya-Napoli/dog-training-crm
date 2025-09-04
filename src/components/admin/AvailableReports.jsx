// src/components/admin/AvailableReports.jsx
import React, { useState } from 'react';
import { generateClientGrowthReport } from '../../services/ReportService';
import { showSuccessNotification, showErrorNotification } from '../../utils/notifications';

// Constants - Clean Code: Avoid magic strings
const REPORT_STATUS = {
  AVAILABLE: 'Available',
  COMING_SOON: 'Coming Soon'
};

const REPORT_TYPES = {
  CLIENT_GROWTH: 'Client Growth Report',
  TRAINER_PERFORMANCE: 'Trainer Performance Report',
  REVENUE_ANALYSIS: 'Revenue Analysis',
  TRAINING_PROGRESS: 'Training Progress Summary'
};

const AvailableReports = () => {
  const [loadingStates, setLoadingStates] = useState({});

  // Clean Code: Extract report configuration to separate concern
  const getReportConfiguration = () => [
    { 
      name: REPORT_TYPES.CLIENT_GROWTH,
      description: 'Track client acquisition over time',
      status: REPORT_STATUS.AVAILABLE,
      handler: handleGenerateClientGrowthReport
    },
    { 
      name: REPORT_TYPES.TRAINER_PERFORMANCE,
      description: 'Analyze trainer effectiveness and metrics',
      status: REPORT_STATUS.COMING_SOON,
      handler: null
    },
    { 
      name: REPORT_TYPES.REVENUE_ANALYSIS,
      description: 'Financial performance and revenue trends',
      status: REPORT_STATUS.COMING_SOON,
      handler: null
    },
    { 
      name: REPORT_TYPES.TRAINING_PROGRESS,
      description: 'Overall training program effectiveness',
      status: REPORT_STATUS.COMING_SOON,
      handler: null
    }
  ];

  // Clean Code: Single Responsibility - Handle report generation
  const handleGenerateClientGrowthReport = async () => {
    const reportType = REPORT_TYPES.CLIENT_GROWTH;
    
    setLoadingStates(prev => ({ ...prev, [reportType]: true }));
    
    try {
      const reportData = await generateClientGrowthReport();
      downloadReport(reportData, 'client-growth-report.pdf');
      showSuccessNotification('Client Growth Report generated successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
      showErrorNotification('Failed to generate report. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [reportType]: false }));
    }
  };

  // Clean Code: Extract utility function
  const downloadReport = (data, filename) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Clean Code: Extract styling logic
  const getStatusBadgeStyles = (status) => {
    const baseClasses = 'px-2 py-1 rounded text-xs';
    const statusClasses = status === REPORT_STATUS.AVAILABLE 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-600';
    
    return `${baseClasses} ${statusClasses}`;
  };

  const getButtonStyles = (status, isLoading = false) => {
    const baseClasses = 'text-sm px-4 py-2 rounded transition-colors duration-200';
    
    if (status === REPORT_STATUS.AVAILABLE && !isLoading) {
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 cursor-pointer`;
    }
    
    return `${baseClasses} text-gray-400 cursor-not-allowed bg-gray-200`;
  };

  const reports = getReportConfiguration();

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold mb-4 text-gray-800">Available Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, index) => {
          const isLoading = loadingStates[report.name];
          const isAvailable = report.status === REPORT_STATUS.AVAILABLE;
          
          return (
            <ReportCard
              key={index}
              report={report}
              isLoading={isLoading}
              isAvailable={isAvailable}
              onGenerateReport={report.handler}
              statusBadgeStyles={getStatusBadgeStyles(report.status)}
              buttonStyles={getButtonStyles(report.status, isLoading)}
            />
          );
        })}
      </div>
    </div>
  );
};

// Clean Code: Extract component for single responsibility
const ReportCard = ({ 
  report, 
  isLoading, 
  isAvailable, 
  onGenerateReport, 
  statusBadgeStyles, 
  buttonStyles 
}) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-medium text-gray-800">{report.name}</h4>
      <span className={statusBadgeStyles}>
        {report.status}
      </span>
    </div>
    <p className="text-gray-600 text-sm mb-3">{report.description}</p>
    <button 
      className={buttonStyles}
      disabled={!isAvailable || isLoading}
      onClick={isAvailable ? onGenerateReport : undefined}
      type="button"
    >
      {isLoading ? 'Generating...' : 
       isAvailable ? 'Generate Report' : 'Coming Soon'}
    </button>
  </div>
);

export default AvailableReports;