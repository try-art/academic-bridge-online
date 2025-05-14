
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CoursesProvider } from "@/contexts/CoursesContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CoursesList from "./pages/CoursesList";
import CourseDetail from "./pages/CourseDetail";
import TasksList from "./pages/TasksList";
import UserProfile from "./pages/UserProfile";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  // Si está cargando, mostramos un indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, redirigimos a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos el contenido
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/cursos" 
        element={
          <ProtectedRoute>
            <CoursesList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/curso/:id" 
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/mis-cursos" 
        element={
          <ProtectedRoute>
            <CoursesList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tareas" 
        element={
          <ProtectedRoute>
            <TasksList />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CoursesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CoursesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
