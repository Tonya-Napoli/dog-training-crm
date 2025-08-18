// src/components/admin/BillingTab.jsx
import React from 'react';

const BillingTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Billing & Payments</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600">Billing and payment tracking features coming soon...</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">$0.00</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Paid This Month</h3>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900">Outstanding</h3>
            <p className="text-2xl font-bold text-yellow-600">$0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingTab;