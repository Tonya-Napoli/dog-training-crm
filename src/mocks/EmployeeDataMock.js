const employeeDataMock = [
    {
      employeeId: 'emp1',
      name: 'John Doe',
      role: 'Trainer',
      contactInfo: {
        email: 'john.doe@example.com',
        phone: '123-456-7890',
      },
      assignedClients: ['client1', 'client2'],
    },
    {
      employeeId: 'emp2',
      name: 'Jane Smith',
      role: 'Trainer',
      contactInfo: {
        email: 'jane.smith@example.com',
        phone: '987-654-3210',
      },
      assignedClients: ['client3'],
    },
    {
      employeeId: 'emp3',
      name: 'Alice Johnson',
      role: 'Admin',
      contactInfo: {
        email: 'alice.johnson@example.com',
        phone: '555-123-4567',
      },
      assignedClients: [],
    },
  ];
  
  export { employeeDataMock } 