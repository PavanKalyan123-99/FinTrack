import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-mainBg flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-royalBlue text-white flex items-center justify-center shadow-lg shadow-royalBlue/20 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-secondaryText">
          Authenticating FinTrack session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
