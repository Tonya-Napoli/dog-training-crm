// src/components/ManageClients.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axios';

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/auth/users/client');
      setClients(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Clients</h2>
      {clients.length === 0 ? (
        <p>No clients found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Assigned Trainer</th>
                <th className="p-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={client._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3">{client.firstName} {client.lastName}</td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.phone || 'N/A'}</td>
                  <td className="p-3">{client.trainer ? 'Assigned' : 'Unassigned'}</td>
                  <td className="p-3">{new Date(client.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageClients;