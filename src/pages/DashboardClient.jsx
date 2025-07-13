import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [trainerData, setTrainerData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all client data on component mount
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get current user's full profile with trainer populated
        const userResponse = await axios.get('/auth/user');
        const userData = userResponse.data;
        
        // Set client data from user profile
        setClientData({
          id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone || 'Not provided',
          address: userData.address || {
            street: 'Not provided',
            city: 'Not provided',
            state: 'Not provided',
            zipCode: 'Not provided'
          },
          emergencyContact: userData.emergencyContact || {
            name: 'Not provided',
            relationship: 'Not provided',
            phone: 'Not provided'
          },
          dog: {
            name: userData.dogName || 'Not provided',
            breed: userData.dogBreed || 'Not provided',
            age: userData.dogAge || 'Not provided'
          },
          trainingGoals: userData.trainingGoals || [],
          registrationDate: userData.created,
          isActive: userData.isActive
        });
        
        // Get trainer data if assigned
        if (userData.trainer) {
          try {
            // If trainer is already populated in user data
            if (typeof userData.trainer === 'object' && userData.trainer._id) {
              setTrainerData({
                id: userData.trainer._id,
                firstName: userData.trainer.firstName,
                lastName: userData.trainer.lastName,
                email: userData.trainer.email,
                phone: userData.trainer.phone || 'Not provided',
                specialties: userData.trainer.specialties || [],
                bio: userData.trainer.bio || 'No bio available',
                hourlyRate: userData.trainer.hourlyRate,
                experience: userData.trainer.experience
              });
            } else {
              // If only trainer ID is provided, fetch trainer details
              const trainerResponse = await axios.get(`/auth/user/${userData.trainer}`);
              const trainer = trainerResponse.data;
              
              setTrainerData({
                id: trainer._id,
                firstName: trainer.firstName,
                lastName: trainer.lastName,
                email: trainer.email,
                phone: trainer.phone || 'Not provided',
                specialties: trainer.specialties || [],
                bio: trainer.bio || 'No bio available',
                hourlyRate: trainer.hourlyRate,
                experience: trainer.experience
              });
            }
          } catch (trainerError) {
            console.error('Error fetching trainer data:', trainerError);
            setTrainerData(null);
          }
        }
        
        // TODO: Fetch training sessions when session API is implemented
        // For now, we'll set empty sessions
        setSessions([]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError(err.response?.data?.message || 'Failed to load your information. Please try again later.');
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user]);

  // Format training goals for display
  const formatTrainingGoals = (goals) => {
    if (!goals || goals.length === 0) return 'No goals specified';
    
    return goals.map(goal => {
      // Convert camelCase to readable format
      return goal.replace(/([A-Z])/g, ' $1')
                 .replace(/^./, str => str.toUpperCase())
                 .trim();
    }).join(', ');
  };

  // Format specialties for display
  const formatSpecialties = (specialties) => {
    if (!specialties || specialties.length === 0) return 'No specialties listed';
    
    return specialties.map(specialty => {
      return specialty.replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No client data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {clientData.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your training progress and information.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Client & Dog Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Client Information Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Details</h4>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-900">
                        {clientData.firstName} {clientData.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{clientData.email}</p>
                      <p className="text-sm text-gray-600">{clientData.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <div className="mt-1">
                      <p className="text-sm text-gray-900">{clientData.address.street}</p>
                      <p className="text-sm text-gray-600">
                        {clientData.address.city}, {clientData.address.state} {clientData.address.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Emergency Contact</h4>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-900">
                        {clientData.emergencyContact.name} ({clientData.emergencyContact.relationship})
                      </p>
                      <p className="text-sm text-gray-600">{clientData.emergencyContact.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Account Status</h4>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        clientData.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clientData.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Member since {new Date(clientData.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dog Information Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Dog Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p className="mt-1 text-sm text-gray-900">{clientData.dog.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Breed</h4>
                    <p className="mt-1 text-sm text-gray-900">{clientData.dog.breed}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Age</h4>
                    <p className="mt-1 text-sm text-gray-900">{clientData.dog.age}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Training Goals</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatTrainingGoals(clientData.trainingGoals)}
                  </p>
                </div>
              </div>
            </div>

            {/* Training Sessions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Training Sessions
                </h3>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No training sessions recorded yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Sessions will appear here once you start training with your assigned trainer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{session.topic}</h4>
                            <p className="text-sm text-gray-600">{session.date} at {session.time}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'Completed' 
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'Upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trainer Info */}
          <div className="space-y-6">
            
            {/* Trainer Information Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Your Trainer
                </h3>
                
                {trainerData ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Name</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {trainerData.firstName} {trainerData.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-900">{trainerData.email}</p>
                        <p className="text-sm text-gray-600">{trainerData.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Specialties</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatSpecialties(trainerData.specialties)}
                      </p>
                    </div>
                    
                    {trainerData.experience && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Experience</h4>
                        <p className="mt-1 text-sm text-gray-900">{trainerData.experience}</p>
                      </div>
                    )}
                    
                    {trainerData.hourlyRate && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Rate</h4>
                        <p className="mt-1 text-sm text-gray-900">${trainerData.hourlyRate}/hour</p>
                      </div>
                    )}
                    
                    {trainerData.bio && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">About</h4>
                        <p className="mt-1 text-sm text-gray-900">{trainerData.bio}</p>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                        Contact Trainer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No trainer assigned yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Please contact our team to get assigned a trainer.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
                    Schedule Session
                  </button>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                    View Progress
                  </button>
                  
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm">
                    Update Dog Info
                  </button>
                  
                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;