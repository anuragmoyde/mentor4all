
import React from 'react';
import { Loader2 } from 'lucide-react';

const DashboardLoading: React.FC = () => {
  return (
    <div className="container mx-auto py-16 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <div className="text-lg font-medium">Loading authentication...</div>
      <p className="text-muted-foreground mt-2">Please wait while we authenticate your account</p>
    </div>
  );
};

export default DashboardLoading;
