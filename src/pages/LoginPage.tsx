import React from 'react';
import Navbar from '../components/layout/Navbar';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;