
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { User } from './AuthContext';

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  professorId: string;
  professorName: string;
  students: string[];
  createdAt: Date;
  schedule?: string;
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  score?: number;
}

interface CoursesContextType {
  courses: Course[];
  tasks: Task[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  updateCourse: (id: string, courseData: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getUserCourses: (userId: string, userRole: string) => Course[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getCourseTasks: (courseId: string) => Task[];
  getUserTasks: (userId: string, userCourses: string[]) => Task[];
}

// Datos iniciales para demostración
const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Introducción a la Programación',
    description: 'Curso básico de programación para principiantes',
    image: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29',
    professorId: '2', // ID del profesor
    professorName: 'Juan Profesor',
    students: ['3'], // IDs de estudiantes
    createdAt: new Date('2023-01-15'),
    schedule: 'Lunes y Miércoles de 10:00 a 12:00'
  },
  {
    id: '2',
    title: 'Matemáticas Avanzadas',
    description: 'Curso de cálculo y álgebra lineal',
    image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d',
    professorId: '2',
    professorName: 'Juan Profesor',
    students: ['3'],
    createdAt: new Date('2023-02-10'),
    schedule: 'Martes y Jueves de 14:00 a 16:00'
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Tarea: Algoritmos Básicos',
    description: 'Implementar 5 algoritmos básicos en el lenguaje de tu preferencia',
    dueDate: new Date('2023-05-20'),
    status: 'pending'
  },
  {
    id: '2',
    courseId: '1',
    title: 'Quiz: Fundamentos de Programación',
    description: 'Evaluación sobre fundamentos de programación',
    dueDate: new Date('2023-05-15'),
    status: 'completed',
    score: 85
  },
  {
    id: '3',
    courseId: '2',
    title: 'Examen: Cálculo Diferencial',
    description: 'Evaluación sobre límites, derivadas y aplicaciones',
    dueDate: new Date('2023-05-25'),
    status: 'pending'
  }
];

// Crear el contexto
const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const CoursesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addCourse = (course: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCourses([...courses, newCourse]);
    toast.success(`Curso "${newCourse.title}" creado exitosamente`);
  };

  const updateCourse = (id: string, courseData: Partial<Course>) => {
    setCourses(
      courses.map(course =>
        course.id === id ? { ...course, ...courseData } : course
      )
    );
    toast.success('Curso actualizado exitosamente');
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
    // También eliminamos las tareas asociadas al curso
    setTasks(tasks.filter(task => task.courseId !== id));
    toast.success('Curso eliminado exitosamente');
  };

  const getCourseById = (id: string) => {
    return courses.find(course => course.id === id);
  };

  const getUserCourses = (userId: string, userRole: string) => {
    if (userRole === 'admin') {
      // El administrador ve todos los cursos
      return courses;
    } else if (userRole === 'profesor') {
      // El profesor ve solo sus cursos
      return courses.filter(course => course.professorId === userId);
    } else {
      // El estudiante ve los cursos en los que está inscrito
      return courses.filter(course => course.students.includes(userId));
    }
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    setTasks([...tasks, newTask]);
    toast.success(`Tarea "${newTask.title}" creada exitosamente`);
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, ...taskData } : task
      )
    );
    toast.success('Tarea actualizada exitosamente');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Tarea eliminada exitosamente');
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const getCourseTasks = (courseId: string) => {
    return tasks.filter(task => task.courseId === courseId);
  };

  const getUserTasks = (userId: string, userCourses: string[]) => {
    return tasks.filter(task => userCourses.includes(task.courseId));
  };

  const value = {
    courses,
    tasks,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    getUserCourses,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getCourseTasks,
    getUserTasks,
  };

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
};
