// src/pages/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inquiries');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  // Mock billing data - replace with actual API calls
  const [billingData, setBillingData] = useState({
    clients: [
      {
        id: 1,
        name: 'John Doe',
        dogName: 'Buddy',
        package: 'Basic Training',
        sessions: { completed: 4, total: 6 },
        amount: 600,
        paid: 400,
        balance: 200,
        lastPayment: '2024-10-15',
        status: 'active'
      },
      {
        id: 2,
        name: 'Jane Smith',
        dogName: 'Rex',
        package: 'Advanced Training',
        sessions: { completed: 8, total: 10 },
        amount: 1000,
        paid: 1000,
        balance: 0,
        lastPayment: '2024-10-20',
        status: 'active'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        dogName: 'Max',
        package: 'Puppy Training',
        sessions: { completed: 3, total: 4 },
        amount: 400,
        paid: 300,
        balance: 100,
        lastPayment: '2024-09-28',
        status: 'overdue'
      }
    ],
    totalRevenue: 1800,
    totalOutstanding: 300,
    activeClients: 3
  });

  // Fetch contacts when on inquiries tab
  useEffect(() => {
    if (activeTab === 'inquiries') {
      const fetchContacts = async () => {
        try {
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
    }
  }, [page, search, statusFilter, activeTab]);

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

  // Billing functions
  const handleRecordPayment = (clientId, amount) => {
    // In real app, this would make an API call
    console.log(`Recording payment of $${amount} for client ${clientId}`);
    // Update the billing data
    setBillingData(prev => ({
      ...prev,
      clients: prev.clients.map(client => 
        client.id === clientId 
          ? { ...client, paid: client.paid + amount, balance: client.balance - amount }
          : client
      )
    }));
  };

  const handleSendInvoice = (clientId) => {
    // In real app, this would trigger email sending
    console.log(`Sending invoice to client ${clientId}`);
    alert('Invoice sent successfully!');
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'inquiries'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Contact Inquiries
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'billing'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Billing & Payments
        </button>
      </div>

      {/* Inquiries Tab Content */}
      {activeTab === 'inquiries' && (
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
          
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Billing Tab Content */}
      {activeTab === 'billing' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
          
          {/* Summary Cards */}
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

          {/* Client Billing Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold">Client</th>
                  <th className="p-3 text-left font-semibold">Dog</th>
                  <th className="p-3 text-left font-semibold">Package</th>
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
                    <td className="p-3">{client.package}</td>
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

          {/* Quick Actions */}
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
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;