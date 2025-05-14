
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-education-blue">
          Bienvenido a <span className="text-education-green">Edu</span>App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Plataforma educativa integral para la gestión de cursos, comunicación en tiempo real y seguimiento académico.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => navigate('/login')} 
            size="lg"
            className="bg-education-blue hover:bg-blue-600"
          >
            Iniciar Sesión
          </Button>
        </div>
        
        <div className="mt-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Gestión de Cursos</h3>
              <p className="text-gray-600">Crea, organiza y administra cursos de manera eficiente. Sube material didáctico y mantén todo organizado.</p>
            </div>
            <div className="flex-1 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Comunicación en Tiempo Real</h3>
              <p className="text-gray-600">Chats grupales y privados para mantenerse en contacto con profesores y compañeros de clase.</p>
            </div>
            <div className="flex-1 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Evaluación Académica</h3>
              <p className="text-gray-600">Crea quizzes, asigna tareas y da seguimiento al progreso de los estudiantes con reportes detallados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
