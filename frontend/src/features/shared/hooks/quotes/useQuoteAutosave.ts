import { useCallback, useEffect, useRef } from 'react';
import { useCreateQuote } from './useCreateQuote';
import { useUpdateQuote } from './useUpdateQuote';
import { useQuotesByProject } from './useQuotesByProject';

interface QuoteData {
  projectId: string;
  name: string;
  description?: string;
  quoteItems: any[];
  dimensioningItems: any[];
  totalAmount: number;
  status?: 'draft' | 'completed' | 'sent';
}

interface UseQuoteAutosaveProps {
  projectId: string;
  debounceDelay?: number;
}

export function useQuoteAutosave({ projectId, debounceDelay = 1000 }: UseQuoteAutosaveProps) {
  const { data: quotes, isLoading: isLoadingQuotes } = useQuotesByProject(projectId);
  const createQuoteMutation = useCreateQuote();
  
  // Get current quote (assume one quote per project for now)
  const currentQuote = quotes?.[0];
  const updateQuoteMutation = useUpdateQuote(currentQuote?.id || 'temp-id');
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const initialDataRef = useRef<string>('');
  const isInitializedRef = useRef<boolean>(false);
  const isSavingRef = useRef<boolean>(false);

  const saveQuote = useCallback(async (quoteData: QuoteData) => {
    // Éviter les sauvegardes simultanées
    if (isSavingRef.current) {
      return;
    }

    try {
      isSavingRef.current = true;
      
      if (currentQuote) {
        // Update existing quote
        await updateQuoteMutation.mutateAsync({
          name: quoteData.name,
          description: quoteData.description,
          quoteItems: quoteData.quoteItems,
          dimensioningItems: quoteData.dimensioningItems,
          totalAmount: quoteData.totalAmount,
          status: quoteData.status || 'draft',
        });
      } else {
        // Create new quote
        await createQuoteMutation.mutateAsync({
          projectId: quoteData.projectId,
          name: quoteData.name,
          description: quoteData.description,
          quoteItems: quoteData.quoteItems,
          dimensioningItems: quoteData.dimensioningItems,
          totalAmount: quoteData.totalAmount,
        });
      }
      
      // Marquer les données comme sauvegardées
      const currentDataString = JSON.stringify({
        quoteItems: quoteData.quoteItems,
        dimensioningItems: quoteData.dimensioningItems,
        totalAmount: quoteData.totalAmount,
        name: quoteData.name,
        description: quoteData.description,
      });
      lastSavedDataRef.current = currentDataString;
      
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [currentQuote, updateQuoteMutation, createQuoteMutation]);

  const saveQuoteNow = useCallback((quoteData: QuoteData) => {
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    return saveQuote(quoteData);
  }, [saveQuote]);

  const cancelPendingSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const saveQuoteDebounced = useCallback((quoteData: QuoteData) => {
    // Check if data has actually changed
    const currentDataString = JSON.stringify({
      quoteItems: quoteData.quoteItems,
      dimensioningItems: quoteData.dimensioningItems,
      totalAmount: quoteData.totalAmount,
      name: quoteData.name,
      description: quoteData.description,
    });

    // Skip save if data hasn't changed from last saved version
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    // Skip save if this is initial data load and data hasn't changed from initial state
    if (!isInitializedRef.current && currentDataString === initialDataRef.current) {
      lastSavedDataRef.current = currentDataString;
      return;
    }

    // Mark as initialized after first potential save attempt
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }

    // Skip save if we're currently saving
    if (isSavingRef.current) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      saveQuote(quoteData);
    }, debounceDelay);
  }, [saveQuote, debounceDelay]);

  // Finish quote (save with completed status)
  const finishQuote = useCallback(async (quoteData: QuoteData) => {
    const finalQuoteData = {
      ...quoteData,
      status: 'completed' as const,
    };
    
    return saveQuoteNow(finalQuoteData);
  }, [saveQuoteNow]);

  // Initialize reference data when quote is loaded
  useEffect(() => {
    if (currentQuote && !isInitializedRef.current) {
      const initialDataString = JSON.stringify({
        quoteItems: currentQuote.quoteItems || [],
        dimensioningItems: currentQuote.dimensioningItems || [],
        totalAmount: currentQuote.totalAmount || 0,
        name: currentQuote.name,
        description: currentQuote.description,
      });
      
      initialDataRef.current = initialDataString;
      lastSavedDataRef.current = initialDataString;
    }
  }, [currentQuote]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    currentQuote,
    isLoadingQuotes,
    saveQuoteDebounced,
    saveQuoteNow,
    finishQuote,
    cancelPendingSave,
    isSaving: createQuoteMutation.isPending || updateQuoteMutation.isPending || isSavingRef.current,
    saveError: createQuoteMutation.error || updateQuoteMutation.error,
  };
} 