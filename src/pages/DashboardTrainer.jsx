import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardBase from '../components/DashboardBase';
import axios from '../axios';

const DashboardTrainer = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clientCount: 0,
    todaySessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        // Fetch trainer's clients
        const clientsResponse = await axios.get(`/auth/trainer/${user.id}/clients`);
        
        // You would also fetch sessions here once you have that endpoint
        
        setStats({
          clientCount: clientsResponse.data.length,
          todaySessions: 0 // Update when you have sessions endpoint
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trainer data:', err);
        setLoading(false);
      }
    };

    if (user) {
      fetchTrainerData();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardBase role="trainer">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-heading font-bold mb-2">My Clients</h2>
          <p className="text-neutral">You are assigned to {stats.clientCount} clients.</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-heading font-bold mb-2">Today's Sessions</h2>
          <p className="text-neutral">You have {stats.todaySessions} training sessions today.</p>
        </div>
      </div>
    </DashboardBase>
  );
};

export default DashboardTrainer;

