
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Definir los tipos para los roles y usuarios
export type UserRole = 'admin' | 'profesor' | 'estudiante';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Mock de usuarios para demostración
const MOCK_USERS: Record<string, { user: User, password: string }> = {
  'admin@eduapp.com': {
    user: {
      id: '1',
      name: 'Administrador',
      email: 'admin@eduapp.com',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    password: 'admin123'
  },
  'profesor@eduapp.com': {
    user: {
      id: '2',
      name: 'Juan Profesor',
      email: 'profesor@eduapp.com',
      role: 'profesor',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=profesor'
    },
    password: 'profesor123'
  },
  'estudiante@eduapp.com': {
    user: {
      id: '3',
      name: 'María Estudiante',
      email: 'estudiante@eduapp.com',
      role: 'estudiante',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=estudiante'
    },
    password: 'estudiante123'
  }
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya hay una sesión activa en localStorage
    const storedUser = localStorage.getItem('eduApp_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user', error);
        localStorage.removeItem('eduApp_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Simulamos una pequeña demora como si fuera una petición a una API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userRecord = MOCK_USERS[email.toLowerCase()];
      if (userRecord && userRecord.password === password) {
        setCurrentUser(userRecord.user);
        localStorage.setItem('eduApp_user', JSON.stringify(userRecord.user));
        toast.success(`Bienvenido, ${userRecord.user.name}`);
        return true;
      } else {
        toast.error('Credenciales inválidas');
        return false;
      }
    } catch (error) {
      console.error('Error during login', error);
      toast.error('Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('eduApp_user');
    toast.info('Has cerrado sesión');
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
