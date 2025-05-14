
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Book, 
  Calendar, 
  MessageSquare, 
  User, 
  Users, 
  FileText, 
  CheckSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  if (!currentUser) return null;

  const userInitials = currentUser.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  const adminLinks = [
    { to: '/dashboard', icon: <FileText size={20} />, text: 'Dashboard' },
    { to: '/usuarios', icon: <Users size={20} />, text: 'Usuarios' },
    { to: '/cursos', icon: <Book size={20} />, text: 'Cursos' },
    { to: '/reportes', icon: <CheckSquare size={20} />, text: 'Reportes' },
  ];

  const profesorLinks = [
    { to: '/dashboard', icon: <FileText size={20} />, text: 'Dashboard' },
    { to: '/mis-cursos', icon: <Book size={20} />, text: 'Mis Cursos' },
    { to: '/tareas', icon: <CheckSquare size={20} />, text: 'Tareas' },
    { to: '/calendario', icon: <Calendar size={20} />, text: 'Calendario' },
    { to: '/mensajes', icon: <MessageSquare size={20} />, text: 'Mensajes' },
  ];

  const estudianteLinks = [
    { to: '/dashboard', icon: <FileText size={20} />, text: 'Dashboard' },
    { to: '/mis-cursos', icon: <Book size={20} />, text: 'Mis Cursos' },
    { to: '/tareas', icon: <CheckSquare size={20} />, text: 'Tareas' },
    { to: '/calendario', icon: <Calendar size={20} />, text: 'Calendario' },
    { to: '/mensajes', icon: <MessageSquare size={20} />, text: 'Mensajes' },
  ];

  let links;
  switch (currentUser.role) {
    case 'admin':
      links = adminLinks;
      break;
    case 'profesor':
      links = profesorLinks;
      break;
    case 'estudiante':
      links = estudianteLinks;
      break;
    default:
      links = [];
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="text-education-blue text-xl font-bold">
                <span className="text-education-green">Edu</span>App
              </div>
            </Link>
          </div>

          {/* Enlaces de navegación para desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "edu-nav-link text-gray-600",
                  location.pathname === link.to && "active"
                )}
              >
                {link.icon}
                {link.text}
              </Link>
            ))}
          </div>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-3">
            {/* Botón para móvil */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMenu}
                aria-label="Menú principal"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/perfil" className="flex items-center">
                <Avatar>
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Cerrar sesión"
                className="text-gray-500 hover:text-red-500"
              >
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "edu-nav-link text-gray-600 block",
                  location.pathname === link.to && "active"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  {link.icon}
                  <span className="ml-2">{link.text}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
