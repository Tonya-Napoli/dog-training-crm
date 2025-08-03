// src/components/admin/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900 text-blue-600 text-blue-700',
    green: 'bg-green-50 text-green-900 text-green-600 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-900 text-yellow-600 text-yellow-700',
    purple: 'bg-purple-50 text-purple-900 text-purple-600 text-purple-700'
  };

  const [bgClass, titleClass, valueClass, subtitleClass] = colorClasses[color].split(' ');

  return (
    <div className={`border rounded-lg p-4 ${bgClass}`}>
      <h3 className={`font-semibold mb-2 ${titleClass}`}>{title}</h3>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className={`text-sm mt-1 ${subtitleClass}`}>{subtitle}</p>
    </div>
  );
};

export default StatsCard;