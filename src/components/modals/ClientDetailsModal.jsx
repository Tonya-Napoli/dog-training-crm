import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

const ClientDetailsModal = ({ client, isOpen, onClose }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !client) return;

    // Fetch additional client data including billing, training, etc.
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        
        // Mock client-specific data based on client ID
        const mockClientDetails = {
          billing: {
            totalSpent: client._id.endsWith('1') ? 1250 : client._id.endsWith('2') ? 980 : 1450,
            outstanding: client._id.endsWith('1') ? 150 : client._id.endsWith('2') ? 0 : 200,
            lastPayment: client._id.endsWith('1') ? '2024-07-15' : client._id.endsWith('2') ? '2024-07-20' : '2024-07-10',
            nextDue: client._id.endsWith('1') ? '2024-08-15' : client._id.endsWith('2') ? '2024-08-20' : '2024-08-10'
          },
          trainingPackages: client._id.endsWith('1') ? [
            { name: 'Basic Obedience Package', sessions: 8, completed: 6, price: 600 },
            { name: 'Advanced Training Package', sessions: 6, completed: 2, price: 750 }
          ] : client._id.endsWith('2') ? [
            { name: 'Puppy Training Package', sessions: 10, completed: 8, price: 500 },
            { name: 'Socialization Package', sessions: 4, completed: 4, price: 300 }
          ] : [
            { name: 'Behavior Modification Package', sessions: 12, completed: 9, price: 900 },
            { name: 'Advanced Obedience Package', sessions: 8, completed: 5, price: 650 }
          ],
          trainingProgress: {
            basicCommands: client._id.endsWith('1') ? 85 : client._id.endsWith('2') ? 92 : 78,
            leashTraining: client._id.endsWith('1') ? 70 : client._id.endsWith('2') ? 88 : 85,
            socialSkills: client._id.endsWith('1') ? 75 : client._id.endsWith('2') ? 95 : 60,
            behaviorIssues: client._id.endsWith('1') ? 80 : client._id.endsWith('2') ? 90 : 45
          },
          recentInvoices: client._id.endsWith('1') ? [
            { id: 'INV-001', date: '2024-07-15', amount: 150, status: 'Paid', description: 'Basic Training Sessions' },
            { id: 'INV-002', date: '2024-06-15', amount: 200, status: 'Paid', description: 'Advanced Training Package' },
            { id: 'INV-003', date: '2024-08-15', amount: 150, status: 'Pending', description: 'Monthly Training Fee' }
          ] : client._id.endsWith('2') ? [
            { id: 'INV-004', date: '2024-07-20', amount: 100, status: 'Paid', description: 'Puppy Training Sessions' },
            { id: 'INV-005', date: '2024-06-20', amount: 80, status: 'Paid', description: 'Socialization Package' },
            { id: 'INV-006', date: '2024-05-20', amount: 120, status: 'Paid', description: 'Initial Assessment' }
          ] : [
            { id: 'INV-007', date: '2024-07-10', amount: 200, status: 'Paid', description: 'Behavior Modification' },
            { id: 'INV-008', date: '2024-06-10', amount: 175, status: 'Paid', description: 'Advanced Training' },
            { id: 'INV-009', date: '2024-08-10', amount: 200, status: 'Overdue', description: 'Monthly Training Fee' }
          ]
        };

        // Simulate API delay
        setTimeout(() => {
          setClientData(mockClientDetails);
          setLoading(false);
        }, 300);

        // TODO: Replace with real API calls in production
        
      } catch (error) {
        console.error('Error fetching client details:', error);
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [client, isOpen]);

  if (loading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Client Details - ${client?.firstName} ${client?.lastName}`}
      maxWidth="max-w-4xl"
    >
      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contact Information Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-lg">Contact Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{client.firstName} {client.lastName}</span>
            </div>
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
              <span className={`px-2 py-1 rounded-full text-xs ${
                client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {client.address && (
              <div className="pt-2 border-t">
                <span className="text-gray-600">Address:</span>
                <div className="mt-1">
                  <p>{client.address.street}</p>
                  <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dog Information Card */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-lg">Dog Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Dog Name:</span>
              <span className="font-medium">{client.dogName || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Breed:</span>
              <span className="font-medium">{client.dogBreed || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{client.dogAge || 'Not specified'}</span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Training Goals:</span>
              <div className="mt-1">
                {client.trainingGoals?.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {client.trainingGoals.map((goal, index) => (
                      <li key={index}>{goal.replace(/([A-Z])/g, ' $1').trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">None specified</p>
                )}
              </div>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">Trainer:</span>
              <div className="mt-1">
                {client.trainer ? (
                  <span className="font-medium">
                    {client.trainer.firstName} {client.trainer.lastName}
                  </span>
                ) : (
                  <span className="text-gray-500">No trainer assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Summary Card */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-lg">Billing Summary</h4>
          {clientData?.billing ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent:</span>
                <span className="font-medium text-blue-600">${clientData.billing.totalSpent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding:</span>
                <span className={`font-medium ${
                  clientData.billing.outstanding > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${clientData.billing.outstanding}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Payment:</span>
                <span className="font-medium">{new Date(clientData.billing.lastPayment).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Due:</span>
                <span className="font-medium">{new Date(clientData.billing.nextDue).toLocaleDateString()}</span>
              </div>
              <div className="pt-2 border-t">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  clientData.billing.outstanding === 0 
                    ? 'bg-green-100 text-green-800' 
                    : clientData.billing.outstanding > 100 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {clientData.billing.outstanding === 0 
                    ? 'Paid Up' 
                    : clientData.billing.outstanding > 100 
                    ? 'Payment Overdue' 
                    : 'Payment Due'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No billing information available</p>
          )}
        </div>

        {/* Training Packages Card */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-lg">Training Packages</h4>
          {clientData?.trainingPackages ? (
            <div className="space-y-3">
              {clientData.trainingPackages.map((pkg, index) => (
                <div key={index} className="border-b border-green-200 pb-2 last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{pkg.name}</span>
                    <span className="text-sm font-semibold text-green-600">${pkg.price}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Sessions: {pkg.completed}/{pkg.sessions}</span>
                    <span>{Math.round((pkg.completed / pkg.sessions) * 100)}% Complete</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(pkg.completed / pkg.sessions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No training packages</p>
          )}
        </div>

        {/* Advanced Behavior Training (Progress) Card */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-lg">Training Progress</h4>
          {clientData?.trainingProgress ? (
            <div className="space-y-3">
              {Object.entries(clientData.trainingProgress).map(([skill, progress]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        progress >= 80 ? 'bg-green-500' : 
                        progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-600">
                  Overall Progress: {Math.round(
                    Object.values(clientData.trainingProgress).reduce((a, b) => a + b, 0) / 
                    Object.values(clientData.trainingProgress).length
                  )}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No training progress data</p>
          )}
        </div>

        {/* Recent Invoices Card */}
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-lg">Recent Invoices</h4>
          {clientData?.recentInvoices ? (
            <div className="space-y-2">
              {clientData.recentInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="border-b border-orange-200 pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{invoice.id}</p>
                      <p className="text-xs text-gray-600">{invoice.description}</p>
                      <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${invoice.amount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {clientData.recentInvoices.length > 5 && (
                <p className="text-xs text-gray-500 pt-2">
                  ... and {clientData.recentInvoices.length - 5} more invoices
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No invoices found</p>
          )}
        </div>
      </div>

      {/* Registration Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Registration Information</h4>
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
            <p className="text-sm mt-1 p-2 bg-white rounded border">
              {client.adminNotes.registrationNotes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
        <button
          onClick={() => {
            // TODO: Add edit functionality
            alert('Edit functionality coming soon!');
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          Edit Client
        </button>
        <button
          onClick={() => {
            // TODO: Add generate invoice functionality
            alert('Generate invoice functionality coming soon!');
          }}
          className="px-4 py-2 text-green-600 border border-green-600 rounded-md hover:bg-green-50"
        >
          Generate Invoice
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
};

export default ClientDetailsModal;