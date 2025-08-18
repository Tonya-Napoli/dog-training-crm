// src/components/admin/TrainersTab.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../axios.js';

const TrainersTab = () => {
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTrainer, setExpandedTrainer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainersRes, clientsRes] = await Promise.all([
        axios.get('/auth/users/trainer'),
        axios.get('/auth/users/client')
      ]);
      
      setTrainers(trainersRes.data);
      setClients(clientsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const toggleTrainerActive = async (trainerId) => {
    try {
      const response = await axios.put(`/auth/user/${trainerId}/toggle-active`);
      setTrainers(trainers.map(trainer => 
        trainer._id === trainerId 
          ? { ...trainer, isActive: response.data.user.isActive }
          : trainer
      ));
      alert(response.data.message);
    } catch (err) {
      console.error('Error toggling trainer status:', err);
      alert('Failed to update trainer status');
    }
  };

  if (loading) return <div className="text-center py-4">Loading trainers...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Trainer Management</h2>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Specialties</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((trainer) => (
              <tr key={trainer._id} className="border-b">
                <td className="p-3">{trainer.firstName} {trainer.lastName}</td>
                <td className="p-3">{trainer.email}</td>
                <td className="p-3">
                  {trainer.specialties?.length > 0 
                    ? trainer.specialties.slice(0, 2).join(', ') 
                    : 'None specified'
                  }
                  {trainer.specialties?.length > 2 && '...'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trainer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trainer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleTrainerActive(trainer._id)}
                    className={`px-3 py-1 rounded text-sm ${
                      trainer.isActive 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {trainer.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainersTab;