
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, Download, File, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

interface CourseMaterialsProps {
  courseId: string;
  canUpload: boolean;
}

interface CourseFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

const CourseMaterials: React.FC<CourseMaterialsProps> = ({ courseId, canUpload }) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_files')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error al cargar los materiales:', error);
      toast.error('No se pudieron cargar los materiales del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !currentUser) return;
    
    setUploading(true);
    
    try {
      // 1. Subir el archivo a Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${courseId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course_files')
        .upload(fileName, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // 2. Crear una entrada en la tabla course_files
      const filePath = uploadData?.path || '';
      
      const { error: insertError } = await supabase
        .from('course_files')
        .insert({
          course_id: courseId,
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type || 'application/octet-stream',
          file_size: selectedFile.size,
          uploaded_by: currentUser.id
        });
        
      if (insertError) throw insertError;
      
      toast.success('Archivo subido correctamente');
      setSelectedFile(null);
      fetchMaterials();
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      toast.error('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('course_files')
        .download(filePath);
        
      if (error) throw error;
      
      // Crear un objeto URL para el archivo descargado
      const url = URL.createObjectURL(data);
      
      // Crear un elemento <a> invisible para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const deleteFile = async (id: string, filePath: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este archivo?')) return;
    
    try {
      // 1. Eliminar el archivo de Storage
      const { error: deleteStorageError } = await supabase.storage
        .from('course_files')
        .remove([filePath]);
        
      if (deleteStorageError) throw deleteStorageError;
      
      // 2. Eliminar la entrada de la base de datos
      const { error: deleteDbError } = await supabase
        .from('course_files')
        .delete()
        .eq('id', id);
        
      if (deleteDbError) throw deleteDbError;
      
      toast.success('Archivo eliminado correctamente');
      fetchMaterials();
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      toast.error('Error al eliminar el archivo');
    }
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // Función para obtener icono según tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📋';
    return '📁';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2" size={20} />
          Materiales del Curso
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sección de carga de archivos (solo para profesores y administradores) */}
        {canUpload && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Subir Nuevo Material</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="file" 
                onChange={handleFileChange} 
                className="flex-grow"
              />
              <Button 
                onClick={uploadFile} 
                disabled={!selectedFile || uploading} 
                className="flex-shrink-0"
              >
                {uploading ? 'Subiendo...' : 'Subir'}
                {!uploading && <Upload className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">
                Archivo seleccionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Lista de materiales */}
        <div>
          <h3 className="text-lg font-medium mb-4">Materiales Disponibles</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Cargando materiales...</div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <File size={40} className="mx-auto mb-2 text-gray-400" />
              <p>No hay materiales disponibles para este curso</p>
              {canUpload && (
                <p className="text-sm mt-2">
                  Comienza subiendo algunos archivos para los estudiantes
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="border rounded-md p-3 flex items-center justify-between bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getFileIcon(file.file_type)}</span>
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)} • Subido el {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => downloadFile(file.file_path, file.file_name)}
                    >
                      <Download size={18} />
                    </Button>
                    
                    {canUpload && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteFile(file.id, file.file_path)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseMaterials;
