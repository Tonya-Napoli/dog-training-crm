import React, { useState, useEffect } from 'react';
import axios from '../../axios.js';
import ManualClientForm from '../forms/ManualClientForm.jsx';

const ClientsTab = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/users/client');
      setClients(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-4">Loading clients...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Client Management</h2>
        <button
          onClick={() => setShowAddClient(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Client
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client._id} className="border-b">
                <td className="p-3">{client.firstName} {client.lastName}</td>
                <td className="p-3">{client.email}</td>
                <td className="p-3">{client.phoneNumber || 'N/A'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowClientDetails(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Add New Client</h3>
            <ManualClientForm
              onSuccess={() => {
                setShowAddClient(false);
                fetchClients();
              }}
              onCancel={() => setShowAddClient(false)}
            />
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Client Details</h3>
              <button
                onClick={() => setShowClientDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-semibold">Name:</label>
                <p>{selectedClient.firstName} {selectedClient.lastName}</p>
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <p>{selectedClient.email}</p>
              </div>
              <div>
                <label className="font-semibold">Phone:</label>
                <p>{selectedClient.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <p>{selectedClient.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsTab;