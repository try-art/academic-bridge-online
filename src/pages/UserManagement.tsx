
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UsersTable, Profile } from '@/components/users/UsersTable';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Cargar la lista de usuarios
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }
      
      setProfiles(data as Profile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Manejar la creación exitosa de un usuario
  const handleUserCreated = () => {
    setDialogOpen(false);
    // Esperamos un poco para que el trigger tenga tiempo de ejecutarse
    setTimeout(() => {
      fetchProfiles();
    }, 1500);
  };

  // Solo mostrar esta página si el usuario es administrador
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Administración de Usuarios</h1>
          
          <CreateUserDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen} 
            onUserCreated={handleUserCreated} 
          />
        </div>

        <UsersTable profiles={profiles} loading={loading} />
      </main>
    </div>
  );
};

export default UserManagement;
