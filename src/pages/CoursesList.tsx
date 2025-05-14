
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses, Course } from '@/contexts/CoursesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const CourseForm = ({ 
  onSubmit, 
  initialData = null, 
  buttonText = "Guardar" 
}: { 
  onSubmit: (data: any) => void, 
  initialData?: Partial<Course> | null,
  buttonText?: string
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: initialData?.image || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
    schedule: initialData?.schedule || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título del Curso</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">URL de Imagen</Label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="schedule">Horario</Label>
        <Input
          id="schedule"
          name="schedule"
          value={formData.schedule}
          onChange={handleChange}
          placeholder="Lunes y Miércoles 10:00 - 12:00"
        />
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">{buttonText}</Button>
      </DialogFooter>
    </form>
  );
};

const CourseCard = ({ 
  course, 
  onDelete, 
  onEdit,
  isAdmin = false,
  isTeacher = false
}: { 
  course: Course, 
  onDelete: (id: string) => void, 
  onEdit: (course: Course) => void,
  isAdmin?: boolean,
  isTeacher?: boolean
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-1 truncate">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center">
            <Users size={16} className="mr-1" />
            {course.students.length} estudiantes
          </div>
          <div className="flex space-x-2">
            {(isAdmin || isTeacher) && (
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                  <Edit size={14} className="mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(course.id)}>
                  <Trash2 size={14} className="mr-1" /> Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CoursesList = () => {
  const { currentUser } = useAuth();
  const { courses, addCourse, updateCourse, deleteCourse, getUserCourses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'profesor';
  const displayCourses = currentUser ? getUserCourses(currentUser.id, currentUser.role) : [];
  
  const filteredCourses = displayCourses.filter(
    course => course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = (data: any) => {
    if (currentUser) {
      addCourse({
        ...data,
        professorId: currentUser.id,
        professorName: currentUser.name,
        students: []
      });
      setShowAddDialog(false);
    }
  };

  const handleEditCourse = (data: any) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, data);
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      deleteCourse(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="edu-heading">
            {isAdmin ? 'Todos los Cursos' : isTeacher ? 'Mis Cursos' : 'Cursos Disponibles'}
          </h1>
          
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar cursos..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {(isAdmin || isTeacher) && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={18} className="mr-2" /> Nuevo Curso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Curso</DialogTitle>
                  </DialogHeader>
                  <CourseForm onSubmit={handleAddCourse} buttonText="Crear Curso" />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay cursos disponibles</p>
            {(isAdmin || isTeacher) && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus size={18} className="mr-2" /> Crear primer curso
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDeleteCourse}
                onEdit={setEditingCourse}
                isAdmin={isAdmin}
                isTeacher={isTeacher && course.professorId === currentUser?.id}
              />
            ))}
          </div>
        )}
        
        {/* Diálogo para editar curso */}
        {editingCourse && (
          <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Curso</DialogTitle>
              </DialogHeader>
              <CourseForm 
                onSubmit={handleEditCourse} 
                initialData={editingCourse} 
                buttonText="Actualizar Curso"
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default CoursesList;
