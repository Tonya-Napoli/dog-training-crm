import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';
import ManualClientForm from '../components/forms/ManualClientForm';
import ManageTrainers from '../components/admin/ManageTrainers.jsx';
import ManageBilling from '../components/admin/ManageBilling.jsx';

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {user.firstName} {user.lastName}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b overflow-x-auto">
        <TabButton
          active={activeTab === 'contacts'}
          onClick={() => setActiveTab('contacts')}
          icon="📧"
          label="Contact Inquiries"
        />
        <TabButton
          active={activeTab === 'clients'}
          onClick={() => setActiveTab('clients')}
          icon="👥"
          label="Client Management"
        />
        <TabButton
          active={activeTab === 'trainers'}
          onClick={() => setActiveTab('trainers')}
          icon="🎓"
          label="Trainer Management"
        />
        <TabButton
          active={activeTab === 'billing'}
          onClick={() => setActiveTab('billing')}
          icon="💳"
          label="Billing & Packages"
        />
        <TabButton
          active={activeTab === 'reports'}
          onClick={() => setActiveTab('reports')}
          icon="📊"
          label="Reports"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'contacts' && (
        <ContactInquiriesTab
          contacts={contacts}
          loading={loading}
          error={error}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          setPage={setPage}
          total={total}
          perPage={perPage}
          handleStatusChange={handleStatusChange}
          handleNotesChange={handleNotesChange}
        />
      )}

      {activeTab === 'clients' && (
        <ClientManagementTab
          showAddClient={showAddClient}
          setShowAddClient={setShowAddClient}
          clientSearch={clientSearch}
          setClientSearch={setClientSearch}
          clients={clients}
          clientsLoading={clientsLoading}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          showClientDetails={showClientDetails}
          setShowClientDetails={setShowClientDetails}
          generateTempPassword={generateTempPassword}
          fetchClients={fetchClients}
        />
      )}

      {activeTab === 'trainers' && (
        <TrainerManagementTab
          showAddTrainer={showAddTrainer}
          setShowAddTrainer={setShowAddTrainer}
        />
      )}

      {activeTab === 'billing' && (
        <ManageBilling />
      )}

      {activeTab === 'reports' && (
        <ReportsTab contacts={contacts} clients={clients} />
      )}
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
      active 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-600 hover:text-blue-600'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// Contact Inquiries Tab Component
const ContactInquiriesTab = ({
  contacts, loading, error, search, setSearch, statusFilter, setStatusFilter,
  page, setPage, total, perPage, handleStatusChange, handleNotesChange
}) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold">Contact Inquiries</h2>
      <div className="text-sm text-gray-600">
        {total} total inquiries
      </div>
    </div>
    
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
        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    {loading && <div className="text-center py-8">Loading...</div>}
    {error && <div className="text-center text-red-500 py-8">{error}</div>}
    
    {/* Contacts Table */}
    {!loading && !error && (
      <>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full border-collapse">
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
                  <td className="p-3 font-medium">{contact.name}</td>
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
                      onChange={(e) => handleStatusChange(contact._id, e.target.value)}
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
                      onChange={(e) => handleNotesChange(contact._id, e.target.value)}
                      placeholder="Add follow-up notes..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                      rows="2"
                    />
                  </td>
                  <td className="p-3 text-sm text-gray-600">
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
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / perPage)} ({total} total)
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / perPage)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </>
    )}
  </div>
);

