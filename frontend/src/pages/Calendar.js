import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactCalendar from 'react-calendar';
import { format, isToday} from 'date-fns';
import { Calendar as CalendarIcon, User, AlertCircle } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

// Custom CSS to override react-calendar default styles
const calendarStyles = `
  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
  }
  .react-calendar__tile {
    padding: 1em 0.5em;
    position: relative;
  }
  .react-calendar__tile--now {
    background: #f0f9ff;
  }
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #e0f2fe;
  }
  .react-calendar__tile--active {
    background: #3b82f6 !important;
    color: white;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #2563eb !important;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f1f5f9;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #ef4444;
  }
  .leave-indicator {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .leave-indicator-count {
    position: absolute;
    bottom: 3px;
    right: 3px;
    font-size: 9px;
    background: #ef4444;
    color: white;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Calendar = () => {
 
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [leavesOnSelectedDate, setLeavesOnSelectedDate] = useState([]);
  
  // Fetch all leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/leaves`);
        // Only consider approved leaves
        const approvedLeaves = response.data.filter(leave => leave.status === 'approved');
        setLeaves(approvedLeaves);
        setError('');
      } catch (error) {
        setError('Failed to fetch leaves');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaves();
  }, []);
  
  // Update leaves for selected date when date or leaves change
  useEffect(() => {
    if (leaves.length > 0 && selectedDate) {
      // Find leaves that include the selected date
      const leavesOnDate = leaves.filter(leave => {
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        
        return selectedDate >= startDate && selectedDate <= endDate;
      });
      
      setLeavesOnSelectedDate(leavesOnDate);
    } else {
      setLeavesOnSelectedDate([]);
    }
  }, [selectedDate, leaves]);
  
  // Function to check if a date has any leaves and count them
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    // Find leaves on this date
    const leavesOnDate = leaves.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      return date >= startDate && date <= endDate;
    });
    
    if (leavesOnDate.length > 0) {
      return (
        <div className="leave-indicator-count">
          {leavesOnDate.length}
        </div>
      );
    }
    
    return null;
  };
  
  // Custom class for calendar tiles
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    let classes = [];
    
    // Check if date has leaves
    const hasLeave = leaves.some(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      return date >= startDate && date <= endDate;
    });
    
    if (hasLeave) {
      classes.push('bg-red-50');
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <style>{calendarStyles}</style>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Leave Calendar</h1>
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg flex items-center">
          <CalendarIcon className="w-4 h-4 mr-1 text-blue-600" />
          <span>
            {format(selectedDate, 'MMMM yyyy')}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ReactCalendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={tileClassName}
                tileContent={tileContent}
                className="w-full border-0 shadow-none"
                next2Label={null}
                prev2Label={null}
              />
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              {isToday(selectedDate) && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Today
                </span>
              )}
            </div>
            
            {leavesOnSelectedDate.length > 0 ? (
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 mr-2">
                    {leavesOnSelectedDate.length} {leavesOnSelectedDate.length === 1 ? 'person' : 'people'} on leave
                  </span>
                </div>
                <ul className="space-y-4">
                  {leavesOnSelectedDate.map(leave => (
                    <li key={leave._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{leave.user.name}</p>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-600 mr-2">
                              {format(new Date(leave.startDate), 'MMM d')} - 
                              {format(new Date(leave.endDate), 'MMM d, yyyy')}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {leave.leaveType === 'half' ? 'Half Day' : 'Full Day'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <CalendarIcon className="w-10 h-10 mb-2 text-gray-400" />
                <p>No leaves scheduled for this date</p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-50 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Days with approved leaves</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Selected date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 