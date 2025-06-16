// src/components/ManageTrainers.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axios';

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get('/auth/users/trainer');
      setTrainers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setError('Failed to load trainers');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading trainers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Trainers</h2>
      {trainers.length === 0 ? (
        <p>No trainers found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer, index) => (
                <tr key={trainer._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3">{trainer.firstName} {trainer.lastName}</td>
                  <td className="p-3">{trainer.email}</td>
                  <td className="p-3">{trainer.phone || 'N/A'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
                  </td>
                  <td className="p-3">{new Date(trainer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageTrainers;