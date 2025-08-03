import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TabNavigation from '../components/admin/TabNavigation';
import ContactsTab from '../components/admin/ContactsTab';
import ClientsTab from '../components/admin/ClientsTab';
import TrainersTab from '../components/admin/TrainersTab';
import ReportsTab from '../components/admin/ReportsTab';
import BillingTab from '../components/admin/BillingTab';
import { ADMIN_TABS } from '../constants/adminConstants';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(ADMIN_TABS.CONTACTS);

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <TabContent activeTab={activeTab} />
    </div>
  );
};

const TabContent = ({ activeTab }) => {
  const tabComponents = {
    [ADMIN_TABS.CONTACTS]: ContactsTab,
    [ADMIN_TABS.CLIENTS]: ClientsTab,
    [ADMIN_TABS.TRAINERS]: TrainersTab,
    [ADMIN_TABS.REPORTS]: ReportsTab,
    [ADMIN_TABS.BILLING]: BillingTab,
  };

  const Component = tabComponents[activeTab];
  return Component ? <Component /> : null;
};

export default DashboardAdmin;