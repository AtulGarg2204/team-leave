import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, AlertCircle, CheckCircle, Calendar as CalendarIcon, User, FileText } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  
  // Fetch user's leaves
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/leaves`);
        setLeaves(response.data);
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
  
  // Group leaves by status
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
  const approvedLeaves = leaves.filter(leave => leave.status === 'approved');
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => setShowApplyLeave(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 flex items-center"
        >
          <CalendarIcon className="w-5 h-5 mr-2" />
          Apply for Leave
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Annual Quota</h2>
            <div className="p-2 bg-blue-100 rounded-full">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{user?.annualLeaveQuota || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total days allocated</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Remaining</h2>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{user?.remainingLeaves || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Days available to use</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Used</h2>
            <div className="p-2 bg-purple-100 rounded-full">
              <User className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(user?.annualLeaveQuota || 0) - (user?.remainingLeaves || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Days already taken</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Leaves Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Leaves</h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {approvedLeaves.length} Approved
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : approvedLeaves.length > 0 ? (
            <ul className="space-y-4">
              {approvedLeaves.slice(0, 3).map(leave => (
                <li key={leave._id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
                  <Calendar className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                      {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-600 mr-2">
                        {leave.numberOfDays} day{leave.numberOfDays !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        {leave.leaveType === 'half' ? 'Half Day' : 'Full Day'}
                      </span>
                    </div>
                    {leave.reason && (
                      <p className="text-sm text-gray-500 mt-1 italic">"{leave.reason}"</p>
                    )}
                  </div>
                </li>
              ))}
              {approvedLeaves.length > 3 && (
                <li className="text-center pt-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all ({approvedLeaves.length})
                  </button>
                </li>
              )}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Calendar className="w-10 h-10 mb-2 text-gray-400" />
              <p>No upcoming leaves</p>
            </div>
          )}
        </div>
        
        {/* Pending Leaves Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              {pendingLeaves.length} Pending
            </span>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : pendingLeaves.length > 0 ? (
            <ul className="space-y-4">
              {pendingLeaves.map(leave => (
                <li key={leave._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                        {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-600 mr-2">
                          {leave.numberOfDays} day{leave.numberOfDays !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {leave.leaveType === 'half' ? 'Half Day' : 'Full Day'}
                        </span>
                      </div>
                      {leave.reason && (
                        <p className="text-sm text-gray-500 mt-2 italic">"{leave.reason}"</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                      Pending
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <FileText className="w-10 h-10 mb-2 text-gray-400" />
              <p>No pending leave requests</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Apply Leave Modal */}
      {showApplyLeave && (
        <ApplyLeaveModal 
          onClose={() => setShowApplyLeave(false)} 
          onSuccess={() => {
            setShowApplyLeave(false);
            // Refresh leaves after successful application
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Apply Leave Modal Component with improved UI
const ApplyLeaveModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'full',
    reason: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/leaves`, formData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Apply for Leave</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="startDate">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="endDate">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Leave Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="leaveType"
                  value="full"
                  checked={formData.leaveType === 'full'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Full Day</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="leaveType"
                  value="half"
                  checked={formData.leaveType === 'half'}
                  onChange={handleChange}
                  className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Half Day</span>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="reason">
              Reason (Optional)
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Why are you taking this leave?"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard; 