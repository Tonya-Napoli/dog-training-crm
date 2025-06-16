import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contacts');
  
  // Contact management state
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState(null);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsSearch, setContactsSearch] = useState('');
  const [contactsStatusFilter, setContactsStatusFilter] = useState('');
  
  // Trainer management state
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [trainersError, setTrainersError] = useState(null);
  
  // Client management state
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  
  const perPage = 10;

  // Define fetch functions first with useCallback
  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: contactsPage, perPage });
      if (contactsSearch) params.append('search', contactsSearch);
      if (contactsStatusFilter) params.append('status', contactsStatusFilter);
      const response = await axios.get(`/contacts?${params.toString()}`);
      setContacts(response.data.contacts);
      setContactsTotal(response.data.total);
      setContactsLoading(false);
    } catch (err) {
      setContactsError('Failed to load contacts.');
      setContactsLoading(false);
    }
  }, [contactsPage, contactsSearch, contactsStatusFilter]);

  const fetchTrainers = useCallback(async () => {
    setTrainersLoading(true);
    try {
      console.log('🔍 Fetching trainers...');
      const response = await axios.get('/auth/users?role=trainer');
      console.log('✅ Trainers response:', response.data);
      setTrainers(response.data.users || []);
      setTrainersError(null);
    } catch (err) {
      console.error('❌ Error fetching trainers:', err);
      setTrainersError('Failed to load trainers: ' + (err.response?.data?.message || err.message));
      setTrainers([]);
    } finally {
      setTrainersLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      console.log('🔍 Fetching clients...');
      const response = await axios.get('/auth/users?role=client');
      console.log('✅ Clients response:', response.data);
      setClients(response.data.users || []);
      setClientsError(null);
    } catch (err) {
      console.error('❌ Error fetching clients:', err);
      setClientsError('Failed to load clients: ' + (err.response?.data?.message || err.message));
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  // Assign trainer to client
  const handleAssignTrainer = useCallback(async (clientId, trainerId) => {
    try {
      console.log('🔗 Assigning trainer:', { clientId, trainerId });
      await axios.put(`/auth/users/${clientId}/assign-trainer`, { trainerId });
      console.log('✅ Trainer assigned successfully');
      // Refresh clients list
      fetchClients();
    } catch (err) {
      console.error('❌ Failed to assign trainer:', err);
      setClientsError('Failed to assign trainer: ' + (err.response?.data?.message || err.message));
    }
  }, [fetchClients]);

  // Fetch contacts on mount and when filters change
  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    }
  }, [activeTab, fetchContacts]);

  // Fetch trainers when tab is active
  useEffect(() => {
    if (activeTab === 'trainers') {
      fetchTrainers();
    }
  }, [activeTab, fetchTrainers]);

  // Fetch clients when tab is active
  useEffect(() => {
    if (activeTab === 'clients') {
      fetchClients();
    }
  }, [activeTab, fetchClients]);

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
      setContactsError('Failed to update status.');
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
      setContactsError('Failed to update notes.');
    }
  }, 500);

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  const tabs = [
    { id: 'contacts', label: 'Contact Inquiries', icon: '📧' },
    { id: 'trainers', label: 'Trainer Management', icon: '🎓' },
    { id: 'clients', label: 'Client Management', icon: '🐕' },
    { id: 'assignments', label: 'Trainer Assignments', icon: '🔗' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Contact Inquiries</h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={contactsSearch}
              onChange={(e) => {
                setContactsSearch(e.target.value);
                setContactsPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={contactsStatusFilter}
              onChange={(e) => {
                setContactsStatusFilter(e.target.value);
                setContactsPage(1);
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
          {contactsLoading ? (
            <div className="text-center">Loading contacts...</div>
          ) : contactsError ? (
            <div className="text-center text-red-500">{contactsError}</div>
          ) : (
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
                        <td className="p-3 max-w-xs truncate">{contact.message}</td>
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
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setContactsPage(contactsPage - 1)}
                  disabled={contactsPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
                >
                  Previous
                </button>
                <span>
                  Page {contactsPage} of {Math.ceil(contactsTotal / perPage)}
                </span>
                <button
                  onClick={() => setContactsPage(contactsPage + 1)}
                  disabled={contactsPage >= Math.ceil(contactsTotal / perPage)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'trainers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Trainer Management</h2>
            <a 
              href="/trainer/register" 
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add New Trainer
            </a>
          </div>

          {trainersLoading ? (
            <div className="text-center">Loading trainers...</div>
          ) : trainersError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error Loading Trainers</p>
              <p>{trainersError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No trainers found.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    <a href="/trainer/register" className="text-blue-600 underline">
                      Register the first trainer →
                    </a>
                  </p>
                </div>
              ) : (
                trainers.map((trainer) => (
                  <div key={trainer._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {trainer.firstName?.[0]}{trainer.lastName?.[0]}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold">{trainer.firstName} {trainer.lastName}</h3>
                        <p className="text-sm text-gray-600">{trainer.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-medium">Specialties:</span> {trainer.specialties?.join(', ') || 'Not specified'}</p>
                      <p><span className="font-medium">Experience:</span> {trainer.experience || 'Not specified'}</p>
                      <p><span className="font-medium">Rate:</span> ${trainer.hourlyRate || 'Not set'}/hour</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${trainer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {trainer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="text-blue-600 text-sm hover:underline">View Details</button>
                      <button className="text-green-600 text-sm hover:underline">Edit</button>
                      <button className="text-gray-600 text-sm hover:underline">View Clients</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Client Management</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Note:</strong> Clients register themselves at{' '}
                <a href="/client/register" className="text-blue-600 underline" target="_blank">
                  /client/register
                </a>
                <br />
                <span className="text-blue-600">Your role: Assign trainers to existing clients</span>
              </p>
            </div>
          </div>
          
          {clientsLoading ? (
            <div className="text-center">Loading clients...</div>
          ) : clientsError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error Loading Clients</p>
              <p>{clientsError}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-semibold">Client Name</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Phone</th>
                      <th className="p-3 text-left font-semibold">Dog Name</th>
                      <th className="p-3 text-left font-semibold">Assigned Trainer</th>
                      <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">
                          No clients found.
                          <br />
                          <a href="/client/register" className="text-blue-600 underline">
                            Register the first client →
                          </a>
                        </td>
                      </tr>
                    ) : (
                      clients.map((client, index) => (
                        <tr key={client._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3">{client.firstName} {client.lastName}</td>
                          <td className="p-3">{client.email}</td>
                          <td className="p-3">{client.phone || 'N/A'}</td>
                          <td className="p-3">{client.dogName || 'Not specified'}</td>
                          <td className="p-3">
                            <select 
                              className="p-1 border border-gray-300 rounded-md"
                              value={client.assignedTrainer?._id || ''}
                              onChange={(e) => handleAssignTrainer(client._id, e.target.value || null)}
                            >
                              <option value="">Select Trainer</option>
                              {trainers.map(trainer => (
                                <option key={trainer._id} value={trainer._id}>
                                  {trainer.firstName} {trainer.lastName}
                                </option>
                              ))}
                            </select>
                            {client.assignedTrainer && (
                              <div className="text-xs text-gray-500 mt-1">
                                Currently: {client.assignedTrainer.firstName} {client.assignedTrainer.lastName}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <button className="text-blue-600 text-sm hover:underline mr-2">View</button>
                            <button className="text-green-600 text-sm hover:underline">Edit</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Trainer-Client Assignments</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-2">
                <p>Total Trainers: <span className="font-bold">{trainers.length}</span></p>
                <p>Total Clients: <span className="font-bold">{clients.length}</span></p>
                <p>Assigned Clients: <span className="font-bold">{clients.filter(c => c.assignedTrainer).length}</span></p>
                <p>Unassigned Clients: <span className="font-bold text-orange-600">{clients.filter(c => !c.assignedTrainer).length}</span></p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Assignment Overview</h3>
              <div className="space-y-2">
                {trainers.length === 0 ? (
                  <p className="text-gray-500">No trainers available for assignments</p>
                ) : (
                  trainers.map(trainer => {
                    const assignedClients = clients.filter(c => c.assignedTrainer?._id === trainer._id);
                    return (
                      <div key={trainer._id} className="flex justify-between">
                        <span>{trainer.firstName} {trainer.lastName}:</span>
                        <span className="font-medium">{assignedClients.length} clients</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;