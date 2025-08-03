// src/components/admin/TabNavigation.jsx
import React from 'react';
import { ADMIN_TABS } from '../../constants/adminConstants';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: ADMIN_TABS.CONTACTS, label: 'Contact Inquiries' },
    { key: ADMIN_TABS.CLIENTS, label: 'Client Management' },
    { key: ADMIN_TABS.TRAINERS, label: 'Trainer Management' },
    { key: ADMIN_TABS.BILLING, label: 'Billing' },
    { key: ADMIN_TABS.REPORTS, label: 'Reports' }
  ];

  return (
    <div className="flex space-x-1 mb-6 border-b overflow-x-auto">
      {tabs.map(tab => (
        <TabButton
          key={tab.key}
          isActive={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          label={tab.label}
        />
      ))}
    </div>
  );
};

const TabButton = ({ isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold whitespace-nowrap ${
      isActive 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-600 hover:text-blue-600'
    }`}
  >
    {label}
  </button>
);

export default TabNavigation;