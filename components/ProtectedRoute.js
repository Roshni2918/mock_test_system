import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(requiredRole === 'admin' ? '/admin-login' : '/');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push(user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
    }
  }, [loading, requiredRole, router, user]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return children;
}
