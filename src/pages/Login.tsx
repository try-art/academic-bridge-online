
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error al iniciar sesión', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-education-light flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-education-blue">
            <span className="text-education-green">Edu</span>App
          </h1>
          <p className="text-gray-600 mt-2">Plataforma educativa integral</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="edu-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="edu-input"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-education-blue hover:bg-blue-600"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-8 text-sm text-gray-600">
            <p className="text-center">Para demostración, usa alguna de estas cuentas:</p>
            <div className="mt-3 space-y-1 bg-gray-50 p-3 rounded">
              <p><strong>Admin:</strong> admin@eduapp.com / admin123</p>
              <p><strong>Profesor:</strong> profesor@eduapp.com / profesor123</p>
              <p><strong>Estudiante:</strong> estudiante@eduapp.com / estudiante123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
