import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardBase from '../components/DashboardBase';

const DashboardTrainer = () => {
  const { user } = useAuth();

  return (
    <DashboardBase role="trainer">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-heading font-bold mb-2">My Clients</h2>
          <p className="text-neutral">You are assigned to 5 clients.</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-heading font-bold mb-2">Today’s Sessions</h2>
          <p className="text-neutral">You have 3 training sessions today.</p>
        </div>
      </div>
    </DashboardBase>
  );
};

export default DashboardTrainer;

