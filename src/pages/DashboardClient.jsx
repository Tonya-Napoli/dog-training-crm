import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
//import axios from '../axios';
import clientDataMock from '../mocks/ClientDataMock';
import dogDataMock from '../mocks/DogDataMock';
import trainingDataMock from '../mocks/TrainingDataMock';
import { employeeDataMock } from '../mocks/EmployeeDataMock';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [dogData, setDogData] = useState(null);
  const [trainerData, setTrainerData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch client data on component mount
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // For development, use mock data from the mocks folder
        // Find client data matching the current user
        const mockClient = clientDataMock.find(c => c.clientId === 'client1') || clientDataMock[0];
        
        // Find dog data for this client
        const mockDog = dogDataMock.find(d => d.ownerId === mockClient.clientId);
        
        // Find trainer data for this client
        const mockTrainer = employeeDataMock.find(t => t.employeeId === mockClient.trainerId);
        
        // Find training sessions for this client
        const mockTrainingData = trainingDataMock.find(t => t.clientId === mockClient.clientId);
        const mockSessions = mockTrainingData ? mockTrainingData.sessions : [];
        
        // Set the data with a small delay to simulate API call
        setTimeout(() => {
          setClientData({
            name: mockClient.name,
            email: mockClient.contactInfo.email,
            phone: mockClient.contactInfo.phone,
            address: {
              street: '123 Main St',
              city: 'Melbourne',
              state: 'FL',
              zipCode: '32904'
            }
          });
          
          if (mockDog) {
            setDogData({
              name: mockDog.name,
              breed: mockDog.breed,
              age: `${mockDog.age} years`,
              trainingGoals: ['Basic Obedience', 'Leash Training'],
              vaccinations: mockDog.vaccinations || [
                { vaccine: 'Rabies', date: '2024-03-15', status: 'Up-to-date' },
                { vaccine: 'Distemper', date: '2024-01-10', status: 'Up-to-date' }
              ]
            });
          }
          
          if (mockTrainer) {
            setTrainerData({
              name: mockTrainer.name,
              email: mockTrainer.contactInfo.email,
              phone: mockTrainer.contactInfo.phone,
              specialties: ['Basic Obedience', 'Behavior Modification']
            });
          }
          
          const formattedSessions = mockSessions.map((session, index) => ({
            id: index + 1,
            date: session.date,
            time: '10:00 AM',
            status: session.status,
            topic: session.topic
          }));
          
          setSessions(formattedSessions);
          setLoading(false);
        }, 500);
        
        // Uncomment for production with real API
        /*
        // Get client details
        const clientResponse = await axios.get(`/clients/${user.id}`);
        setClientData(clientResponse.data);
        
        // Get dog details
        const dogResponse = await axios.get(`/clients/${user.id}/dogs`);
        setDogData(dogResponse.data);
        
        // Get assigned trainer
        const trainerResponse = await axios.get(`/clients/${user.id}/trainer`);
        setTrainerData(trainerResponse.data);
        
        // Get training sessions
        const sessionsResponse = await axios.get(`/clients/${user.id}/sessions`);
        setSessions(sessionsResponse.data);
        
        setLoading(false);
        */
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load your information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-6">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Client Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-heading">My Information</h2>
          {clientData && (
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {clientData.name}</p>
              <p><span className="font-medium">Email:</span> {clientData.email}</p>
              <p><span className="font-medium">Phone:</span> {clientData.phone}</p>
              <div className="pt-2">
                <p className="font-medium">Address:</p>
                <p>{clientData.address.street}</p>
                <p>{clientData.address.city}, {clientData.address.state} {clientData.address.zipCode}</p>
              </div>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Update Information
              </button>
            </div>
          )}
        </div>
        
        {/* Dog Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-heading">My Dog</h2>
          {dogData && (
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {dogData.name}</p>
              <p><span className="font-medium">Breed:</span> {dogData.breed}</p>
              <p><span className="font-medium">Age:</span> {dogData.age}</p>
              <div className="pt-2">
                <p className="font-medium">Training Goals:</p>
                <ul className="list-disc pl-5">
                  {dogData.trainingGoals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2">
                <p className="font-medium">Vaccinations:</p>
                <ul className="text-sm">
                  {dogData.vaccinations.map((vax, index) => (
                    <li key={index} className="flex justify-between pb-1">
                      <span>{vax.vaccine}</span>
                      <span className={vax.status === 'Up-to-date' ? 'text-green-600' : 'text-red-600'}>
                        {vax.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Update Dog Info
              </button>
            </div>
          )}
        </div>
        
        {/* Trainer Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-heading">My Trainer</h2>
          {trainerData ? (
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {trainerData.name}</p>
              <p><span className="font-medium">Email:</span> {trainerData.email}</p>
              <p><span className="font-medium">Phone:</span> {trainerData.phone}</p>
              <div className="pt-2">
                <p className="font-medium">Specialties:</p>
                <ul className="list-disc pl-5">
                  {trainerData.specialties.map((specialty, index) => (
                    <li key={index}>{specialty}</li>
                  ))}
                </ul>
              </div>
              <button className="mt-4 bg-primary hover:bg-accent-cyan text-white px-4 py-2 rounded-md text-sm">
                Contact Trainer
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No trainer assigned yet</p>
              <p className="text-sm text-gray-400 mt-2">An administrator will assign a trainer to you soon</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Training Sessions Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-heading">My Training Schedule</h2>
        {sessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2 text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-500">Time</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-500">Topic</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-4 py-3">{session.date}</td>
                    <td className="px-4 py-3">{session.time}</td>
                    <td className="px-4 py-3">{session.topic}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {session.status !== 'Completed' && (
                        <button className="text-red-500 hover:text-red-700 text-sm">
                          Reschedule
                        </button>
                      )}
                      {session.status === 'Completed' && (
                        <button className="text-blue-500 hover:text-blue-700 text-sm">
                          View Notes
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No training sessions scheduled yet</p>
            <p className="text-sm text-gray-400 mt-2">Your assigned trainer will set up your first session soon</p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button className="bg-primary hover:bg-accent-cyan text-white px-4 py-2 rounded-md text-sm">
            Request New Session
          </button>
        </div>
      </div>
      
      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-heading">Training Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Basic Obedience</span>
              <span className="text-sm font-medium">70%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Leash Training</span>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Socialization</span>
              <span className="text-sm font-medium">30%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t pt-4">
          <h3 className="font-medium mb-2">Trainer Notes</h3>
          <p className="text-gray-600 text-sm italic">
            "Buddy is making excellent progress with basic commands. He's very responsive to treats and praise. 
            We need to continue working on leash reactivity when seeing other dogs."
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;