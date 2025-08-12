import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

interface UseGuestFormOptions<T> {
  key: string;
  initialData: T;
  onAuthenticated?: (data: T) => void;
}

export function useGuestForm<T extends Record<string, any>>({
  key,
  initialData,
  onAuthenticated
}: UseGuestFormOptions<T>) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<T>(initialData);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`guestForm_${key}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({ ...initialData, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
      }
    }
  }, [key]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`guestForm_${key}`, JSON.stringify(formData));
  }, [formData, key]);

  // Handle authentication completion
  useEffect(() => {
    if (isWaitingForAuth && user && onAuthenticated) {
      onAuthenticated(formData);
      setIsWaitingForAuth(false);
      // Clear saved data after successful auth
      localStorage.removeItem(`guestForm_${key}`);
    }
  }, [user, isWaitingForAuth, formData, onAuthenticated]);

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      setIsWaitingForAuth(true);
      navigate('/auth');
    }
  };

  const updateFormData = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialData);
    localStorage.removeItem(`guestForm_${key}`);
  };

  return {
    formData,
    updateFormData,
    resetForm,
    requireAuth,
    isAuthenticated: !!user,
    isWaitingForAuth
  };
}