// Hook to reset analysis state across components
// This should be called whenever we purge project data to allow re-analysis

export const resetAnalysisState = () => {
  // Dispatch a custom event that components can listen to
  window.dispatchEvent(new CustomEvent('resetAnalysisState'));
};

export const useResetAnalysisState = (callback: () => void) => {
  const handleReset = () => {
    callback();
  };

  // Listen for reset events
  if (typeof window !== 'undefined') {
    window.addEventListener('resetAnalysisState', handleReset);
    
    // Cleanup
    return () => {
      window.removeEventListener('resetAnalysisState', handleReset);
    };
  }
  
  return () => {};
}; 