
import React from 'react';
import { useCourses } from '@/contexts/CoursesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import StatCard from './StatCard';

// Dashboard para el administrador
const AdminDashboard = () => {
  const { courses } = useCourses();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="edu-heading">Panel de Administrador</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Usuarios Totales" 
          value={45} 
          icon={<Users size={24} />} 
          change="12% este mes"
          isPositive={true}
        />
        <StatCard 
          title="Cursos Activos" 
          value={courses.length} 
          icon={<BookOpen size={24} />}
          change="3 nuevos cursos"
          isPositive={true}
        />
        <StatCard 
          title="Tasa de Finalización" 
          value="78%" 
          icon={<CheckCircle size={24} />} 
          change="5% desde el mes pasado"
          isPositive={true}
        />
        <StatCard 
          title="Tiempo Promedio" 
          value="25 min" 
          icon={<Clock size={24} />}
          change="2 minutos más"
          isPositive={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'Juan Profesor', action: 'creó un nuevo curso', time: 'Hace 2 horas' },
                { user: 'María Estudiante', action: 'completó una tarea', time: 'Hace 3 horas' },
                { user: 'Admin', action: 'añadió un nuevo profesor', time: 'Hace 5 horas' },
                { user: 'Pedro López', action: 'se inscribió en un curso', time: 'Hace 8 horas' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-grow">
                    <p className="font-medium">{activity.user} <span className="font-normal text-gray-600">{activity.action}</span></p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
            <CardDescription>Por rol en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Estudiantes</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Profesores</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <Progress value={20} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Administradores</span>
                  <span className="text-sm font-medium">5%</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
