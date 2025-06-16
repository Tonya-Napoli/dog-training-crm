// src/pages/DashboardAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';
// Fix the import - it looks like ClientDataMock might not have a default export
import clientDataMock from '../mocks/ClientDataMock';
import usersMock from '../mocks/UsersMock';
import { employeeDataMock } from '../mocks/EmployeeDataMock';
import trainingDataMock from '../mocks/TrainingDataMock';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inquiries');
  
  // Contact state
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Billing data from mock
  const [billingData, setBillingData] = useState({
    clients: [],
    totalRevenue: 0,
    totalOutstanding: 0,
    activeClients: 0
  });

  // Initialize billing data from training mock data
  useEffect(() => {
    // Make sure clientDataMock is an array
    const clientData = Array.isArray(clientDataMock) ? clientDataMock : [];
    
    // Combine client data with training/billing data
    const billingClients = clientData.map(client => {
      const trainingData = trainingDataMock.find(t => t.clientId === client.clientId);
      return {
        id: client.clientId,
        name: client.name,
        dogName: client.dogName,
        trainer: employeeDataMock.find(e => e.employeeId === client.trainerId)?.name || 'Unassigned',
        package: trainingData?.sessions?.[0]?.topic || 'Basic Training',
        sessions: {
          completed: trainingData?.sessions?.filter(s => s.status === 'Completed').length || 0,
          total: trainingData?.sessions?.length || 0
        },
        amount: trainingData?.billing?.totalEarnings || 0,
        paid: (trainingData?.billing?.totalEarnings || 0) - (trainingData?.billing?.outstanding || 0),
        balance: trainingData?.billing?.outstanding || 0,
        lastPayment: '2024-10-15',
        status: trainingData?.billing?.outstanding > 0 ? 'overdue' : 'active',
        email: client.contactInfo.email,
        phone: client.contactInfo.phone
      };
    });

    const totalRevenue = billingClients.reduce((sum, client) => sum + client.amount, 0);
    const totalOutstanding = billingClients.reduce((sum, client) => sum + client.balance, 0);

    setBillingData({
      clients: billingClients,
      totalRevenue,
      totalOutstanding,
      activeClients: billingClients.length
    });
  }, []);

  // Define fetchContacts with useCallback to fix ESLint warning
  const fetchContacts = useCallback(async () => {
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
  }, [page, perPage, search, statusFilter]);

  // Define fetchUsers with useCallback to fix ESLint warning
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const role = activeTab === 'clients' ? 'client' : 'trainer';
      
      // Use mock data
      let mockUsers = [];
      
      // Make sure clientDataMock is an array
      const clientData = Array.isArray(clientDataMock) ? clientDataMock : [];
      
      if (role === 'client') {
        // Convert client mock data to user format
        mockUsers = clientData.map(client => ({
          _id: client.clientId,
          firstName: client.name.split(' ')[0],
          lastName: client.name.split(' ')[1] || '',
          email: client.contactInfo.email,
          phone: client.contactInfo.phone,
          role: 'client',
          createdAt: new Date(),
          isActive: true,
          dogName: client.dogName,
          trainer: employeeDataMock.find(e => e.employeeId === client.trainerId)?.name || 'Unassigned'
        }));
      } else {
        // Get trainers from users mock and employee mock
        const trainersFromUsers = usersMock.filter(u => u.role === 'trainer');
        const trainersFromEmployees = employeeDataMock.filter(e => e.role === 'Trainer');
        
        mockUsers = trainersFromUsers.map(trainer => ({
          _id: trainer.username,
          firstName: trainer.name.split(' ')[0],
          lastName: trainer.name.split(' ')[1] || '',
          email: trainer.email,
          phone: trainer.phone,
          role: 'trainer',
          createdAt: new Date(),
          isActive: true,
          assignedClients: trainersFromEmployees.find(e => e.name === trainer.name)?.assignedClients?.length || 0
        }));
      }

      // Apply search filter
      if (userSearch) {
        mockUsers = mockUsers.filter(user => 
          user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
        );
      }

      setUsers(mockUsers);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load ${activeTab}.`);
      setLoading(false);
    }
  }, [activeTab, userSearch]);

  // Fetch contacts
  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchContacts();
    }
  }, [page, search, statusFilter, activeTab, fetchContacts]);

  // Fetch users
  useEffect(() => {
    if (activeTab === 'clients' || activeTab === 'trainers') {
      fetchUsers();
    }
  }, [activeTab, userSearch, fetchUsers]);

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

  // Toggle user active status
  const handleUserActiveToggle = async (userId, isActive) => {
    try {
      // For mock data, just update state
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, isActive } : u
        )
      );
    } catch (err) {
      setError('Failed to update user status.');
    }
  };

  // Billing functions
  const handleRecordPayment = (clientId, amount) => {
    console.log(`Recording payment of $${amount} for client ${clientId}`);
    setBillingData(prev => ({
      ...prev,
      clients: prev.clients.map(client => 
        client.id === clientId 
          ? { 
              ...client, 
              paid: client.paid + amount, 
              balance: Math.max(0, client.balance - amount),
              status: (client.balance - amount) <= 0 ? 'active' : client.status
            }
          : client
      )
    }));
    
    // Update totals
    setBillingData(prev => ({
      ...prev,
      totalRevenue: prev.totalRevenue + amount,
      totalOutstanding: Math.max(0, prev.totalOutstanding - amount)
    }));
  };

  const handleSendInvoice = (clientId) => {
    const client = billingData.clients.find(c => c.id === clientId);
    console.log(`Sending invoice to ${client?.name} at ${client?.email}`);
    alert(`Invoice sent to ${client?.email}!`);
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  // ... rest of the component remains the same
  const renderContacts = () => (
    <>
      <h2 className="text-2xl font-semibold mb-4">Contact Inquiries</h2>
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
  );

  const renderUsers = () => (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        Manage {activeTab === 'clients' ? 'Clients' : 'Trainers'}
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              {activeTab === 'clients' && (
                <>
                  <th className="p-3 text-left font-semibold">Dog Name</th>
                  <th className="p-3 text-left font-semibold">Trainer</th>
                </>
              )}
              {activeTab === 'trainers' && (
                <th className="p-3 text-left font-semibold">Clients</th>
              )}
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                <td className="p-3">{`${user.firstName} ${user.lastName}`}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.phone || 'N/A'}</td>
                {activeTab === 'clients' && (
                  <>
                    <td className="p-3">{user.dogName}</td>
                    <td className="p-3">{user.trainer}</td>
                  </>
                )}
                {activeTab === 'trainers' && (
                  <td className="p-3">{user.assignedClients} clients</td>
                )}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleUserActiveToggle(user._id, !user.isActive)}
                    className={`px-3 py-1 rounded text-sm ${
                      user.isActive
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderBilling = () => (
    <>
      <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${billingData.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Outstanding Balance</h3>
          <p className="text-3xl font-bold text-red-600">${billingData.totalOutstanding}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Active Clients</h3>
          <p className="text-3xl font-bold text-blue-600">{billingData.activeClients}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold">Client</th>
              <th className="p-3 text-left font-semibold">Dog</th>
              <th className="p-3 text-left font-semibold">Trainer</th>
              <th className="p-3 text-left font-semibold">Sessions</th>
              <th className="p-3 text-left font-semibold">Total</th>
              <th className="p-3 text-left font-semibold">Paid</th>
              <th className="p-3 text-left font-semibold">Balance</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {billingData.clients.map((client, index) => (
              <tr key={client.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-3">{client.name}</td>
                <td className="p-3">{client.dogName}</td>
                <td className="p-3">{client.trainer}</td>
                <td className="p-3">{client.sessions.completed}/{client.sessions.total}</td>
                <td className="p-3">${client.amount}</td>
                <td className="p-3">${client.paid}</td>
                <td className="p-3">
                  <span className={`font-semibold ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${client.balance}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' : 
                    client.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {client.balance > 0 && (
                      <>
                        <button
                          onClick={() => {
                            const amount = prompt(`Enter payment amount for ${client.name}:`);
                            if (amount && !isNaN(amount)) {
                              handleRecordPayment(client.id, parseFloat(amount));
                            }
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Record Payment
                        </button>
                        <button
                          onClick={() => handleSendInvoice(client.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Send Invoice
                        </button>
                      </>
                    )}
                    <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Create New Invoice
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Generate Monthly Report
        </button>
        <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          Manage Packages & Pricing
        </button>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Contact Inquiries
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'clients'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Manage Clients
        </button>
        <button
          onClick={() => setActiveTab('trainers')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'trainers'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Manage Trainers
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'billing'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Billing & Payments
        </button>
      </div>

      {/* Content */}
      {loading && activeTab === 'inquiries' ? (
        <div className="text-center">Loading...</div>
      ) : error && activeTab === 'inquiries' ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {activeTab === 'inquiries' && renderContacts()}
          {activeTab === 'clients' && renderUsers()}
          {activeTab === 'trainers' && renderUsers()}
          {activeTab === 'billing' && renderBilling()}
        </>
      )}
    </div>
  );
};

export default DashboardAdmin;