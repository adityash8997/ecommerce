import { useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface TourBookingData {
  guestName: string;
  contactNumber: string;
  email?: string;
  selectedDate: Date | null;
  selectedSlot: string;
  groupSize: number;
  specialRequests?: string;
  tourType: 'morning' | 'evening';
}

export function useCampusTourBooking() {
  const { invokeEdgeFunction, isAuthenticated } = useAuthenticatedFetch();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitBooking = async (bookingData: TourBookingData) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    if (!bookingData.selectedDate) {
      throw new Error('Please select a date');
    }

    setIsSubmitting(true);
    
    try {
      const result = await invokeEdgeFunction('submit-campus-tour-booking', {
        guestName: bookingData.guestName,
        contactNumber: bookingData.contactNumber,
        email: bookingData.email || user?.email,
        selectedDate: bookingData.selectedDate.toISOString().split('T')[0],
        selectedSlot: bookingData.selectedSlot,
        groupSize: bookingData.groupSize,
        specialRequests: bookingData.specialRequests,
        tourType: bookingData.tourType
      });

      toast({
        title: "Booking Confirmed! 🎉",
        description: "We'll call you within 12 hours to confirm details and send your campus entry pass.",
      });

      return result;
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePrice = (tourType: 'morning' | 'evening', groupSize: number) => {
    const basePrice = tourType === 'morning' ? 299 : 399;
    const extraPeople = Math.max(0, groupSize - 4);
    return basePrice + (extraPeople * 50);
  };

  return {
    submitBooking,
    calculatePrice,
    isSubmitting,
    isAuthenticated
  };
}