
import React from 'react';

const DashboardLoading: React.FC = () => {
  return (
    <div className="container mx-auto py-16 flex justify-center">
      <div className="animate-pulse">Loading authentication...</div>
    </div>
  );
};

export default DashboardLoading;
