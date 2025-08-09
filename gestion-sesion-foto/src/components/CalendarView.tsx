import { useState, useEffect } from 'react';
import { API_BASE_URL_CORRECTED as API_BASE_URL } from '../config';
import './CalendarView.css';

interface OccupiedSlot {
  time: string;
  duration: number;
}

interface OccupiedSlots {
  [date: string]: OccupiedSlot[];
}

interface CalendarViewProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export default function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlots>({});
  const [loading, setLoading] = useState(true);
  const [selectedDateDetails, setSelectedDateDetails] = useState<OccupiedSlot[]>([]);

  // Cargar horarios ocupados
  useEffect(() => {
    const fetchOccupiedSlots = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sessions/occupied-slots`);
        if (res.ok) {
          const data = await res.json();
          setOccupiedSlots(data);
        }
      } catch (error) {
        console.error('Error al cargar horarios ocupados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupiedSlots();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isOccupied: false,
        dateString: prevDate.toISOString().split('T')[0]
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = currentDate.toISOString().split('T')[0];
      const isOccupied = occupiedSlots[dateString]?.length > 0;
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isOccupied,
        dateString
      });
    }

    return days;
  };

  const handleDateClick = (dateString: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    const slots = occupiedSlots[dateString] || [];
    setSelectedDateDetails(slots);
    onDateSelect?.(dateString);
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-loading">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">‹</button>
        <h3 className="calendar-title">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={goToNextMonth} className="calendar-nav-btn">›</button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              !day.isCurrentMonth ? 'calendar-day-other-month' : ''
            } ${
              day.isOccupied ? 'calendar-day-occupied' : 'calendar-day-available'
            } ${
              selectedDate === day.dateString ? 'calendar-day-selected' : ''
            }`}
            onClick={() => handleDateClick(day.dateString, day.isCurrentMonth)}
          >
            <span className="calendar-day-number">{day.date.getDate()}</span>
            {day.isOccupied && day.isCurrentMonth && (
              <div className="calendar-day-indicator">●</div>
            )}
          </div>
        ))}
      </div>

      {selectedDate && selectedDateDetails.length > 0 && (
        <div className="calendar-day-details">
          <h4>Horarios ocupados - {selectedDate}</h4>
          <div className="occupied-slots-list">
            {selectedDateDetails.map((slot, index) => (
              <div key={index} className="occupied-slot">
                <span className="occupied-time">{formatTime(slot.time)}</span>
                <span className="occupied-duration">({formatDuration(slot.duration)})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <span className="legend-color occupied"></span>
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
}
