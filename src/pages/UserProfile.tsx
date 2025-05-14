
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth, User } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CoursesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Book, Calendar, MessageSquare, CheckCircle } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  avatar?: string;
}

const UserProfile = () => {
  const { currentUser } = useAuth();
  const { courses } = useCourses();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una aplicación real, aquí se actualizaría la información en el backend
    toast.success('Perfil actualizado correctamente');
  };

  if (!currentUser) return null;
  
  const userInitials = currentUser.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
  
  const userCoursesCount = courses.filter(course => {
    if (currentUser.role === 'profesor') {
      return course.professorId === currentUser.id;
    } else if (currentUser.role === 'estudiante') {
      return course.students.includes(currentUser.id);
    }
    return false;
  }).length;
  
  const roleText = {
    'admin': 'Administrador',
    'profesor': 'Profesor',
    'estudiante': 'Estudiante'
  }[currentUser.role] || 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="edu-heading">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de información básica */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                <p className="text-gray-600">{roleText}</p>
                
                <div className="w-full mt-6">
                  <div className="flex items-center p-3 border-b">
                    <p className="text-gray-500">Email:</p>
                    <p className="ml-auto font-medium">{currentUser.email}</p>
                  </div>
                  <div className="flex items-center p-3 border-b">
                    <p className="text-gray-500">ID:</p>
                    <p className="ml-auto font-medium">{currentUser.id}</p>
                  </div>
                  <div className="flex items-center p-3">
                    <p className="text-gray-500">Rol:</p>
                    <p className="ml-auto font-medium">{roleText}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de edición */}
          <Card className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Editar Información</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                  <p className="text-xs text-gray-500">El correo electrónico no puede ser modificado</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">URL de Avatar</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar || ''}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/avatar.jpg"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Guardar Cambios</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <Book size={24} />
                </div>
                <h3 className="font-semibold text-lg">{userCoursesCount}</h3>
                <p className="text-gray-500 text-sm">
                  {currentUser.role === 'profesor' ? 'Cursos Impartidos' : 'Cursos Inscritos'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mb-4">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-semibold text-lg">12</h3>
                <p className="text-gray-500 text-sm">Tareas Completadas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                  <Calendar size={24} />
                </div>
                <h3 className="font-semibold text-lg">5</h3>
                <p className="text-gray-500 text-sm">Eventos Próximos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-semibold text-lg">8</h3>
                <p className="text-gray-500 text-sm">Mensajes sin leer</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
