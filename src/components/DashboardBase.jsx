import React from 'react';

const DashboardBase = ({ role, children }) => {
  const titles = {
    admin: 'Admin Dashboard',
    client: 'Client Dashboard',
    trainer: 'Trainer Dashboard',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white p-4 text-center font-bold text-2xl">
        {titles[role]}
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardBase;
