import { useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { toast } from './use-toast';

interface BookItem {
  id: string;
  quantity: number;
  selling_price: number;
  semester_book: {
    book_name: string;
    author: string;
    semester: number;
  };
}

interface OrderData {
  books: BookItem[];
  deliveryAddress: string;
  contactNumber: string;
  paymentMethod: string;
}

export function useBookOrders() {
  const { invokeEdgeFunction, isAuthenticated } = useAuthenticatedFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrder = async (orderData: OrderData) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    if (!orderData.books.length) {
      throw new Error('No books in order');
    }

    setIsSubmitting(true);
    
    try {
      const result = await invokeEdgeFunction('submit-book-order', orderData);

      toast({
        title: "Order Placed Successfully! 📚",
        description: "We'll contact you within 24 hours to arrange payment and delivery.",
      });

      return result;
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = (books: BookItem[]) => {
    return books.reduce((total, book) => total + (book.selling_price * book.quantity), 0);
  };

  return {
    submitOrder,
    calculateTotal,
    isSubmitting,
    isAuthenticated
  };
}