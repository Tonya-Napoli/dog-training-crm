import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import trainingData from '../mocks/TrainingDataMock';
const DashboardAdmin = () => {
    const { user } = useAuth();

return (
    <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
    <div className="dashboard-section">
        <h2>My Clients</h2>
        </div>
        </div>
)
}

export default DashboardAdmin;