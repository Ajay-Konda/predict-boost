import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import FacultyDashboard from '@/components/faculty/FacultyDashboard';
import StudentDashboard from '@/components/student/StudentDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-medium">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (user.role === 'faculty') {
    return <FacultyDashboard />;
  }

  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Unknown User Role</h1>
        <p className="text-xl text-muted-foreground">Please contact administrator.</p>
      </div>
    </div>
  );
};

export default Index;
