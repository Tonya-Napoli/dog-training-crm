import React, { useState } from 'react';

const ClientAssignmentForm = ({ trainer, clients, onAssign, onCancel }) => {
  const [selectedClients, setSelectedClients] = useState(
    trainer.clients?.map(c => c._id || c) || []
  );

  const handleToggleClient = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmit = () => {
    onAssign(selectedClients);
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto">
        {clients.map(client => (
          <label key={client._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              checked={selectedClients.includes(client._id)}
              onChange={() => handleToggleClient(client._id)}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium">
                {client.firstName} {client.lastName}
              </span>
              <span className="text-gray-600 ml-2">- {client.email}</span>
              {client.trainer && client.trainer._id !== trainer._id && (
                <span className="text-red-500 text-sm ml-2">
                  (Currently assigned to another trainer)
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ClientAssignmentForm;