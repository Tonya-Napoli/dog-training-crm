// src/pages/DashboardAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';
import ManualClientForm from '../components/forms/ManualClientForm';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Contact Inquiries State
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  // Client Management State
  const [showAddClient, setShowAddClient] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientsLoading, setClientsLoading] = useState(false);

  // Fetch contacts - defined inside useEffect since it's not used elsewhere
  useEffect(() => {
    const fetchContacts = async () => {
      if (activeTab !== 'contacts') return;
      
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, perPage });
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        const response = await axios.get(`/contacts?${params.toString()}`);
        setContacts(response.data.contacts);
        setTotal(response.data.total);
        setLoading(false);
      } catch (err) {
        setError('Failed to load contacts.');
        setLoading(false);
      }
    };

    fetchContacts();
  }, [page, search, statusFilter, activeTab, perPage]);

  // Fetch clients - using useCallback because it's called from ManualClientForm
  const fetchClients = useCallback(async () => {
    if (activeTab !== 'clients') return;
    
    try {
      setClientsLoading(true);
      const response = await axios.get(`/auth/clients?search=${clientSearch}`);
      setClients(response.data.clients || []);
      setClientsLoading(false);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      setClientsLoading(false);
    }
  }, [clientSearch, activeTab]);

  // useEffect for fetching clients
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  // Generate temporary password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'contacts' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Contact Inquiries
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'clients' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Client Management
        </button>
        <button
          onClick={() => setActiveTab('trainers')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'trainers' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Trainer Management
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'billing' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Billing
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'reports' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'contacts' ? (
        // Contact Inquiries Tab
        <div className="mb-6">
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

          {/* Loading and Error States */}
          {loading && <div className="text-center py-4">Loading...</div>}
          {error && <div className="text-center text-red-500 py-4">{error}</div>}
          
          {/* Contacts Table */}
          {!loading && !error && (
            <>
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
                        <td className="p-3">
                          <div className="max-w-xs overflow-hidden text-ellipsis">
                            {contact.message}
                          </div>
                        </td>
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
                            rows="2"
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
            </>
          )}
        </div>
      ) : activeTab === 'clients' ? (
        // Client Management Tab
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Client Management</h2>
            <button
              onClick={() => setShowAddClient(!showAddClient)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {showAddClient ? 'Cancel' : '+ Add New Client'}
            </button>
          </div>

          {/* Manual Client Registration Form */}
          {showAddClient && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Manual Client Registration</h3>
              <p className="text-gray-600 mb-4">
                Use this form to manually register clients who cannot self-register online 
                (phone registrations, walk-ins, etc.)
              </p>
              <ManualClientForm 
                generateTempPassword={generateTempPassword}
                onSuccess={() => {
                  setShowAddClient(false);
                  fetchClients();
                }}
              />
            </div>
          )}

          {/* Client Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clients List */}
          {clientsLoading ? (
            <div className="text-center py-8">Loading clients...</div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {clients.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold">Name</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Phone</th>
                      <th className="p-3 text-left font-semibold">Registered</th>
                      <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, index) => (
                      <tr key={client._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3">{`${client.firstName} ${client.lastName}`}</td>
                        <td className="p-3">{client.email}</td>
                        <td className="p-3">{client.phone || 'N/A'}</td>
                        <td className="p-3">{new Date(client.created).toLocaleDateString()}</td>
                        <td className="p-3">
                          <button className="text-blue-600 hover:underline text-sm">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {clientSearch ? 'No clients found matching your search.' : 'No clients registered yet.'}
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'trainers' ? (
        // Trainer Management Tab
        <div>
          <h2 className="text-2xl font-semibold mb-4">Trainer Management</h2>
          <p className="text-gray-600">Trainer management features coming soon...</p>
        </div>
      ) : activeTab === 'billing' ? (
        // Billing Tab
        <div>
          <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
          <p className="text-gray-600">Billing features coming soon...</p>
        </div>
      ) : activeTab === 'reports' ? (
        // Reports Tab
        <div>
          <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
          <p className="text-gray-600">Reporting features coming soon...</p>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardAdmin;