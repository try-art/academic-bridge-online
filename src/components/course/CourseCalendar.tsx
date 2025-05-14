
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CourseCalendarProps {
  courseId: string;
  canEdit: boolean;
}

interface CourseEvent {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
}

const CourseCalendar: React.FC<CourseCalendarProps> = ({ courseId, canEdit }) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date>();
  const [viewEventDialog, setViewEventDialog] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CourseEvent | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CourseEvent[]>([]);

  // Formulario para nuevo evento
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState<Date | undefined>(undefined);
  const [eventEndDate, setEventEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchEvents();
  }, [courseId]);

  // Cuando se selecciona un día, filtrar eventos para ese día
  useEffect(() => {
    if (selectedDay && events.length > 0) {
      const dayEvents = events.filter(event => {
        const startDate = parseISO(event.start_date);
        const endDate = parseISO(event.end_date);
        const currentDate = new Date(
          selectedDay.getFullYear(),
          selectedDay.getMonth(),
          selectedDay.getDate()
        );
        
        return isWithinInterval(currentDate, { start: startDate, end: endDate });
      });
      
      setSelectedDateEvents(dayEvents);
    } else {
      setSelectedDateEvents([]);
    }
  }, [selectedDay, events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_events')
        .select('*')
        .eq('course_id', courseId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error al cargar los eventos:', error);
      toast.error('No se pudieron cargar los eventos del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!currentUser || !eventTitle || !eventStartDate || !eventEndDate) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    
    try {
      const { error } = await supabase.from('course_events').insert({
        course_id: courseId,
        title: eventTitle,
        description: eventDescription || null,
        start_date: eventStartDate.toISOString(),
        end_date: eventEndDate.toISOString(),
        created_by: currentUser.id
      });
      
      if (error) throw error;
      
      toast.success('Evento agregado correctamente');
      resetEventForm();
      setShowAddEventDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error al agregar el evento:', error);
      toast.error('Error al agregar el evento');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      const { error } = await supabase
        .from('course_events')
        .delete()
        .eq('id', selectedEvent.id);
        
      if (error) throw error;
      
      toast.success('Evento eliminado correctamente');
      setViewEventDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
      toast.error('Error al eliminar el evento');
    }
  };

  const resetEventForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventStartDate(undefined);
    setEventEndDate(undefined);
  };

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDay(date);
  };

  const viewEvent = (event: CourseEvent) => {
    setSelectedEvent(event);
    setViewEventDialog(true);
  };

  // Función para resaltar días con eventos
  const isDayWithEvents = (date: Date): boolean => {
    if (!events.length) return false;
    
    const dayDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    
    return events.some(event => {
      const startDate = parseISO(event.start_date);
      const endDate = parseISO(event.end_date);
      return isWithinInterval(dayDate, { start: startDate, end: endDate });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2" size={20} />
            Calendario del Curso
          </CardTitle>
          
          {canEdit && (
            <Button onClick={() => setShowAddEventDialog(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Evento
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="bg-white rounded-md p-4 border">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={handleDayClick}
              className="p-3 pointer-events-auto"
              modifiersStyles={{
                selected: { backgroundColor: '#3b82f6', color: 'white' },
                outside: { opacity: 0.5 },
                today: { color: '#3b82f6', fontWeight: 'bold' },
                hasEvent: { backgroundColor: '#e0f2fe', borderRadius: '50%' }
              }}
              modifiers={{
                hasEvent: (date) => isDayWithEvents(date)
              }}
            />
          </div>
          
          {/* Lista de eventos del día seleccionado */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-medium">
                Eventos para {selectedDay ? format(selectedDay, "d 'de' MMMM 'de' yyyy", { locale: es }) : 'Fecha seleccionada'}
              </h3>
            </div>
            
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-md p-6">
                <CalendarDays size={40} className="mx-auto mb-2 text-gray-400" />
                <p>No hay eventos programados para este día</p>
                {canEdit && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEventStartDate(selectedDay);
                      setEventEndDate(selectedDay);
                      setShowAddEventDialog(true);
                    }}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar evento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewEvent(event)}
                  >
                    <h4 className="font-medium text-lg">{event.title}</h4>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>
                        {format(parseISO(event.start_date), "d MMM", { locale: es })} - {format(parseISO(event.end_date), "d MMM", { locale: es })}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="mt-2 text-gray-700 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Diálogo para agregar evento */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Evento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Título del evento *</Label>
              <Input 
                id="event-title"
                value={eventTitle} 
                onChange={(e) => setEventTitle(e.target.value)} 
                placeholder="Título del evento" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-description">Descripción</Label>
              <Textarea 
                id="event-description"
                value={eventDescription} 
                onChange={(e) => setEventDescription(e.target.value)} 
                placeholder="Descripción del evento" 
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de inicio *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      {eventStartDate ? format(eventStartDate, 'PPP', { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventStartDate}
                      onSelect={setEventStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Fecha de fin *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      {eventEndDate ? format(eventEndDate, 'PPP', { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventEndDate}
                      onSelect={setEventEndDate}
                      disabled={date => !eventStartDate || date < eventStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetEventForm();
              setShowAddEventDialog(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddEvent}>
              Guardar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para ver evento */}
      <Dialog open={viewEventDialog} onOpenChange={setViewEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-sm text-gray-500 mb-4">
              {selectedEvent && (
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>
                    {format(parseISO(selectedEvent.start_date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    {" - "}
                    {format(parseISO(selectedEvent.end_date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {selectedEvent?.description && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {canEdit && (
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Eliminar Evento
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewEventDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CourseCalendar;
