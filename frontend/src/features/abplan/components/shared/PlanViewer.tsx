import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PlanFile {
  id: string;
  publicUrl?: string;
  originalName?: string;
}

interface PlanViewerProps {
  planFiles: PlanFile[];
  title?: string;
  className?: string;
  showFullscreen?: boolean;
  maxHeight?: string;
}

export function PlanViewer({ 
  planFiles, 
  title, 
  className = '', 
  showFullscreen = true,
  maxHeight = 'calc(100vh-300px)'
}: PlanViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!planFiles || planFiles.length === 0) {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {title}
          </h3>
        )}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center h-64 flex items-center justify-center">
          <p className="text-gray-500">Aucun plan disponible</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && showFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="space-y-4 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {planFiles.map((plan, index) => (
              <img
                key={plan.id}
                src={plan.publicUrl}
                alt={`Plan ${index + 1} en plein écran`}
                className="max-w-full h-auto object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        </div>
      )}

      {/* Plan Viewer */}
      <div className={className}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {planFiles.length > 1 ? `${title} (${planFiles.length})` : title}
          </h3>
        )}
        
        <div className="space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
          {planFiles.map((plan, index) => (
            <div 
              key={plan.id}
              className={`relative border border-gray-200 rounded-lg overflow-hidden transition-colors ${
                showFullscreen ? 'cursor-pointer hover:border-blue-500' : ''
              }`}
              onClick={showFullscreen ? () => setIsFullscreen(true) : undefined}
            >
              <img
                src={plan.publicUrl}
                alt={plan.originalName || `Plan ${index + 1} du projet`}
                className="w-full h-auto object-contain bg-gray-50"
              />
              {showFullscreen && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {plan.originalName || `Plan ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 