import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Pencil, Check, Loader2, AlertCircle } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { PlanViewer } from './shared/PlanViewer';
import type { Project, Room, Equipment } from '../types';
import { useAnalyzePlanByProject } from '@/features/shared/hooks/plans/useAnalyzePlanByProject';
import { useProjectRooms } from '@/features/shared/hooks/project-rooms/useProjectRooms';
import { useDebouncedRoomsUpdate } from '@/features/shared/hooks/project-rooms/useDebouncedRoomsUpdate';
import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_ROOMS_QUERY_KEYS } from '@/api/generated/ProjectRooms';
import { PROJECT_EQUIPMENTS_QUERY_KEYS } from '@/api/generated/ProjectEquipments';
import { ROOM_TYPES, getRoomTypeByType } from '../constants/room-types';

interface StepRoomsProps {
  onNext: () => void;
  onPrevious: () => void;
  projectData: Partial<Project>;
  setProjectData: (data: Partial<Project>) => void;
  onAnalyzingChange?: (isAnalyzing: boolean) => void;
}

// Helper function to ensure unique IDs
const generateUniqueId = (() => {
  let counter = 0;
  return () => Date.now() + (++counter);
})();

export function StepRooms({ onNext, onPrevious, projectData, setProjectData, onAnalyzingChange }: StepRoomsProps) {
  const [editingNameId, setEditingNameId] = useState<number | null>(null);
  const [editingSurfaceId, setEditingSurfaceId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSurface, setEditingSurface] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [surfaceLoiCarrez, setSurfaceLoiCarrez] = useState<number | null>(null);
  const hasStartedAnalysis = useRef(false);
  const hasInitializedFromBackend = useRef(false);
  const isFirstMount = useRef(true);

  const queryClient = useQueryClient();
  const analyzePlanMutation = useAnalyzePlanByProject();
  const updateProjectRoomsMutation = useDebouncedRoomsUpdate();
  
  // Load existing project rooms from backend
  const { data: projectRooms } = useProjectRooms((projectData as any)?.id || '');

  // Function to reset all analysis-related states (called after purge)
  const resetAnalysisStates = () => {
    console.log('[StepRooms] Resetting analysis states after purge');
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setAnalysisError(null);
    hasStartedAnalysis.current = false;
    hasInitializedFromBackend.current = false;
    setSurfaceLoiCarrez(null);
  };

  // Systematically refresh data when entering the rooms step (only on first mount)
  useEffect(() => {
    const projectId = (projectData as any)?.id;
    if (projectId && isFirstMount.current) {
      console.log('[StepRooms] First mount - refreshing all data for project:', projectId);
      
      // Invalidate all related queries to force fresh data fetch
      queryClient.invalidateQueries({
        queryKey: [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId]
      });
      
      queryClient.invalidateQueries({
        queryKey: [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, projectId]
      });
      
      // Reset local analysis states to ensure fresh start
      resetAnalysisStates();
      isFirstMount.current = false;
      
      console.log('[StepRooms] Invalidated all project queries and reset analysis states');
    }
  }, [(projectData as any)?.id]); // Only depend on projectId

  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    surface: 0,
    exposition: undefined,
    roomType: undefined,
  });

  // Get plan file info for analysis
  const planFile = (projectData as any)?.planFiles?.[0]?.id;
  const hasUploadedPlan = !!planFile;
  
  // Get all plans for display
  const planFiles = (projectData as any)?.planFiles || [];

  // Notify parent when analyzing state changes
  useEffect(() => {
    if (onAnalyzingChange) {
      onAnalyzingChange(isAnalyzing);
    }
  }, [isAnalyzing, onAnalyzingChange]);

  const handleAnalyze = useCallback(async () => {
    if (!(projectData as any)?.id) {
      setAnalysisError('Projet manquant');
      return;
    }

    // Prevent duplicate analysis calls - double check
    if (hasStartedAnalysis.current || isAnalyzing) {
      console.log('[StepRooms] Analysis already in progress, skipping duplicate call');
      return;
    }

    hasStartedAnalysis.current = true;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log('[StepRooms] Starting analysis for project:', (projectData as any)?.id);
      const result = await analyzePlanMutation.mutateAsync({
        projectId: (projectData as any)?.id,
        // Don't pass planId to analyze all plans for the project
      });

      if (result?.rooms) {
        // Store surface loi Carrez from analysis
        if (result.surface_loi_carrez !== undefined) {
          setSurfaceLoiCarrez(result.surface_loi_carrez);
        }

        // Convert analysis result to Room format
        const rooms: Room[] = result.rooms.map((room: any) => ({
          id: room.id ? parseInt(room.id) : generateUniqueId(),
          name: room.name,
          surface: room.surface,
          roomType: room.roomType,
          exposition: undefined,
          options: room.options || {}
        }));

        // Calculate total surface from analyzed rooms
        const totalSurface = rooms.reduce((acc, room) => acc + room.surface, 0);

        // Update project data with analyzed rooms and calculated total surface
        setProjectData({
          ...projectData,
          pieces: rooms,
          surface_loi_carrez: totalSurface
        });

        setAnalysisComplete(true);
        console.log('[StepRooms] Analysis completed successfully with', rooms.length, 'rooms');
      } else {
        throw new Error('Aucune pièce détectée dans le plan');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError('Aucun plan détecté');
      hasStartedAnalysis.current = false; // Reset on error to allow retry
    } finally {
      setIsAnalyzing(false);
    }
  }, [(projectData as any)?.id, analyzePlanMutation, projectData, setProjectData]);

  // Force synchronization with backend data whenever projectRooms changes
  useEffect(() => {
    if (projectRooms !== undefined) {
      console.log('[StepRooms] Backend data loaded:', { 
        roomsCount: projectRooms?.rooms?.length || 0,
        surfaceLoiCarrez: projectRooms?.surfaceLoiCarrez || 0,
        projectRooms 
      });

      if (projectRooms && projectRooms.rooms.length > 0) {
        // Convert backend room format to frontend Room format
        const rooms: Room[] = projectRooms.rooms.map((room: any) => ({
          id: parseInt(room.id) || generateUniqueId(),
          name: room.name,
          surface: room.surface,
          roomType: room.options?.roomType,
          exposition: room.options?.exposition as Room['exposition'],
          options: room.options || {}
        }));

        console.log('[StepRooms] Updating local data with backend rooms:', rooms.length);
        
        // Calculate total surface from backend rooms (in case backend has older loi carrez data)
        const totalSurface = rooms.reduce((acc, room) => acc + room.surface, 0);
        
        // Always update local state with backend data (override any stale local data)
        setProjectData({
          ...projectData,
          pieces: rooms,
          surface_loi_carrez: totalSurface
        });
        
        setSurfaceLoiCarrez(projectRooms.surfaceLoiCarrez);
        setAnalysisComplete(true);
        hasInitializedFromBackend.current = true;
      } else {
        // Backend has no rooms (purged or never analyzed)
        console.log('[StepRooms] Backend has no rooms, resetting local state and analysis flags');
        
        setProjectData({
          ...projectData,
          pieces: [],
          surface_loi_carrez: undefined
        });
        
        // Reset analysis states when backend has no rooms (purged state)
        resetAnalysisStates();
        hasInitializedFromBackend.current = false;
      }
    }
  }, [projectRooms]); // Run whenever projectRooms changes

  useEffect(() => {
    // Auto-start analysis when component mounts and we have plan(s) but no pieces AND no saved rooms
    // Only trigger if projectRooms is loaded (either null or has empty rooms)
    const shouldTriggerAnalysis = hasUploadedPlan && 
        !isAnalyzing && 
        !analysisComplete && 
        !analysisError && 
        !hasStartedAnalysis.current && 
        (!projectData.pieces || projectData.pieces.length === 0) && 
        projectRooms !== undefined && // Make sure projectRooms is loaded
        (projectRooms === null || (projectRooms?.rooms?.length || 0) === 0); // Either no backend data or empty rooms
        
    console.log('Auto-analysis check:', { 
      hasUploadedPlan, 
      isAnalyzing, 
      analysisComplete, 
      analysisError, 
      hasStartedAnalysis: hasStartedAnalysis.current,
      projectDataPieces: projectData.pieces?.length || 0,
      projectRooms: projectRooms ? { roomsCount: projectRooms.rooms?.length || 0 } : 'null',
      shouldTriggerAnalysis,
      planFile,
      conditions: {
        'hasUploadedPlan': hasUploadedPlan,
        '!isAnalyzing': !isAnalyzing,
        '!analysisComplete': !analysisComplete,
        '!analysisError': !analysisError,
        '!hasStartedAnalysis': !hasStartedAnalysis.current,
        'noPieces': (!projectData.pieces || projectData.pieces.length === 0),
        'projectRoomsLoaded': projectRooms !== undefined,
        'emptyRooms': projectRooms === null || (projectRooms?.rooms?.length || 0) === 0
      }
    });
        
    if (shouldTriggerAnalysis) {
      console.log('Auto-triggering analysis:', { hasUploadedPlan, projectRooms, projectDataPieces: projectData.pieces });
      handleAnalyze();
    }
  }, [hasUploadedPlan, projectRooms, projectData.pieces, isAnalyzing, analysisComplete, analysisError]); // Added missing dependencies

  const handleAddRoom = () => {
    if (newRoom.name && newRoom.surface) {
      const newRoomData = {
        ...newRoom,
        id: generateUniqueId(),
        options: {},
      } as Room;

      const updatedRooms = [...(projectData.pieces || []), newRoomData];
      
      // Calculate new total surface
      const newTotalSurface = updatedRooms.reduce((acc, room) => acc + room.surface, 0);

      setProjectData({
        ...projectData,
        pieces: updatedRooms,
        surface_loi_carrez: newTotalSurface, // Use total surface as surface loi Carrez
      });
      
      setNewRoom({ name: '', surface: 0, exposition: undefined, roomType: undefined });

      // Auto-save the changes immediately (no debounce for add/remove) - pass the new total surface
      saveRoomsImmediate(updatedRooms, newTotalSurface);
    }
  };

  // Save rooms with optimistic updates and proper debouncing
  const saveRooms = useCallback((rooms: Room[], surfaceLoiCarrez?: number) => {
    if (!(projectData as any)?.id) return;

    // Convert frontend Room format to backend format
    const backendRooms = rooms.map((room) => ({
      id: room.id.toString(), // Convert number ID to string for backend
      name: room.name,
      surface: room.surface,
      options: {
        ...room.options,
        exposition: room.exposition,
        roomType: room.roomType
      }
    }));

    updateProjectRoomsMutation.debouncedMutate({
      projectId: (projectData as any).id,
      data: {
        rooms: backendRooms,
        surfaceLoiCarrez
      }
    });
  }, [(projectData as any)?.id, updateProjectRoomsMutation]);

  // Immediate save for actions that shouldn't be debounced (add/remove)
  const saveRoomsImmediate = useCallback((rooms: Room[], surfaceLoiCarrez?: number) => {
    if (!(projectData as any)?.id) return;

    // Convert frontend Room format to backend format
    const backendRooms = rooms.map((room) => ({
      id: room.id.toString(),
      name: room.name,
      surface: room.surface,
      options: {
        ...room.options,
        exposition: room.exposition,
        roomType: room.roomType
      }
    }));

    updateProjectRoomsMutation.mutate({
      projectId: (projectData as any).id,
      data: {
        rooms: backendRooms,
        surfaceLoiCarrez
      }
    });
  }, [(projectData as any)?.id, updateProjectRoomsMutation]);

  const handleUpdateRoom = (roomId: number, field: keyof Room, value: any, skipAutoSave: boolean = false) => {
    const updatedRooms = projectData.pieces?.map(room =>
      room.id === roomId ? { ...room, [field]: value } : room
    ) || [];

    // Calculate total surface for any updates
    const totalSurface = updatedRooms.reduce((acc, room) => acc + room.surface, 0);

    setProjectData({
      ...projectData,
      pieces: updatedRooms,
      surface_loi_carrez: totalSurface, // Use total surface as surface loi Carrez
    });

    // Only auto-save if not currently editing and not explicitly skipped
    if (!skipAutoSave && editingNameId !== roomId && editingSurfaceId !== roomId) {
      saveRooms(updatedRooms, totalSurface);
    }
  };

  const startEditingName = (room: Room) => {
    setEditingNameId(room.id);
    setEditingName(room.name);
  };

  const startEditingSurface = (room: Room) => {
    setEditingSurfaceId(room.id);
    setEditingSurface(room.surface);
  };

  const saveRoomName = () => {
    if (editingNameId) {
      // Update the room and auto-save immediately since editing is finished
      const updatedRooms = projectData.pieces?.map(room =>
        room.id === editingNameId ? { ...room, name: editingName } : room
      ) || [];

      // Calculate current total surface
      const currentTotalSurface = updatedRooms.reduce((acc, room) => acc + room.surface, 0);

      setProjectData({
        ...projectData,
        pieces: updatedRooms,
        surface_loi_carrez: currentTotalSurface, // Use total surface as surface loi Carrez
      });

      // Auto-save immediately since editing is finished - pass the current total surface
      saveRoomsImmediate(updatedRooms, currentTotalSurface);

      setEditingNameId(null);
      setEditingName('');
    }
  };

  const saveRoomSurface = () => {
    if (editingSurfaceId) {
      // Update the room and auto-save immediately since editing is finished
      const updatedRooms = projectData.pieces?.map(room =>
        room.id === editingSurfaceId ? { ...room, surface: editingSurface || 0 } : room
      ) || [];

      // Calculate new total surface
      const newTotalSurface = updatedRooms.reduce((acc, room) => acc + room.surface, 0);

      setProjectData({
        ...projectData,
        pieces: updatedRooms,
        surface_loi_carrez: newTotalSurface, // Use total surface as surface loi Carrez
      });

      // Auto-save immediately since editing is finished - pass the new total surface
      saveRoomsImmediate(updatedRooms, newTotalSurface);

      setEditingSurfaceId(null);
      setEditingSurface(null);
    }
  };

  const handleRemoveRoom = (roomId: number) => {
    const updatedRooms = projectData.pieces?.filter((room) => room.id !== roomId) || [];
    
    // Calculate new total surface
    const newTotalSurface = updatedRooms.reduce((acc, room) => acc + room.surface, 0);

    setProjectData({
      ...projectData,
      pieces: updatedRooms,
      surface_loi_carrez: newTotalSurface, // Use total surface as surface loi Carrez
    });

    // Auto-save the changes immediately (no debounce for add/remove) - pass the new total surface
    saveRoomsImmediate(updatedRooms, newTotalSurface);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left section - Plan image */}
        <div className="w-full lg:w-1/2">
          <PlanViewer
            planFiles={planFiles}
            title="Plans du projet"
            maxHeight="calc(100vh-300px)"
          />
          <div className="mt-4 space-y-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
              <p className="text-lg font-medium text-gray-900 flex items-center">
                Surface totale : {
                  projectData.pieces?.reduce((acc, room) => acc + room.surface, 0).toFixed(2) || '0.00'
                } m²
              </p>
              <div className="relative group">
                <div className="cursor-help">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  La surface totale correspond à la somme des surfaces de toutes les pièces que vous avez définies. 
                  Cette valeur se recalcule automatiquement lorsque vous modifiez la surface d'une pièce.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right section - Rooms list */}
        <div className="w-full lg:w-1/2">
          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Analyse en cours...</h4>
                  <p className="text-sm text-blue-700">
                    Notre IA analyse votre plan pour détecter les pièces et calculer leurs surfaces.
                  </p>
                </div>
              </div>
            </div>
          )}

          {analysisError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Erreur d'analyse</h4>
                  <p className="text-sm text-red-700">{analysisError}</p>
                  <button
                    onClick={() => {
                      setAnalysisError(null);
                      hasStartedAnalysis.current = false;
                      handleAnalyze();
                    }}
                    className="mt-2 text-sm text-red-800 underline hover:no-underline"
                  >
                    Réessayer l'analyse
                  </button>
                </div>
              </div>
            </div>
          )}

          {analysisComplete && !isAnalyzing && !analysisError && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">
                ✓ Analyse terminée ! {projectData.pieces?.length || 0} pièce(s) détectée(s). 
                Vous pouvez maintenant ajuster les informations de chaque pièce si nécessaire.
              </p>
            </div>
          )}

          {!isAnalyzing && !analysisError && !analysisComplete && (projectData.pieces?.length || 0) === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-700">
                  Aucune pièce détectée. Vous pouvez déclencher l'analyse automatique ou ajouter manuellement les pièces de votre projet ci-dessous.
                </p>
                {hasUploadedPlan && (
                  <button
                    onClick={() => {
                      hasStartedAnalysis.current = false;
                      handleAnalyze();
                    }}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Analyser le plan
                  </button>
                )}
              </div>
            </div>
          )}

          <h3 className="text-lg font-medium text-gray-900 mt-4">
            {(projectData.pieces?.length || 0) > 0 ? 'Pièces détectées' : 'Ajouter des pièces'}
          </h3>
          <div className={`space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
            {projectData.pieces?.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
              >
                <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
                  <div className="flex items-center space-x-2 min-w-0">
                    {editingNameId === room.id ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="block w-full rounded-md border-gray-300 px-2 py-1 text-sm"
                          onBlur={saveRoomName}
                          onKeyDown={(e) => e.key === 'Enter' && saveRoomName()}
                          autoFocus
                        />
                        <button
                          onClick={saveRoomName}
                          className="text-green-600 hover:text-green-700 flex-shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-gray-900 truncate">{room.name}</p>
                        <button
                          onClick={() => startEditingName(room)}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          disabled={isAnalyzing}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingSurfaceId === room.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editingSurface || ''}
                          onChange={(e) => setEditingSurface(Number(e.target.value))}
                          className="block w-24 rounded-md border-gray-300 px-2 py-1 text-sm"
                          onBlur={saveRoomSurface}
                          onKeyDown={(e) => e.key === 'Enter' && saveRoomSurface()}
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-gray-500">m²</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">{room.surface.toFixed(2)} m²</p>
                        <button
                          onClick={() => startEditingSurface(room)}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          disabled={isAnalyzing}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div>
                    {/* <select
                      value={room.exposition || ''}
                      onChange={(e) => handleUpdateRoom(room.id, 'exposition', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-ellipsis"
                      disabled={isAnalyzing}
                    >
                      <option value="">Sélectionner l'exposition</option>
                      <option value="Nord">Nord</option>
                      <option value="Sud">Sud</option>
                      <option value="Est">Est</option>
                      <option value="Ouest">Ouest</option>
                    </select> */}
                  </div>
                  <div>
                    <select
                      value={room.roomType || ''}
                      onChange={(e) => handleUpdateRoom(room.id, 'roomType', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-ellipsis"
                      disabled={isAnalyzing}
                    >
                      <option value="">Type de pièce</option>
                      {ROOM_TYPES.map((roomType) => (
                        <option key={roomType.type} value={roomType.type}>
                          {roomType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveRoom(room.id)}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  disabled={isAnalyzing}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-4 gap-4 pt-4 ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pièce
              </label>
              <input
                type="text"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ex: Chambre 1"
                disabled={isAnalyzing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface (m²)
              </label>
              <input
                type="number"
                value={newRoom.surface || ''}
                onChange={(e) => setNewRoom({ ...newRoom, surface: Number(e.target.value) })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                min="0"
                step="0.01"
                disabled={isAnalyzing}
              />
            </div>
            <div className="block text-sm font-medium text-gray-700 mb-1">
              {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                Exposition
              </label>
              <select
                value={newRoom.exposition || ''}
                onChange={(e) => setNewRoom({ ...newRoom, exposition: e.target.value as Room['exposition'] })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isAnalyzing}
              >
                <option value="">Sélectionner</option>
                <option value="Nord">Nord</option>
                <option value="Sud">Sud</option>
                <option value="Est">Est</option>
                <option value="Ouest">Ouest</option>
              </select> */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de pièce
              </label>
              <select
                value={newRoom.roomType || ''}
                onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isAnalyzing}
              >
                <option value="">Sélectionner le type</option>
                {ROOM_TYPES.map((roomType) => (
                  <option key={roomType.type} value={roomType.type}>
                    {roomType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end py-4">
            <button
              onClick={handleAddRoom}
              disabled={isAnalyzing || !newRoom.name || !newRoom.surface}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyse en cours...' : 'Ajouter une pièce'}</span>
            </button>
          </div>


        </div>
      </div>
    </>
  );
}