import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';
import ManageTrainers from '../components/admin/ManageTrainers';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Contact state
  const [contacts, setContacts] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else if (activeTab === 'trainers') {
      fetchTrainers();
    } else if (activeTab === 'clients') {
      fetchClients();
    }
  }, [activeTab, page, search, statusFilter]);

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, perPage });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const response = await axios.get(`/contacts?${params.toString()}`);
      setContacts(response.data.contacts);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to load contacts.');
    }
    setLoading(false);
  };

  // Fetch trainers
  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/auth/users/trainer');
      setTrainers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setError('Failed to load trainers.');
    }
    setLoading(false);
  };

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/auth/users/client');
      setClients(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients.');
    }
    setLoading(false);
  };

  // Update contact status
  const handleStatusChange = async (id, status) => {
    try {
      const response = await axios.put(`/contacts/${id}/status`, { status });
      setContacts(
        contacts.map((contact) =>
          contact._id === id ? response.data : contact
        )
      );
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // Update follow-up notes (debounced)
  const handleNotesChange = debounce(async (id, notes) => {
    try {
      const response = await axios.put(`/contacts/${id}/notes`, {
        followUpNotes: notes,
      });
      setContacts(
        contacts.map((contact) =>
          contact._id === id ? response.data : contact
        )
      );
    } catch (err) {
      setError('Failed to update notes.');
    }
  }, 500);

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'contacts' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Inquiries
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'trainers' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('trainers')}
        >
          Manage Trainers
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'clients' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('clients')}
        >
          Manage Clients
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'billing' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('billing')}
        >
          Billing & Payments
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="text-center py-4">Loading...</div>}

      {/* Tab Content */}
      {!loading && (
        <>
          {/* Contact Inquiries Tab */}
          {activeTab === 'contacts' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Inquiries</h2>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              {/* Contacts Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold">Name</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Phone</th>
                      <th className="p-3 text-left font-semibold">Message</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                      <th className="p-3 text-left font-semibold">Follow-Up Notes</th>
                      <th className="p-3 text-left font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, index) => (
                      <tr
                        key={contact._id}
                        className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                      >
                        <td className="p-3">{contact.name}</td>
                        <td className="p-3">{contact.email}</td>
                        <td className="p-3">{contact.phone || 'N/A'}</td>
                        <td className="p-3">{contact.message}</td>
                        <td className="p-3">
                          <select
                            value={contact.status}
                            onChange={(e) =>
                              handleStatusChange(contact._id, e.target.value)
                            }
                            className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <textarea
                            value={contact.followUpNotes || ''}
                            onChange={(e) =>
                              handleNotesChange(contact._id, e.target.value)
                            }
                            placeholder="Add follow-up notes..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          />
                        </td>
                        <td className="p-3">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {Math.ceil(total / perPage)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / perPage)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Manage Trainers Tab */}
            {activeTab === 'trainers' && (
              <ManageTrainers />
          )}

          {/* Manage Clients Tab */}
          {activeTab === 'clients' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Manage Clients</h2>
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
                          <td className="p-3">{new Date(client.created).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Billing & Payments Tab */}
          {activeTab === 'billing' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
              <p className="text-gray-600">Billing functionality coming soon...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;