import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';
import ManualClientForm from '../components/forms/ManualClientForm';
import ManageTrainers from '../components/admin/ManageTrainers.jsx';

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

  // Trainer Management State (minimal - just for the add trainer section)
  const [showAddTrainer, setShowAddTrainer] = useState(false);

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
                            onClick={() => {
                              setSelectedClient(client);
                              setShowClientDetails(true);
                            }}
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

          {/* Client Details Modal */}
          {showClientDetails && selectedClient && (
            <ClientDetailsModal
              client={selectedClient}
              onClose={() => setShowClientDetails(false)}
            />
          )}
        </div>
      ) : activeTab === 'trainers' ? (
        // Trainer Management Tab
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Trainer Management</h2>
            <button
              onClick={() => setShowAddTrainer(!showAddTrainer)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {showAddTrainer ? 'Cancel' : '+ Add New Trainer'}
            </button>
          </div>

          {/* Add Trainer Form */}
          {showAddTrainer && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Add New Trainer</h3>
              <p className="text-gray-600 mb-4">
                You can direct trainers to self-register or manually add them here.
              </p>
              <button
                onClick={() => window.open('/trainer/register', '_blank')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Open Trainer Registration Form
              </button>
            </div>
          )}

          {/* Use the existing ManageTrainers component */}
          <ManageTrainers />
        </div>
      ) : activeTab === 'billing' ? (
        // Billing Tab
        <div>
          <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-gray-600">Billing and payment tracking features coming soon...</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
      ) : activeTab === 'reports' ? (
        // Reports Tab
        <div>
          <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-gray-600">Business analytics and reporting features coming soon...</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <ul className="space-y-2 text-sm">
                  <li>Total Clients: {clients.length}</li>
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
      ) : null}
    </div>
  );
};

// Client Details Modal Component
const ClientDetailsModal = ({ client, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Client Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold mb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="font-medium">{client.firstName} {client.lastName}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{client.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">{client.phone || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          {client.address && (
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-2">Address</h4>
              <div className="text-sm">
                <p>{client.address.street}</p>
                <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
              </div>
            </div>
          )}

          {/* Dog Information */}
          {client.dogName && (
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-2">Dog Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Dog Name:</span>
                  <p className="font-medium">{client.dogName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Breed:</span>
                  <p className="font-medium">{client.dogBreed || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <p className="font-medium">{client.dogAge || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Training Goals:</span>
                  <p className="font-medium">
                    {client.trainingGoals?.length > 0 
                      ? client.trainingGoals.map(goal => 
                          goal.replace(/([A-Z])/g, ' $1').trim()
                        ).join(', ')
                      : 'None specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trainer Assignment */}
          <div className="border-b pb-4">
            <h4 className="font-semibold mb-2">Trainer Assignment</h4>
            <div className="text-sm">
              {client.trainer ? (
                <p>
                  Assigned to: <span className="font-medium">
                    {client.trainer.firstName} {client.trainer.lastName}
                  </span>
                </p>
              ) : (
                <p className="text-gray-500">No trainer assigned</p>
              )}
            </div>
          </div>

          {/* Registration Info */}
          <div className="border-b pb-4">
            <h4 className="font-semibold mb-2">Registration Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Registered:</span>
                <p className="font-medium">{new Date(client.created).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Registration Method:</span>
                <p className="font-medium">
                  {client.adminNotes?.registrationMethod || 'Self-registered'}
                </p>
              </div>
            </div>
            {client.adminNotes?.registrationNotes && (
              <div className="mt-2">
                <span className="text-gray-600 text-sm">Admin Notes:</span>
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                  {client.adminNotes.registrationNotes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                // Add edit functionality here
                alert('Edit functionality coming soon!');
              }}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Edit Client
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;