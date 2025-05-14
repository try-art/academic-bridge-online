
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses, Task, Course } from '@/contexts/CoursesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const TaskForm = ({ 
  onSubmit, 
  initialData = null, 
  buttonText = "Guardar",
  availableCourses = []
}: { 
  onSubmit: (data: any) => void, 
  initialData?: Partial<Task> | null,
  buttonText?: string,
  availableCourses: Course[]
}) => {
  const [formData, setFormData] = useState({
    courseId: initialData?.courseId || (availableCourses.length > 0 ? availableCourses[0].id : ''),
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate 
      ? new Date(initialData.dueDate).toISOString().split('T')[0] 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: initialData?.status || 'pending'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: new Date(formData.dueDate)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="courseId">Curso</Label>
        <Select 
          value={formData.courseId} 
          onValueChange={(value) => handleSelectChange('courseId', value)}
          disabled={availableCourses.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar curso" />
          </SelectTrigger>
          <SelectContent>
            {availableCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título de la Tarea</Label>
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
        <Label htmlFor="dueDate">Fecha de Entrega</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
      </div>

      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleSelectChange('status', value as 'pending' | 'completed' | 'overdue')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="overdue">Atrasada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">{buttonText}</Button>
      </DialogFooter>
    </form>
  );
};

const TaskBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle size={12} className="mr-1" /> Completada
        </Badge>
      );
    case 'overdue':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertTriangle size={12} className="mr-1" /> Atrasada
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock size={12} className="mr-1" /> Pendiente
        </Badge>
      );
  }
};

const TasksList = () => {
  const { currentUser } = useAuth();
  const { courses, tasks, addTask, updateTask, deleteTask, getUserCourses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'profesor';
  
  // Get the courses available to the current user
  const userCourses = currentUser ? getUserCourses(currentUser.id, currentUser.role) : [];
  const userCourseIds = userCourses.map(course => course.id);
  
  // Filter tasks based on user role and courses
  let availableTasks = tasks.filter(task => userCourseIds.includes(task.courseId));
  
  // Apply status filter
  if (activeTab !== "all") {
    availableTasks = availableTasks.filter(task => task.status === activeTab);
  }
  
  // Apply search filter
  if (searchTerm) {
    availableTasks = availableTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleAddTask = (data: any) => {
    addTask(data);
  };

  const handleEditTask = (data: any) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      deleteTask(id);
    }
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Curso desconocido';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="edu-heading">
            {isTeacher ? 'Gestión de Tareas' : 'Mis Tareas'}
          </h1>
          
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar tareas..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {(isAdmin || isTeacher) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={18} className="mr-2" /> Nueva Tarea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Tarea</DialogTitle>
                  </DialogHeader>
                  <TaskForm 
                    onSubmit={handleAddTask} 
                    buttonText="Crear Tarea" 
                    availableCourses={userCourses}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
            <TabsTrigger value="overdue">Atrasadas</TabsTrigger>
          </TabsList>
        </Tabs>

        {availableTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">
              No hay tareas {activeTab !== "all" ? `en estado "${activeTab}"` : ""} {searchTerm ? `que coincidan con "${searchTerm}"` : ""}
            </p>
            {(isAdmin || isTeacher) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={18} className="mr-2" /> Crear primera tarea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Tarea</DialogTitle>
                  </DialogHeader>
                  <TaskForm 
                    onSubmit={handleAddTask} 
                    buttonText="Crear Tarea" 
                    availableCourses={userCourses}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Fecha de Entrega</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      <div>
                        {task.title}
                        <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCourseTitle(task.courseId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-gray-500" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TaskBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingTask(task)}
                        >
                          <Edit size={14} />
                        </Button>
                        {(isAdmin || isTeacher) && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Diálogo para editar tarea */}
        {editingTask && (
          <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Tarea</DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSubmit={handleEditTask} 
                initialData={editingTask} 
                buttonText="Actualizar Tarea"
                availableCourses={userCourses}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default TasksList;
