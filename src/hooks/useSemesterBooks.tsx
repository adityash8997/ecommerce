import { useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface SemesterBook {
  id: string;
  book_name: string;
  author: string;
  publisher?: string;
  edition?: string;
  base_price: number;
  subject_category?: string;
  semester: number;
}

export interface SemesterCombo {
  id: string;
  semester_number: number;
  combo_name: string;
  combo_price: number;
  discount_percentage: number;
  description?: string;
  book_ids: string[];
}

export interface BookSelection {
  type: 'buyback' | 'purchase';
  semester: number;
  selectedBooks: string[];
  selectedCombo?: string;
  totalAmount: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  additionalNotes?: string;
}

export function useSemesterBooks() {
  const { invokeEdgeFunction, isAuthenticated } = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [books, setBooks] = useState<SemesterBook[]>([]);
  const [combos, setCombos] = useState<SemesterCombo[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);

  const fetchSemesterData = async (semester: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-semester-books', {
        body: null,
        headers: {},
      });

      if (error) throw error;

      const response = await supabase
        .from('semester_books')
        .select('*')
        .eq('semester', semester)
        .order('subject_category', { ascending: true });

      if (response.error) throw response.error;

      const comboResponse = await supabase
        .from('semester_combos')
        .select('*')
        .eq('semester_number', semester);

      setBooks(response.data || []);
      setCombos(comboResponse.data || []);
    } catch (error: any) {
      console.error('Error fetching semester data:', error);
      toast({
        title: "Error",
        description: "Failed to load semester data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookSelection = (bookId: string) => {
    if (selectedCombo) {
      toast({
        title: "Combo Selected",
        description: "Please deselect the combo first to select individual books",
        variant: "destructive"
      });
      return;
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
        title: "Individual Books Selected",
        description: "Combo selection will replace your individual book selection. Continue?",
      });
    }
    setSelectedBooks([]);
    setSelectedCombo(comboId);
  };

  const deselectCombo = () => {
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

  const submitSelection = async (selectionData: BookSelection) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your selection",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await invokeEdgeFunction('submit-book-selection', selectionData);
      
      toast({
        title: "Success!",
        description: result.message || "Your request has been submitted successfully",
      });

      // Reset selections
      setSelectedBooks([]);
      setSelectedCombo(null);
      
      return result;
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelections = () => {
    setSelectedBooks([]);
    setSelectedCombo(null);
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
    deselectCombo,
    calculateTotal,
    submitSelection,
    clearSelections
  };
}