
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CoursesContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CourseMaterials from '@/components/course/CourseMaterials';
import CourseCalendar from '@/components/course/CourseCalendar';
import CourseMessages from '@/components/course/CourseMessages';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CourseDetailProps {}

const CourseDetail: React.FC<CourseDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { getCourseById } = useCourses();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        // Primero intentamos obtener el curso del contexto local
        const localCourse = getCourseById(id);
        
        if (localCourse) {
          setCourse(localCourse);
        } else {
          // Si no está en el contexto local, lo intentamos obtener de Supabase
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setCourse(data);
          } else {
            toast.error('Curso no encontrado');
            navigate('/cursos');
          }
        }
      } catch (error) {
        console.error('Error al cargar el curso:', error);
        toast.error('Error al cargar los detalles del curso');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [id, getCourseById, navigate]);

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'profesor' && course?.professorId === currentUser?.id;
  const canEditCourse = isAdmin || isTeacher;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-lg">Cargando detalles del curso...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Curso no encontrado</h2>
            <p className="mt-2 text-gray-600">El curso que intentas ver no existe o no tienes permisos para verlo.</p>
            <Button onClick={() => navigate('/cursos')} className="mt-4">
              Volver a la lista de cursos
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cursos')} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna de información del curso */}
          <div className="md:w-1/3">
            <Card>
              <div className="h-48 overflow-hidden">
                <img 
                  src={course.image || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d"} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                <p className="text-gray-700 mb-4">{course.description}</p>
                <div className="text-sm text-gray-500">
                  <p><span className="font-medium">Profesor:</span> {course.professorName}</p>
                  <p><span className="font-medium">Horario:</span> {course.schedule || 'No especificado'}</p>
                  <p><span className="font-medium">Estudiantes:</span> {course.students?.length || 0}</p>
                </div>
                
                {canEditCourse && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/cursos/editar/${course.id}`)}
                      className="w-full"
                    >
                      Editar Curso
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs de contenido */}
          <div className="md:w-2/3">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="overview">Información</TabsTrigger>
                <TabsTrigger value="materials">Materiales</TabsTrigger>
                <TabsTrigger value="calendar">Calendario</TabsTrigger>
                <TabsTrigger value="messages">Mensajes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Curso</CardTitle>
                    <CardDescription>Detalles y organización del curso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold">Descripción</h3>
                        <p className="text-gray-700 mt-1">{course.description || 'Sin descripción disponible'}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-bold">Horario</h3>
                        <p className="text-gray-700 mt-1">{course.schedule || 'No especificado'}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-bold">Objetivos del curso</h3>
                        <ul className="list-disc list-inside mt-1 text-gray-700">
                          <li>Comprender los conceptos fundamentales de la materia</li>
                          <li>Desarrollar habilidades prácticas en el área</li>
                          <li>Aplicar los conocimientos en casos reales</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="materials">
                <CourseMaterials 
                  courseId={course.id} 
                  canUpload={canEditCourse}
                />
              </TabsContent>
              
              <TabsContent value="calendar">
                <CourseCalendar 
                  courseId={course.id} 
                  canEdit={canEditCourse}
                />
              </TabsContent>
              
              <TabsContent value="messages">
                <CourseMessages 
                  courseId={course.id}
                  userId={currentUser?.id || ''}
                  userName={currentUser?.name || ''}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
