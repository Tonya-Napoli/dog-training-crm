import React from 'react';
import { Link } from 'react-router-dom';

const clients = [
  { id: 1, name: 'John Doe', dogName: 'Buddy' },//fix formatting
  { id: 2, name: 'Jane Smith', dogName: 'Rex' }
];

const ClientList = () => (
  <div>
    <h1>Clients</h1>
    <ul>
      {clients.map(client => (
        <li key={client.id}>
          <Link to={`/client/${client.id}`}>
            {client.name} - {client.dogName}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default ClientList;
