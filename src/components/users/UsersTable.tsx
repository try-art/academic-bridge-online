
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

// Definición de tipo para perfiles de usuario
export interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'profesor' | 'estudiante';
  avatar: string | null;
}

interface UsersTableProps {
  profiles: Profile[];
  loading: boolean;
}

export const UsersTable: React.FC<UsersTableProps> = ({ profiles, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableCaption>Lista de usuarios registrados en el sistema</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              </TableCell>
            </TableRow>
          ) : profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                No hay usuarios registrados
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {profile.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={profile.name || ''} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600">
                          {profile.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <span>{profile.name}</span>
                  </div>
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      profile.role === 'profesor' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`
                  }>
                    {profile.role === 'admin' ? 'Administrador' : 
                     profile.role === 'profesor' ? 'Profesor' : 'Estudiante'}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
