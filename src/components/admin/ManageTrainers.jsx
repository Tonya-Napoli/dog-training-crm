import React, { useState, useEffect } from 'react';
import axios from '../../axios';

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTrainer, setExpandedTrainer] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);

  // Specialty labels mapping for better display
  const specialtyLabels = {
    basicObedience: 'Basic Obedience',
    puppyTraining: 'Puppy Training',
    behaviorModification: 'Behavior Modification',
    aggressionManagement: 'Aggression Management',
    anxietyReduction: 'Anxiety Reduction',
    serviceAnimal: 'Service Animal Training',
    leashManners: 'Leash Manners',
    houseTraining: 'House Training',
    socialization: 'Socialization',
    tricks: 'Trick Training',
    agilityTraining: 'Agility Training',
    therapyDog: 'Therapy Dog Training',
    competitionTraining: 'Competition Training',
    searchAndRescue: 'Search and Rescue',
    protectionTraining: 'Protection Training',
    fearRehabiliation: 'Fear Rehabilitation',
    reactiveeDogTraining: 'Reactive Dog Training',
    puppySocialization: 'Puppy Socialization',
    advancedObedience: 'Advanced Obedience',
    sportDogTraining: 'Sport Dog Training'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trainersRes, clientsRes] = await Promise.all([
        axios.get('/auth/users/trainer'),
        axios.get('/auth/users/client')
      ]);
      
      setTrainers(trainersRes.data);
      setClients(clientsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const toggleTrainerActive = async (trainerId) => {
    try {
      const response = await axios.put(`/auth/user/${trainerId}/toggle-active`);
      
      // Update the trainer in our local state
      setTrainers(trainers.map(trainer => 
        trainer._id === trainerId 
          ? { ...trainer, isActive: response.data.user.isActive }
          : trainer
      ));
      
      alert(response.data.message);
    } catch (err) {
      console.error('Error toggling trainer status:', err);
      alert('Failed to update trainer status');
    }
  };

  const fetchTrainerClients = async (trainerId) => {
    try {
      const response = await axios.get(`/auth/trainer/${trainerId}/clients`);
      return response.data;
    } catch (err) {
      console.error('Error fetching trainer clients:', err);
      return [];
    }
  };

  const handleExpandTrainer = async (trainerId) => {
    if (expandedTrainer === trainerId) {
      setExpandedTrainer(null);
    } else {
      setExpandedTrainer(trainerId);
      const clients = await fetchTrainerClients(trainerId);
      setTrainers(trainers.map(trainer => 
        trainer._id === trainerId 
          ? { ...trainer, assignedClients: clients }
          : trainer
      ));
    }
  };

  const openAssignModal = (trainer) => {
    setSelectedTrainer(trainer);
    setSelectedClients(trainer.clients || []);
    setAssignModalOpen(true);
  };

  const handleAssignClients = async () => {
    try {
      // Get currently assigned clients
      const currentClients = await fetchTrainerClients(selectedTrainer._id);
      const currentClientIds = currentClients.map(c => c._id);
      
      // Find clients to add and remove
      const clientsToAdd = selectedClients.filter(id => !currentClientIds.includes(id));
      const clientsToRemove = currentClientIds.filter(id => !selectedClients.includes(id));
      
      // Process additions
      for (const clientId of clientsToAdd) {
        await axios.put(`/auth/trainer/${selectedTrainer._id}/assign-client`, { clientId });
      }
      
      // Process removals
      for (const clientId of clientsToRemove) {
        await axios.put(`/auth/trainer/${selectedTrainer._id}/remove-client`, { clientId });
      }
      
      alert('Clients updated successfully');
      setAssignModalOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error assigning clients:', err);
      alert('Failed to update client assignments');
    }
  };

  // Helper function to format availability
  const formatAvailability = (availability) => {
    if (!availability) return 'Not specified';
    const days = Object.entries(availability)
      .filter(([day, available]) => available)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));
    return days.length > 0 ? days.join(', ') : 'No days specified';
  };

  // Helper function to format specialties
  const formatSpecialties = (specialties) => {
    if (!specialties || specialties.length === 0) return 'Not specified';
    return specialties.map(s => specialtyLabels[s] || s).join(', ');
  };

  if (loading) return <div>Loading trainers...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Trainers</h2>
      
      {trainers.length === 0 ? (
        <p>No trainers found</p>
      ) : (
        <div className="space-y-4">
          {trainers.map((trainer) => (
            <div key={trainer._id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {trainer.firstName} {trainer.lastName}
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      trainer.isActive === false
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {trainer.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </h3>
                  <p className="text-gray-600">{trainer.email}</p>
                  <p className="text-gray-600">Phone: {trainer.phone || 'Not provided'}</p>
                  
                  {/* Quick preview info */}
                  <div className="mt-2 text-sm text-gray-500">
                    {trainer.experience && <span>Experience: {trainer.experience} • </span>}
                    {trainer.hourlyRate && <span>Rate: ${trainer.hourlyRate}/hour</span>}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExpandTrainer(trainer._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {expandedTrainer === trainer._id ? 'Hide Details' : 'View Details'}
                  </button>
                  
                  <button
                    onClick={() => openAssignModal(trainer)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Manage Clients
                  </button>
                  
                  <button
                    onClick={() => toggleTrainerActive(trainer._id)}
                    className={`px-3 py-1 rounded ${
                      trainer.isActive === false
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white`}
                  >
                    {trainer.isActive === false ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedTrainer === trainer._id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trainer Information Column */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">Trainer Information:</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-600">Specialties:</span>
                          <p className="text-gray-800">{formatSpecialties(trainer.specialties)}</p>
                        </div>
                        
                        {trainer.certifications && trainer.certifications.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-600">Certifications:</span>
                            <p className="text-gray-800">{trainer.certifications.join(', ')}</p>
                          </div>
                        )}
                        
                        {trainer.experience && (
                          <div>
                            <span className="font-semibold text-gray-600">Experience:</span>
                            <p className="text-gray-800">{trainer.experience}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-semibold text-gray-600">Availability:</span>
                          <p className="text-gray-800">{formatAvailability(trainer.availability)}</p>
                        </div>
                        
                        {trainer.hourlyRate && (
                          <div>
                            <span className="font-semibold text-gray-600">Hourly Rate:</span>
                            <p className="text-gray-800">${trainer.hourlyRate}/hour</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-semibold text-gray-600">Member Since:</span>
                          <p className="text-gray-800">{new Date(trainer.created).toLocaleDateString()}</p>
                        </div>
                        
                        {trainer.bio && (
                          <div className="mt-3">
                            <span className="font-semibold text-gray-600">Bio:</span>
                            <p className="text-gray-800 mt-1">{trainer.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Assigned Clients Column */}
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-700">Assigned Clients:</h4>
                      {trainer.assignedClients && trainer.assignedClients.length > 0 ? (
                        <ul className="space-y-2">
                          {trainer.assignedClients.map(client => (
                            <li key={client._id} className="text-sm">
                              <span className="font-medium">{client.firstName} {client.lastName}</span>
                              <span className="text-gray-600"> - {client.email}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No clients assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Assign Clients Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Assign Clients to {selectedTrainer?.firstName} {selectedTrainer?.lastName}
            </h3>
            
            <div className="space-y-2 mb-4">
              {clients.map(client => (
                <label key={client._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClients([...selectedClients, client._id]);
                      } else {
                        setSelectedClients(selectedClients.filter(id => id !== client._id));
                      }
                    }}
                    className="mr-2"
                  />
                  <span>
                    {client.firstName} {client.lastName} - {client.email}
                    {client.trainer && client.trainer !== selectedTrainer._id && (
                      <span className="text-red-500 text-sm ml-2">
                        (Currently assigned to another trainer)
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignClients}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTrainers;