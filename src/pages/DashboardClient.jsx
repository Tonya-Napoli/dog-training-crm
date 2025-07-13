import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [trainerData, setTrainerData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all client data on component mount
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get current user's full profile
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
            let trainerInfo;
            if (typeof userData.trainer === 'object' && userData.trainer._id) {
              trainerInfo = userData.trainer;
            } else {
              const trainerResponse = await axios.get(`/auth/user/${userData.trainer}`);
              trainerInfo = trainerResponse.data;
            }
            
            setTrainerData({
              id: trainerInfo._id,
              firstName: trainerInfo.firstName,
              lastName: trainerInfo.lastName,
              email: trainerInfo.email,
              phone: trainerInfo.phone || 'Not provided',
              specialties: trainerInfo.specialties || [],
              bio: trainerInfo.bio || 'No bio available',
              hourlyRate: trainerInfo.hourlyRate,
              experience: trainerInfo.experience
            });
          } catch (trainerError) {
            console.error('Error fetching trainer data:', trainerError);
            setTrainerData(null);
          }
        }
        
        // Fetch training sessions
        try {
          const sessionsResponse = await axios.get(`/sessions/client/${userData._id}`);
          setSessions(sessionsResponse.data.sessions || []);
        } catch (sessionError) {
          console.error('Error fetching sessions:', sessionError);
          setSessions([]);
        }
        
        // Fetch client packages
        try {
          const packagesResponse = await axios.get(`/packages/client/${userData._id}`);
          setPackages(packagesResponse.data.packages || []);
        } catch (packageError) {
          console.error('Error fetching packages:', packageError);
          setPackages([]);
        }
        
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

  // Format session type for display
  const formatSessionType = (type) => {
    if (!type) return 'Session';
    return type.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
  };

  // Get status color for sessions
  const getSessionStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'missed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'rescheduled': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate total sessions from packages
  const getTotalSessions = () => {
    return packages.reduce((total, pkg) => total + (pkg.totalSessions || 0), 0);
  };

  // Calculate remaining sessions from packages
  const getRemainingSessions = () => {
    return packages.reduce((total, pkg) => total + (pkg.sessionsRemaining || 0), 0);
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

        {/* Session Summary Cards */}
        {packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{getRemainingSessions()}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Sessions Remaining
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {getRemainingSessions()} of {getTotalSessions()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{sessions.filter(s => s.status === 'completed').length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed Sessions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {sessions.filter(s => s.status === 'completed').length} sessions
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{packages.length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Packages
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {packages.length} package{packages.length !== 1 ? 's' : ''}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Training Sessions
                  </h3>
                  {sessions.length > 5 && (
                    <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                      View All Sessions
                    </button>
                  )}
                </div>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No training sessions yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Sessions will appear here once you start training with your assigned trainer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {formatSessionType(session.sessionType)}
                              </h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSessionStatusColor(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(session.sessionDate).toLocaleDateString()} 
                              {session.scheduledTime && ` at ${session.scheduledTime}`}
                            </p>
                            {session.duration && (
                              <p className="text-xs text-gray-500">{session.duration} minutes</p>
                            )}
                          </div>
                          {session.progressRating && (
                            <div className="flex items-center ml-4">
                              <span className="text-xs text-gray-500 mr-1">Progress:</span>
                              <div className="flex">
                                {[1,2,3,4,5].map((star) => (
                                  <span 
                                    key={star}
                                    className={`text-xs ${star <= session.progressRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {session.goals && session.goals.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500">Goals: {session.goals.join(', ')}</p>
                          </div>
                        )}
                        
                        {session.achievements && session.achievements.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-green-600">✓ {session.achievements.join(', ')}</p>
                          </div>
                        )}
                        
                        {session.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            <strong>Trainer Notes:</strong> {session.notes}
                          </div>
                        )}
                        
                        {session.homework && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <strong>Homework:</strong> {session.homework}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Training Packages Card */}
            {packages.length > 0 && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Your Training Packages
                  </h3>
                  
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <div key={pkg._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{pkg.packageName}</h4>
                            <p className="text-sm text-gray-600">
                              {pkg.sessionsRemaining} of {pkg.totalSessions} sessions remaining
                            </p>
                            {pkg.expirationDate && (
                              <p className="text-xs text-gray-500">
                                Expires: {new Date(pkg.expirationDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-600 rounded-full"
                                style={{ 
                                  width: `${(pkg.sessionsRemaining / pkg.totalSessions) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Trainer Info & Actions */}
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
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No trainer assigned yet</p>
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
                  <button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50"
                    disabled={getRemainingSessions() === 0}
                  >
                    Schedule Session
                    {getRemainingSessions() === 0 && (
                      <span className="block text-xs mt-1 opacity-75">No sessions remaining</span>
                    )}
                  </button>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                    View Progress Report
                  </button>
                  
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-sm">
                    Update Dog Info
                  </button>
                  
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm">
                    Purchase Package
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