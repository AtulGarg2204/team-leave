import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  FileText, 
  Home, 
  LogOut, 
  User 
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login anyway even if there's an error
      navigate('/login');
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Team Leave Manager</h1>
        </div>
        
        <nav className="mt-4">
          <ul>
            <li>
              <Link 
                to="/dashboard" 
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>
            
            <li>
              <Link 
                to="/calendar" 
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Calendar className="w-5 h-5 mr-3" />
                Calendar
              </Link>
            </li>
            
            {user?.role === 'admin' && (
              <>
                <li>
                  <Link 
                    to="/users" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    User Management
                  </Link>
                </li>
                
                <li>
                  <Link 
                    to="/leaves" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="w-5 h-5 mr-3" />
                    Leave Management
                  </Link>
                </li>
              </>
            )}
            
            <li>
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Link>
            </li>
            
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
            <div className="text-sm text-gray-600">
              Remaining Leaves: <span className="font-semibold">{user?.remainingLeaves}</span>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 