// Client Management Tab Component
const ClientManagementTab = ({
  showAddClient, setShowAddClient, clientSearch, setClientSearch,
  clients, clientsLoading, selectedClient, setSelectedClient,
  showClientDetails, setShowClientDetails, generateTempPassword, fetchClients
}) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold">Client Management</h2>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{clients.length} clients</span>
        <button
          onClick={() => setShowAddClient(!showAddClient)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          {showAddClient ? 'Cancel' : '+ Add New Client'}
        </button>
      </div>
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
                <th className="p-3 text-left font-semibold">Dog</th>
                <th className="p-3 text-left font-semibold">Trainer</th>
                <th className="p-3 text-left font-semibold">Registered</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={client._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{client.firstName} {client.lastName}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        client.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">{client.email}</td>
                  <td className="p-3">{client.phone || 'N/A'}</td>
                  <td className="p-3">
                    {client.dogName ? (
                      <div>
                        <p className="font-medium">{client.dogName}</p>
                        <p className="text-xs text-gray-600">{client.dogBreed}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">No dog info</span>
                    )}
                  </td>
                  <td className="p-3">
                    {client.trainer ? (
                      <span className="text-sm">
                        {client.trainer.firstName} {client.trainer.lastName}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(client.created).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => {
                        setSelectedClient(client);
                        setShowClientDetails(true);
                      }}
                      className="text-blue-600 hover:underline text-sm font-medium"
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

    {/* Enhanced Client Details Modal */}
    {showClientDetails && selectedClient && (
      <EnhancedClientDetailsModal
        client={selectedClient}
        onClose={() => setShowClientDetails(false)}
      />
    )}
  </div>
);

// Trainer Management Tab Component
const TrainerManagementTab = ({ showAddTrainer, setShowAddTrainer }) => (
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
);

// Reports Tab Component
const ReportsTab = ({ contacts, clients }) => {
  const newInquiries = contacts.filter(c => c.status === 'New').length;
  const contactedInquiries = contacts.filter(c => c.status === 'Contacted').length;
  const scheduledInquiries = contacts.filter(c => c.status === 'Scheduled').length;
  const closedInquiries = contacts.filter(c => c.status === 'Closed').length;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reports & Analytics</h2>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Clients" value={clients.length} color="blue" icon="👥" />
        <StatCard title="New Inquiries" value={newInquiries} color="green" icon="📧" />
        <StatCard title="Contacted" value={contactedInquiries} color="yellow" icon="📞" />
        <StatCard title="Scheduled" value={scheduledInquiries} color="purple" icon="📅" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Status Breakdown */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Inquiry Status</h3>
          <div className="space-y-3">
            <StatusBar label="New" count={newInquiries} total={contacts.length} color="bg-blue-500" />
            <StatusBar label="Contacted" count={contactedInquiries} total={contacts.length} color="bg-yellow-500" />
            <StatusBar label="Scheduled" count={scheduledInquiries} total={contacts.length} color="bg-purple-500" />
            <StatusBar label="Closed" count={closedInquiries} total={contacts.length} color="bg-green-500" />
          </div>
        </div>

        {/* Available Reports */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
          <div className="space-y-3">
            <ReportButton title="Client Growth Report" description="Monthly client acquisition trends" />
            <ReportButton title="Trainer Performance" description="Session completion and client satisfaction" />
            <ReportButton title="Revenue Analysis" description="Income breakdown and forecasting" />
            <ReportButton title="Training Progress" description="Client progress and package completion" />
            <ReportButton title="Contact Conversion" description="Lead to client conversion rates" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const StatCard = ({ title, value, color, icon }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg border border-${color}-100`}>
    <div className="flex items-center">
      <span className="text-2xl mr-3">{icon}</span>
      <div>
        <h3 className={`font-semibold text-${color}-900`}>{title}</h3>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
    </div>
  </div>
);

const StatusBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const ReportButton = ({ title, description }) => (
  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
    <h4 className="font-medium">{title}</h4>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

// Enhanced Client Details Modal with Billing Integration
const EnhancedClientDetailsModal = ({ client, onClose }) => {
  const [clientPackages, setClientPackages] = useState([]);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientBillingData();
  }, [client._id]);

  const fetchClientBillingData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with real API calls
      setClientPackages([
        {
          _id: '1',
          package: {
            _id: '1',
            name: 'Basic Puppy Training',
            sessions: 6,
            price: 300,
            description: 'Foundation training for puppies 8-16 weeks'
          },
          purchaseDate: new Date('2024-01-15'),
          sessionsUsed: 2,
          sessionsRemaining: 4,
          status: 'active',
          invoiceStatus: 'paid',
          trainer: {
            _id: '1',
            firstName: 'Sarah',
            lastName: 'Johnson'
          },
          lastSessionDate: new Date('2024-02-10'),
          nextSessionDate: new Date('2024-02-17')
        }
      ]);

      setClientInvoices([
        {
          _id: '1',
          invoiceNumber: 'INV-2024-001',
          amount: 300,
          status: 'paid',
          createdAt: new Date('2024-01-15'),
          dueDate: new Date('2024-01-30'),
          paidDate: new Date('2024-01-20'),
          items: [{ description: 'Basic Puppy Training Package', amount: 300 }]
        }
      ]);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch client billing data:', err);
      setLoading(false);
    }
  };

  const recordSession = async (packageId) => {
    console.log('Recording session for package:', packageId);
    fetchClientBillingData();
  };

  const markInvoicePaid = async (invoiceId) => {
    console.log('Marking invoice paid:', invoiceId);
    fetchClientBillingData();
  };

  // Calculate totals
  const totalSpent = clientInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const outstandingAmount = clientInvoices
    .filter(invoice => invoice.status === 'pending' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalSessionsUsed = clientPackages.reduce((sum, pkg) => sum + pkg.sessionsUsed, 0);
  const totalSessionsRemaining = clientPackages.reduce((sum, pkg) => sum + pkg.sessionsRemaining, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">
            {client.firstName} {client.lastName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-700">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{client.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{client.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    client.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registered:</span>
                  <span className="font-medium">{new Date(client.created).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Dog Information */}
            {client.dogName && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-gray-700">Dog Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{client.dogName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Breed:</span>
                    <span className="font-medium">{client.dogBreed || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{client.dogAge || 'Not specified'}</span>
                  </div>
                  {client.trainingGoals?.length > 0 && (
                    <div>
                      <span className="text-gray-600">Training Goals:</span>
                      <p className="font-medium mt-1">
                        {client.trainingGoals.map(goal => 
                          goal.replace(/([A-Z])/g, ' $1').trim()
                        ).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Billing Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold mb-3 text-blue-900">Billing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Spent:</span>
                  <span className="font-bold text-green-600">${totalSpent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Outstanding:</span>
                  <span className={`font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    ${outstandingAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Sessions Used:</span>
                  <span className="font-bold text-blue-600">{totalSessionsUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Sessions Remaining:</span>
                  <span className="font-bold text-purple-600">{totalSessionsRemaining}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Training Packages */}
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-700">Training Packages</h4>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : clientPackages.length > 0 ? (
                <div className="space-y-3">
                  {clientPackages.map((clientPkg) => (
                    <div key={clientPkg._id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{clientPkg.package.name}</h5>
                          <p className="text-xs text-gray-600">{clientPkg.package.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          clientPkg.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {clientPkg.status}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress: {clientPkg.sessionsUsed} / {clientPkg.package.sessions}</span>
                          <span>{Math.round((clientPkg.sessionsUsed / clientPkg.package.sessions) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(clientPkg.sessionsUsed / clientPkg.package.sessions) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-medium">${clientPkg.package.price}</span>
                        </div>
                        {clientPkg.trainer && (
                          <div className="flex justify-between">
                            <span>Trainer:</span>
                            <span>{clientPkg.trainer.firstName} {clientPkg.trainer.lastName}</span>
                          </div>
                        )}
                        {clientPkg.nextSessionDate && (
                          <div className="flex justify-between">
                            <span>Next Session:</span>
                            <span className="font-medium text-blue-600">
                              {new Date(clientPkg.nextSessionDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {clientPkg.status === 'active' && clientPkg.sessionsRemaining > 0 && (
                        <button
                          onClick={() => recordSession(clientPkg._id)}
                          className="w-full mt-3 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Record Session
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No training packages assigned</p>
              )}
            </div>
          </div>

          {/* Right Column - Invoices & Actions */}
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-700">Recent Invoices</h4>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : clientInvoices.length > 0 ? (
                <div className="space-y-3">
                  {clientInvoices.slice(0, 3).map((invoice) => (
                    <div key={invoice._id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{invoice.invoiceNumber}</h5>
                          <p className="text-xs text-gray-600">
                            {invoice.items[0]?.description}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-semibold">${invoice.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due Date:</span>
                          <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => markInvoicePaid(invoice._id)}
                          className="w-full mt-2 text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No invoices found</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-700">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                  📦 Assign Training Package
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                  📄 Create Invoice
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                  📅 Schedule Session
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors">
                  ✉️ Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            onClick={() => alert('Edit functionality coming soon!')}
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
  );
};

export default DashboardAdmin;