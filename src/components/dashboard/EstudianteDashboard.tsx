
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CoursesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, CheckCircle, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';

// Dashboard para el estudiante
const EstudianteDashboard = () => {
  const { currentUser } = useAuth();
  const { courses, tasks } = useCourses();
  
  const studentCourses = courses.filter(course => 
    course.students.includes(currentUser?.id || '')
  );
  
  const studentCoursesIds = studentCourses.map(course => course.id);
  const studentTasks = tasks.filter(task => studentCoursesIds.includes(task.courseId));
  
  const pendingTasks = studentTasks.filter(task => task.status === 'pending');
  const completedTasks = studentTasks.filter(task => task.status === 'completed');
  const completionRate = studentTasks.length > 0 
    ? Math.round((completedTasks.length / studentTasks.length) * 100) 
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="edu-heading">Panel del Estudiante</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Mis Cursos" 
          value={studentCourses.length} 
          icon={<BookOpen size={24} />}
        />
        <StatCard 
          title="Tareas Pendientes" 
          value={pendingTasks.length} 
          icon={<Clock size={24} />}
        />
        <StatCard 
          title="Tareas Completadas" 
          value={completedTasks.length} 
          icon={<CheckCircle size={24} />}
        />
        <StatCard 
          title="Tasa de Finalización" 
          value={`${completionRate}%`} 
          icon={<ArrowUp size={24} />}
          isPositive={completionRate >= 60}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mis Cursos</CardTitle>
            <CardDescription>Cursos en los que estás inscrito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentCourses.map(course => (
                <div key={course.id} className="flex items-center pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-12 rounded-md overflow-hidden mr-4">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <Link to={`/cursos/${course.id}`} className="font-medium hover:text-education-blue">{course.title}</Link>
                    <p className="text-sm text-gray-500">Prof. {course.professorName}</p>
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
              {pendingTasks.slice(0, 3).map(task => (
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

export default EstudianteDashboard;
