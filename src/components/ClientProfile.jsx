import React from 'react';

const ClientProfile = ({ match }) => {
  const clientId = match.params.id;

  return (
    <div>
      <h1>Client Profile: {clientId}</h1>
      {/* Add details about the client and their dog here */}
    </div>
  );
};

export default ClientProfile;
