
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ProfesorDashboard from '@/components/dashboard/ProfesorDashboard';
import EstudianteDashboard from '@/components/dashboard/EstudianteDashboard';

// Componente Dashboard principal
const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser?.role === 'admin' && <AdminDashboard />}
        {currentUser?.role === 'profesor' && <ProfesorDashboard />}
        {currentUser?.role === 'estudiante' && <EstudianteDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
