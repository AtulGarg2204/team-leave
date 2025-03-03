import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthNavbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div>
          <Link to="/" className="text-xl font-bold text-blue-600">
            Team Leave Manager
          </Link>
        </div>
        <div>
          {isLoginPage ? (
            <Link 
              to="/register" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Register
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar; 