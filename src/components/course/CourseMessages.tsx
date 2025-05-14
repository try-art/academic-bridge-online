
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

interface CourseMessagesProps {
  courseId: string;
  userId: string;
  userName: string;
}

interface MessageWithUser {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
}

const CourseMessages: React.FC<CourseMessagesProps> = ({ courseId, userId, userName }) => {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel('public:course_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_messages',
          filter: `course_id=eq.${courseId}`
        },
        (payload) => {
          const newMsg = payload.new as MessageWithUser;
          // Para evitar duplicados (porque también añadimos mensajes manualmente)
          if (!messages.some(m => m.id === newMsg.id)) {
            // Añadir información del remitente
            if (newMsg.sender_id === userId) {
              newMsg.sender_name = userName;
            }
            setMessages(prevMessages => [...prevMessages, newMsg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Obtener mensajes y combinarlos con información de usuario
      const { data, error } = await supabase
        .from('course_messages')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Procesar mensajes para mejorar la apariencia
      const processedMessages = data.map(msg => ({
        ...msg,
        sender_name: msg.sender_id === userId ? userName : `Usuario ${msg.sender_id.substring(0, 4)}`,
        sender_avatar: undefined
      }));
      
      setMessages(processedMessages || []);
    } catch (error) {
      console.error('Error al cargar los mensajes:', error);
      toast.error('No se pudieron cargar los mensajes del curso');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    
    setSending(true);
    
    try {
      const { error, data } = await supabase.from('course_messages').insert({
        course_id: courseId,
        sender_id: userId,
        message: newMessage.trim()
      }).select();
      
      if (error) throw error;
      
      // Agregar el mensaje a la lista con información del remitente
      if (data && data.length > 0) {
        const sentMessage = {
          ...data[0],
          sender_name: userName,
          sender_avatar: undefined
        };
        setMessages([...messages, sentMessage]);
      }
      
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2" size={20} />
          Mensajes del Curso
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto mb-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Cargando mensajes...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare size={40} className="mx-auto mb-2 text-gray-400" />
            <p>No hay mensajes en este curso</p>
            <p className="text-sm mt-2">
              ¡Sé el primero en enviar un mensaje!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.sender_id === userId;
              const showSenderInfo = index === 0 || 
                messages[index - 1].sender_id !== msg.sender_id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] ${isCurrentUser 
                      ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'}`}
                  >
                    {showSenderInfo && !isCurrentUser && (
                      <div className="flex items-center px-4 pt-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="text-xs">
                            {msg.sender_name ? getInitials(msg.sender_name) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {msg.sender_name || 'Usuario'}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-3">
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatDistance(new Date(msg.created_at), new Date(), { 
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <div className="w-full flex items-center gap-2">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Escribe un mensaje..." 
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending} 
            size="icon"
          >
            <Send size={18} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseMessages;
