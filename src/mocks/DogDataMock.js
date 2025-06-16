const dogDataMock = [
    {
      _id: 'dog1',
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      ownerId: 'client1',
      vaccinations: [
        {
          vaccine: 'Rabies',
          date: '2023-09-01',
          status: 'Up-to-date',
        },
        {
          vaccine: 'Distemper',
          date: '2024-03-15',
          status: 'Due Soon',
        },
      ],
      healthNotes: 'No known allergies, healthy weight.',
    },

    { 
      _id: 'dog2',
      name: 'Rex',
      breed: 'German Shepherd',
      age: 5,
      ownerId: 'client2',
      vaccinations: [
        {
          vaccine: 'Rabies',
          date: '2024-01-10',
          status: 'Up-to-date',
        },
        {
          vaccine: 'Bordetella',
          date: '2023-11-20',
          status: 'Expired',
        },
      ],
      healthNotes: 'Slight hip dysplasia, requires joint supplements.',
    },
    {
      _id: 'dog3',
      name: 'Max',
      breed: 'Border Collie',
      age: 2,
      ownerId: 'client3',
      vaccinations: [
        {
          vaccine: 'Rabies',
          date: '2024-05-20',
          status: 'Up-to-date',
        },
        {
          vaccine: 'Parvo',
          date: '2024-04-10',
          status: 'Up-to-date',
        },
      ],
      healthNotes: 'Very active, requires a high-protein diet.',
    },
  ];
  
  export default dogDataMock;
  