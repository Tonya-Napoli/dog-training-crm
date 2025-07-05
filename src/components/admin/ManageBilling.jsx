import React, { useState, useEffect } from 'react';
import axios from '../../axios.js';

const ManageBilling = () => {
  // State for different sections
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Training Packages State
  const [packages, setPackages] = useState([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  
  // Client Packages State
  const [clientPackages, setClientPackages] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAssignPackage, setShowAssignPackage] = useState(false);
  
  // Invoices State
  const [invoices, setInvoices] = useState([]);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    outstandingAmount: 0,
    activePackages: 0
  });

  // Fetch all data
  useEffect(() => {
    fetchPackages();
    fetchClients();
    fetchClientPackages();
    fetchInvoices();
    calculateStats();
  }, []);

  // API calls (WIP - implement these endpoints)
  const fetchPackages = async () => {
    try {
      setPackagesLoading(true);
      // const response = await axios.get('/billing/packages');
      // setPackages(response.data.packages || []);
      
      // Mock data for now
      setPackages([
        {
          _id: '1',
          name: 'Basic Puppy Training',
          description: 'Foundation training for puppies 8-16 weeks',
          price: 300,
          sessions: 6,
          isActive: true,
          createdAt: new Date()
        },
        {
          _id: '2',
          name: 'Adult Dog Behavioral',
          description: 'Behavioral modification for adult dogs',
          price: 450,
          sessions: 8,
          isActive: true,
          createdAt: new Date()
        }
      ]);
      setPackagesLoading(false);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setPackagesLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/auth/clients');
      setClients(response.data.clients || []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const fetchClientPackages = async () => {
    try {
      // const response = await axios.get('/billing/client-packages');
      // setClientPackages(response.data.clientPackages || []);
      
      // Mock data
      setClientPackages([
        {
          _id: '1',
          client: { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
          package: { _id: '1', name: 'Basic Puppy Training', sessions: 6, price: 300 },
          purchaseDate: new Date('2024-01-15'),
          sessionsUsed: 2,
          status: 'active',
          invoiceStatus: 'paid'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch client packages:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Mock data
      setInvoices([
        {
          _id: '1',
          invoiceNumber: 'INV-2024-001',
          client: { _id: '1', firstName: 'John', lastName: 'Doe' },
          items: [{ description: 'Basic Puppy Training Package', amount: 300 }],
          totalAmount: 300,
          status: 'paid',
          createdAt: new Date('2024-01-15'),
          dueDate: new Date('2024-01-30'),
          paidDate: new Date('2024-01-20')
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };

  const calculateStats = () => {
    // This would calculate from real data
    setStats({
      totalRevenue: 4500,
      monthlyRevenue: 1200,
      outstandingAmount: 600,
      activePackages: 12
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
      
      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6 border-b">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'dashboard' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveSection('packages')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'packages' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Training Packages
        </button>
        <button
          onClick={() => setActiveSection('client-packages')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'client-packages' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Client Packages
        </button>
        <button
          onClick={() => setActiveSection('invoices')}
          className={`px-4 py-2 font-medium ${
            activeSection === 'invoices' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          Invoices
        </button>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Total Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">This Month</h3>
              <p className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900">Outstanding</h3>
              <p className="text-2xl font-bold text-yellow-600">${stats.outstandingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Active Packages</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.activePackages}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">John Doe - Basic Puppy Training</p>
                  <p className="text-sm text-gray-600">Payment received</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+$300</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">Sarah Johnson - Adult Behavioral</p>
                  <p className="text-sm text-gray-600">Invoice created</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">$450</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Packages Section */}
      {activeSection === 'packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Training Packages</h3>
            <button
              onClick={() => setShowAddPackage(!showAddPackage)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {showAddPackage ? 'Cancel' : '+ Add Package'}
            </button>
          </div>

          {/* Add Package Form */}
          {showAddPackage && (
            <PackageForm
              onCancel={() => setShowAddPackage(false)}
              onSuccess={() => {
                setShowAddPackage(false);
                fetchPackages();
              }}
            />
          )}

          {/* Packages List */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {packages.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold">Package Name</th>
                    <th className="p-3 text-left font-semibold">Description</th>
                    <th className="p-3 text-left font-semibold">Sessions</th>
                    <th className="p-3 text-left font-semibold">Price</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, index) => (
                    <tr key={pkg._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 font-medium">{pkg.name}</td>
                      <td className="p-3 text-sm text-gray-600">{pkg.description}</td>
                      <td className="p-3">{pkg.sessions} sessions</td>
                      <td className="p-3 font-semibold">${pkg.price}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          pkg.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            Edit
                          </button>
                          <button className="text-red-600 hover:underline text-sm">
                            {pkg.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No training packages created yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Packages Section */}
      {activeSection === 'client-packages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Client Packages</h3>
            <button
              onClick={() => setShowAssignPackage(!showAssignPackage)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              {showAssignPackage ? 'Cancel' : 'Assign Package'}
            </button>
          </div>

          {/* Assign Package Form */}
          {showAssignPackage && (
            <AssignPackageForm
              clients={clients}
              packages={packages}
              onCancel={() => setShowAssignPackage(false)}
              onSuccess={() => {
                setShowAssignPackage(false);
                fetchClientPackages();
              }}
            />
          )}

          {/* Client Packages List */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {clientPackages.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold">Client</th>
                    <th className="p-3 text-left font-semibold">Package</th>
                    <th className="p-3 text-left font-semibold">Progress</th>
                    <th className="p-3 text-left font-semibold">Purchase Date</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientPackages.map((clientPkg, index) => (
                    <tr key={clientPkg._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{clientPkg.client.firstName} {clientPkg.client.lastName}</p>
                          <p className="text-sm text-gray-600">{clientPkg.client.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{clientPkg.package.name}</p>
                          <p className="text-sm text-gray-600">${clientPkg.package.price}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm">{clientPkg.sessionsUsed} / {clientPkg.package.sessions} sessions</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(clientPkg.sessionsUsed / clientPkg.package.sessions) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{new Date(clientPkg.purchaseDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          clientPkg.invoiceStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {clientPkg.invoiceStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            Record Session
                          </button>
                          <button className="text-green-600 hover:underline text-sm">
                            Create Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No packages assigned to clients yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Section */}
      {activeSection === 'invoices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Invoices</h3>
            <button
              onClick={() => setShowCreateInvoice(!showCreateInvoice)}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
            >
              {showCreateInvoice ? 'Cancel' : 'Create Invoice'}
            </button>
          </div>

          {/* Create Invoice Form */}
          {showCreateInvoice && (
            <CreateInvoiceForm
              clients={clients}
              packages={packages}
              onCancel={() => setShowCreateInvoice(false)}
              onSuccess={() => {
                setShowCreateInvoice(false);
                fetchInvoices();
              }}
            />
          )}

          {/* Invoices List */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {invoices.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold">Invoice #</th>
                    <th className="p-3 text-left font-semibold">Client</th>
                    <th className="p-3 text-left font-semibold">Amount</th>
                    <th className="p-3 text-left font-semibold">Created</th>
                    <th className="p-3 text-left font-semibold">Due Date</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={invoice._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 font-mono text-sm">{invoice.invoiceNumber}</td>
                      <td className="p-3">{invoice.client.firstName} {invoice.client.lastName}</td>
                      <td className="p-3 font-semibold">${invoice.totalAmount}</td>
                      <td className="p-3">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:underline text-sm">
                            View
                          </button>
                          {invoice.status !== 'paid' && (
                            <button className="text-green-600 hover:underline text-sm">
                              Mark Paid
                            </button>
                          )}
                          <button className="text-purple-600 hover:underline text-sm">
                            Send
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No invoices created yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Package Form Component
const PackageForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sessions: '',
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await axios.post('/billing/packages', formData);
      console.log('Creating package:', formData);
      onSuccess();
    } catch (err) {
      console.error('Failed to create package:', err);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Create Training Package</h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Package Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Sessions</label>
          <input
            type="number"
            value={formData.sessions}
            onChange={(e) => setFormData({...formData, sessions: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm">Active Package</span>
          </label>
        </div>
        <div className="col-span-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Package
          </button>
        </div>
      </form>
    </div>
  );
};

// Assign Package Form Component
const AssignPackageForm = ({ clients, packages, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    packageId: '',
    createInvoice: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await axios.post('/billing/assign-package', formData);
      console.log('Assigning package:', formData);
      onSuccess();
    } catch (err) {
      console.error('Failed to assign package:', err);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Assign Package to Client</h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Client</label>
          <select
            value={formData.clientId}
            onChange={(e) => setFormData({...formData, clientId: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Choose a client...</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.firstName} {client.lastName} - {client.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Package</label>
          <select
            value={formData.packageId}
            onChange={(e) => setFormData({...formData, packageId: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Choose a package...</option>
            {packages.filter(pkg => pkg.isActive).map(pkg => (
              <option key={pkg._id} value={pkg._id}>
                {pkg.name} - ${pkg.price} ({pkg.sessions} sessions)
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.createInvoice}
              onChange={(e) => setFormData({...formData, createInvoice: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm">Create invoice automatically</span>
          </label>
        </div>
        <div className="col-span-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Assign Package
          </button>
        </div>
      </form>
    </div>
  );
};

// Create Invoice Form Component
const CreateInvoiceForm = ({ clients, packages, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    items: [{ description: '', amount: '' }],
    dueDate: ''
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: '' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await axios.post('/billing/invoices', formData);
      console.log('Creating invoice:', formData);
      onSuccess();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="text-lg font-semibold mb-4">Create Invoice</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Invoice Items</label>
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                className="w-32 p-2 border border-gray-300 rounded-md"
                step="0.01"
                required
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 hover:underline text-sm"
          >
            + Add Item
          </button>
        </div>

        <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
          <span className="font-semibold">Total Amount:</span>
          <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageBilling;