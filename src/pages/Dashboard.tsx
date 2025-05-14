
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CoursesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Users, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

// Componente para mostrar estadísticas
const StatCard = ({ title, value, icon, change, isPositive }: { 
  title: string, 
  value: string | number, 
  icon: React.ReactNode,
  change?: string,
  isPositive?: boolean
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className={`flex items-center mt-2 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span className="ml-1">{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${isPositive === undefined ? 'bg-blue-100 text-blue-600' : isPositive ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
