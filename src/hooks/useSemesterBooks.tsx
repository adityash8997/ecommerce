import { useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface SemesterBook {
  id: string;
  book_name: string;
  author: string;
  publisher?: string;
  edition?: string;
  base_price: number;
  subject_category?: string;
  semester: number;
}

interface SemesterCombo {
  id: string;
  semester_number: number;
  combo_name: string;
  combo_price: number;
  discount_percentage: number;
  description?: string;
  book_ids: string[];
}

interface BookSelection {
  selectedBooks: string[];
  selectedCombo?: string;
  totalAmount: number;
  semester: number;
  action: 'buy' | 'sell';
  userDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

export function useSemesterBooks() {
  const { invokeEdgeFunction, isAuthenticated } = useAuthenticatedFetch();
  const [books, setBooks] = useState<SemesterBook[]>([]);
  const [combos, setCombos] = useState<SemesterCombo[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSemesterData = async (semester: number) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('semester_books')
        .select('*')
        .eq('semester', semester)
        .order('subject_category', { ascending: true });

      if (error) throw error;

      const { data: combosData, error: combosError } = await supabase
        .from('semester_combos')
        .select('*')
        .eq('semester_number', semester);

      if (combosError) throw combosError;

      setBooks(data || []);
      setCombos(combosData || []);
      setSelectedBooks([]);
      setSelectedCombo(null);
      
    } catch (error: any) {
      console.error('Error fetching semester data:', error);
      toast({
        title: "Error",
        description: "Failed to load semester books",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookSelection = (bookId: string) => {
    if (selectedCombo) {
      // If combo is selected, clear it when selecting individual books
      setSelectedCombo(null);
      toast({
        title: "Combo Cleared",
        description: "Individual book selection will replace the combo",
      });
    }
    
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const selectCombo = (comboId: string) => {
    if (selectedBooks.length > 0) {
      toast({
        title: "Individual Books Cleared",
        description: "Combo selection will replace individual book selection",
      });
    }
    
    setSelectedBooks([]);
    setSelectedCombo(selectedCombo === comboId ? null : comboId);
  };

  const clearSelection = () => {
    setSelectedBooks([]);
    setSelectedCombo(null);
  };

  const calculateTotal = () => {
    if (selectedCombo) {
      const combo = combos.find(c => c.id === selectedCombo);
      return combo?.combo_price || 0;
    }
    
    return selectedBooks.reduce((total, bookId) => {
      const book = books.find(b => b.id === bookId);
      return total + (book?.base_price || 0);
    }, 0);
  };

  const getSelectedBookDetails = () => {
    return books.filter(book => selectedBooks.includes(book.id));
  };

  const getSelectedComboDetails = () => {
    return combos.find(combo => combo.id === selectedCombo);
  };

  const submitSelection = async (selectionData: BookSelection) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    setIsSubmitting(true);
    
    try {
      const result = await invokeEdgeFunction('submit-book-selection', selectionData);

      toast({
        title: selectionData.action === 'buy' ? "📚 Order Placed!" : "💰 Buyback Request Submitted!",
        description: selectionData.action === 'buy' 
          ? "Your book order has been placed successfully. We'll contact you soon!"
          : "Your buyback request has been submitted. We'll evaluate and get back to you.",
      });

      // Clear selection after successful submission
      clearSelection();
      
      return result;
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    books,
    combos,
    selectedBooks,
    selectedCombo,
    isLoading,
    isSubmitting,
    isAuthenticated,
    fetchSemesterData,
    toggleBookSelection,
    selectCombo,
    clearSelection,
    calculateTotal,
    getSelectedBookDetails,
    getSelectedComboDetails,
    submitSelection
  };
}