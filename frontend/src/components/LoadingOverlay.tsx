import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  subMessage?: string;
}

export const LoadingOverlay = ({ 
  message = "Chargement...", 
  subMessage = "Veuillez patienter" 
}: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          
          {/* Main message */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message}
          </h3>
          
          {/* Sub message */}
          <p className="text-sm text-gray-500 mb-6">
            {subMessage}
          </p>
          
          {/* Progress bar animation */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 