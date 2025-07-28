import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';
import ManualClientForm from '../components/forms/ManualClientForm';
import { ClientDetailsModal, AssignClientsModal } from '../components/modals';
import ManageTrainers from '../components/admin/ManageTrainers';

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
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  // Trainer Management State
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showAssignClients, setShowAssignClients] = useState(false);

  // =====================
  // DATA FETCHING
  // =====================

  // Fetch contacts when tab is 'contacts' and dependencies change
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

  // Fetch trainers
  const fetchTrainers = async () => {
    try {
      setTrainersLoading(true);
      const response = await axios.get('/auth/trainers');
      setTrainers(response.data.trainers || []);
      setTrainersLoading(false);
    } catch (err) {
      console.error('Failed to fetch trainers:', err);
      setTrainersLoading(false);
    }
  };

  // useEffect for fetching clients
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // useEffect for fetching trainers
  useEffect(() => {
    if (activeTab === 'trainers') {
      fetchTrainers();
    }
  }, [activeTab]);

  // =====================
  // EVENT HANDLERS
  // =====================

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

  // Assign clients to trainer
  const assignClientsToTrainer = async (clientIds) => {
    if (!selectedTrainer) return;
    
    try {
      await axios.put(`/auth/trainer/${selectedTrainer._id}/assign-clients`, {
        clientIds
      });
      
      alert('Clients assigned successfully!');
      setShowAssignClients(false);
      setSelectedTrainer(null);
      
      // Refresh data
      if (activeTab === 'trainers') {
        fetchTrainers();
      }
      if (activeTab === 'clients') {
        fetchClients();
      }
    } catch (err) {
      console.error('Failed to assign clients:', err);
      alert('Failed to assign clients');
    }
  };

  // Handle opening assign clients modal
  const handleOpenAssignClients = (trainer) => {
    setSelectedTrainer(trainer);
    setShowAssignClients(true);
  };

  // Handle opening client details modal
  const handleViewClientDetails = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  // Authorization check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // =====================
  // RENDER FUNCTIONS
  // =====================

  const renderContactsTab = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Contact Inquiries</h2>
      
      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Contacts List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Phone</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                  <th className="p-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3">{contact.name}</td>
                    <td className="p-3">{contact.email}</td>
                    <td className="p-3">{contact.phone}</td>
                    <td className="p-3">
                      <select
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                        className="p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-3">{new Date(contact.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <textarea
                        placeholder="Follow-up notes..."
                        defaultValue={contact.followUpNotes || ''}
                        onChange={(e) => handleNotesChange(contact._id, e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        rows="2"
                      />
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
            <span className="text-gray-600">
              Page {page} of {Math.ceil(total / perPage)} ({total} total)
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
  );

  const renderClientsTab = () => (
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {clients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Phone</th>
                  <th className="p-3 text-left font-semibold">Trainer</th>
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
                    <td className="p-3">
                      {client.trainer ? (
                        <span className="text-sm">
                          {client.trainer.firstName} {client.trainer.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3">{new Date(client.created).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => handleViewClientDetails(client)}
                        className="text-blue-600 hover:underline text-sm"
                      >
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
  );

  const renderTrainersTab = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Trainer Management</h2>
      <ManageTrainers onAssignClients={handleOpenAssignClients} />
    </div>
  );

  const renderBillingTab = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-6">Billing and payment tracking features coming soon...</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">$0.00</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Paid This Month</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900">Outstanding</h3>
            <p className="text-2xl font-bold text-yellow-600">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-6">Business analytics and reporting features coming soon...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Quick Stats</h3>
            <ul className="space-y-2 text-sm">
              <li>Total Clients: {clients.length}</li>
              <li>Active Trainers: {trainers.filter(t => t.isActive).length}</li>
              <li>New Inquiries: {contacts.filter(c => c.status === 'New').length}</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Available Reports</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Client Growth Report</li>
              <li>• Trainer Performance Report</li>
              <li>• Revenue Analysis</li>
              <li>• Training Progress Summary</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // =====================
  // MAIN RENDER
  // =====================

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

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'contacts' && renderContactsTab()}
        {activeTab === 'clients' && renderClientsTab()}
        {activeTab === 'trainers' && renderTrainersTab()}
        {activeTab === 'billing' && renderBillingTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>

      {/* Modals */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={showClientDetails}
        onClose={() => {
          setShowClientDetails(false);
          setSelectedClient(null);
        }}
      />

      <AssignClientsModal
        isOpen={showAssignClients}
        onClose={() => {
          setShowAssignClients(false);
          setSelectedTrainer(null);
        }}
        trainer={selectedTrainer}
        clients={clients}
        onAssign={assignClientsToTrainer}
      />
    </div>
  );
};

export default DashboardAdmin;