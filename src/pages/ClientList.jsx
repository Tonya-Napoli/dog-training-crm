import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import { useAuth } from '../contexts/AuthContext';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let response;
        if (user.role === 'admin') {
          // Admin sees all clients
          response = await axios.get('/auth/users/client');
        } else if (user.role === 'trainer') {
          // Trainer sees only their assigned clients
          response = await axios.get(`/auth/trainer/${user.id}/clients`);
        }
        
        setClients(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
        setLoading(false);
      }
    };

    if (user) {
      fetchClients();
    }
  }, [user]);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!clients.length) return <div>No clients found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <ul className="space-y-2">
        {clients.map(client => (
          <li key={client._id} className="border p-3 rounded">
            <Link to={`/client/${client._id}`} className="text-blue-600 hover:underline">
              {client.firstName} {client.lastName}
            </Link>
            {/* You'll need to fetch dogs separately or populate them */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientList;
