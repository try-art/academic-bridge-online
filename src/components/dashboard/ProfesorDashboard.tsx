
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CoursesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';

// Dashboard para el profesor
const ProfesorDashboard = () => {
  const { currentUser } = useAuth();
  const { courses, tasks } = useCourses();
  
  const professorCourses = courses.filter(course => course.professorId === currentUser?.id);
  const totalStudents = professorCourses.reduce((acc, course) => acc + course.students.length, 0);
  const pendingTasks = tasks.filter(task => 
    professorCourses.some(course => course.id === task.courseId) && 
    task.status === 'pending'
  ).length;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="edu-heading">Panel del Profesor</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Mis Cursos" 
          value={professorCourses.length} 
          icon={<BookOpen size={24} />}
        />
        <StatCard 
          title="Estudiantes Totales" 
          value={totalStudents} 
          icon={<Users size={24} />}
        />
        <StatCard 
          title="Tareas Pendientes" 
          value={pendingTasks} 
          icon={<Clock size={24} />}
        />
        <StatCard 
          title="Próximas Clases" 
          value={3} 
          icon={<Calendar size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mis Cursos</CardTitle>
            <CardDescription>Cursos que estás impartiendo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {professorCourses.map(course => (
                <div key={course.id} className="flex items-center pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-12 rounded-md overflow-hidden mr-4">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <Link to={`/cursos/${course.id}`} className="font-medium hover:text-education-blue">{course.title}</Link>
                    <p className="text-sm text-gray-500">{course.students.length} estudiantes</p>
                  </div>
                  <div className="text-sm text-gray-500">{course.schedule}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Próximas Tareas</CardTitle>
            <CardDescription>Tareas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.filter(task => 
                professorCourses.some(course => course.id === task.courseId) &&
                task.status === 'pending'
              ).slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center pb-4 border-b border-gray-100 last:border-0">
                  <div className="mr-3 p-2 bg-gray-100 rounded-full">
                    <Clock size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      Vence: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              <Link to="/tareas" className="block text-center text-sm text-education-blue hover:underline">
                Ver todas las tareas
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfesorDashboard;
