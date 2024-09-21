import React from 'react';
import { Line } from 'react-chartjs-2';

const TrainingProgress = () => {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Progress',
        data: [65, 59, 80, 81],
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div>
      <h2>Training Progress</h2>
      <Line data={data} />
    </div>
  );
};

export default TrainingProgress;
