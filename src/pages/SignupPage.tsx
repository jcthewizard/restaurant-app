import React from 'react';
import Navbar from '../components/layout/Navbar';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;