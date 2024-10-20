
const trainingDataMock = [
    {
      clientId: 'client1',
      dogName: 'Buddy',
      trainerId: 'trainer1',
      sessions: [
        { date: '2024-05-01', topic: 'Basic Commands', status: 'Completed' },
        { date: '2024-05-08', topic: 'Advanced Commands', status: 'Pending' },
      ],
      progress: {
        obedience: '80%',
        agility: '60%',
      },
      billing: {
        totalEarnings: 500,
        outstanding: 100,
      },
    },
    {
      clientId: 'client2',
      dogName: 'Max',
      trainerId: 'trainer1',
      sessions: [
        { date: '2024-05-02', topic: 'Obedience Training', status: 'Completed' },
        { date: '2024-05-09', topic: 'Agility Training', status: 'Pending' },
      ],
      progress: {
        obedience: '90%',
        agility: '70%',
      },
      billing: {
        totalEarnings: 600,
        outstanding: 50,
      },
    },
  ];
  
  export default trainingDataMock;
  