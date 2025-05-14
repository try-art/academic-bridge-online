
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-education-blue mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-6">Oops! Página no encontrada</p>
        <p className="text-gray-500 mb-8">
          La página que estás buscando no existe o ha sido movida a otra ubicación.
        </p>
        <Button asChild className="bg-education-blue hover:bg-blue-600">
          <Link to="/">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
