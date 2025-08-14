import { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import type { ProjectWithWizardData, QuoteItem, DimensioningQuoteItem } from './quote/types';
import { QuoteHeader } from './quote/QuoteHeader';
import { EquipmentByRoomTable } from './quote/EquipmentByRoomTable';
import { CustomItemsTable } from './quote/CustomItemsTable';
import { DimensioningSection } from './quote/DimensioningSection';
import { QuoteFooter } from './quote/QuoteFooter';
import { ConfirmRecalculateModal } from './quote/ConfirmRecalculateModal';

import { useQuoteAutosave } from '@/features/shared/hooks/quotes/useQuoteAutosave';
import {
  generateQuoteItems,
  generateDimensioningItems,
  createNewQuoteItem,
  calculateTotal,
  groupItemsByRoom,
  exportToCSV,
  updateDimensioningItemsWithDDR,
} from './quote/utils';

interface StepQuoteProps {
  onNext: () => void;
  onPrevious: () => void;
  projectData: ProjectWithWizardData;
  setProjectData: (data: ProjectWithWizardData) => void;
}

export interface StepQuoteRef {
  finishQuote: () => Promise<void>;
}

export const StepQuote = forwardRef<StepQuoteRef, StepQuoteProps>(
  ({ onNext, onPrevious, projectData, setProjectData }, ref) => {
  const rooms = projectData.pieces || projectData.rooms || [];
  const equipments = projectData.equipments || [];
  const dimensioning = projectData.dimensioning;

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [dimensioningItems, setDimensioningItems] = useState<DimensioningQuoteItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingDimensioningItem, setEditingDimensioningItem] = useState<string | null>(null);
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);

  // Utilisation de refs pour éviter la réinitialisation lors du remount
  const initializationRef = useRef<{
    hasInitialized: boolean;
    lastProjectId: string | null;
    lastQuoteId: string | null;
  }>({
    hasInitialized: false,
    lastProjectId: null,
    lastQuoteId: null,
  });

  // Hook pour la sauvegarde automatique avec debounce plus court
  const {
    currentQuote,
    saveQuoteDebounced,
    finishQuote,
    isSaving,
    cancelPendingSave,
    isLoadingQuotes,
  } = useQuoteAutosave({
    projectId: projectData.id || '',
    debounceDelay: 1000, // Réduit à 1 seconde pour une sauvegarde plus rapide
  });

  // Persistance de l'état local dans projectData pour éviter la perte lors de la navigation
  useEffect(() => {
    if (quoteItems.length > 0 || dimensioningItems.length > 0) {
      const updatedProjectData = {
        ...projectData,
        quoteItems,
        dimensioningItems,
        totalAmount: calculateTotal(quoteItems, dimensioningItems),
        lastQuoteUpdate: new Date().toISOString(),
      };
      
      // Éviter la boucle infinie en comparant les données
      const hasChanged = 
        JSON.stringify(projectData.quoteItems) !== JSON.stringify(quoteItems) ||
        JSON.stringify(projectData.dimensioningItems) !== JSON.stringify(dimensioningItems);
      
      if (hasChanged) {
        setProjectData(updatedProjectData);
      }
    }
  }, [quoteItems, dimensioningItems]);

  useEffect(() => {
    if (isLoadingQuotes) return;

    const currentProjectId = projectData.id || '';
    const currentQuoteId = currentQuote?.id || null;
    
    const hasProjectChanged = initializationRef.current.lastProjectId !== currentProjectId;
    const hasQuoteChanged = initializationRef.current.lastQuoteId !== currentQuoteId;
    
    if (projectData.quoteItems && projectData.dimensioningItems && 
        !hasProjectChanged && !hasQuoteChanged && 
        initializationRef.current.hasInitialized) {
      setQuoteItems(projectData.quoteItems);
      setDimensioningItems(projectData.dimensioningItems);
      return;
    }

    if (currentQuote && currentQuote.quoteItems && currentQuote.dimensioningItems) {
      // Vérifier si des DDR sont présents, sinon les générer automatiquement
      let updatedDimensioningItems = currentQuote.dimensioningItems;
      const hasDDR = updatedDimensioningItems.some((item: DimensioningQuoteItem) => item.type === 'differential_circuit_breaker');
      
      if (!hasDDR) {
        // Générer automatiquement les DDR si ils ne sont pas présents
        updatedDimensioningItems = updateDimensioningItemsWithDDR(updatedDimensioningItems);
        console.log('DDR générés automatiquement pour le devis existant');
      }
      
      setQuoteItems(currentQuote.quoteItems);
      setDimensioningItems(updatedDimensioningItems);
      initializationRef.current.hasInitialized = true;
      initializationRef.current.lastProjectId = currentProjectId;
      initializationRef.current.lastQuoteId = currentQuoteId;
      return;
    }

    if (projectData.quoteItems && projectData.dimensioningItems) {
      // Vérifier si des DDR sont présents, sinon les générer automatiquement
      let updatedDimensioningItems = projectData.dimensioningItems;
      const hasDDR = updatedDimensioningItems.some((item: DimensioningQuoteItem) => item.type === 'differential_circuit_breaker');
      
      if (!hasDDR) {
        // Générer automatiquement les DDR si ils ne sont pas présents
        updatedDimensioningItems = updateDimensioningItemsWithDDR(updatedDimensioningItems);
        console.log('DDR générés automatiquement pour les données du projet');
      }
      
      setQuoteItems(projectData.quoteItems);
      setDimensioningItems(updatedDimensioningItems);
      initializationRef.current.hasInitialized = true;
      initializationRef.current.lastProjectId = currentProjectId;
      initializationRef.current.lastQuoteId = currentQuoteId;
      return;
    }

    if (!initializationRef.current.hasInitialized && (rooms.length > 0 || equipments.length > 0 || dimensioning)) {
      const generatedItems = generateQuoteItems(rooms, equipments);
      let generatedDimensioningItems = generateDimensioningItems(dimensioning);
      
      // Les DDR sont maintenant générés automatiquement dans generateDimensioningItems
      // S'assurer qu'ils sont complets au premier chargement
      generatedDimensioningItems = updateDimensioningItemsWithDDR(generatedDimensioningItems);
      
      setQuoteItems(generatedItems);
      setDimensioningItems(generatedDimensioningItems);
      initializationRef.current.hasInitialized = true;
      initializationRef.current.lastProjectId = currentProjectId;
      initializationRef.current.lastQuoteId = currentQuoteId;
    }
  }, [currentQuote, isLoadingQuotes, rooms, equipments, dimensioning, projectData]);

  const addQuoteItem = (roomId?: string) => {
    const newItem = createNewQuoteItem();
    if (roomId) {
      newItem.roomId = roomId;
    }
    setQuoteItems([...quoteItems, newItem]);
    setEditingItem(newItem.id);
  };

  const updateQuoteItem = (id: string, updates: Partial<QuoteItem>) => {
    setQuoteItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteQuoteItem = (id: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
    setEditingItem(null);
  };

  const handleEditItem = (id: string) => {
    setEditingItem(id);
  };

  const handleSaveItem = () => {
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Gestion des éléments de dimensionnement
  const addDimensioningItem = (type: 'circuit_breaker' | 'electrical_panel' | 'cable' | 'surge_protector' | 'differential_circuit_breaker') => {
    const newId = `${type}-${Date.now()}`;
    let newItem: DimensioningQuoteItem;

    switch (type) {
      case 'circuit_breaker':
        newItem = {
          id: newId,
          type: 'circuit_breaker',
          intitule: 'Nouveau disjoncteur',
          reference_principal: 'SCHR9PFC616',
          prix: 8.50,
          quantity: 1,
          rating: 16,
        };
        break;
      case 'electrical_panel':
        newItem = {
          id: newId,
          type: 'electrical_panel',
          intitule: 'Nouveau tableau',
          reference_principal: 'SCHR9H18401',
          prix: 35.00,
          quantity: 1,
          modules: 18,
        };
        break;
      case 'cable':
        newItem = {
          id: newId,
          type: 'cable',
          intitule: 'Câble H07V-U 1.5mm²',
          reference_principal: 'ABER2V3G1.5',
          prix: 0.85,
          quantity: 10,
          section: 1.5,
          length_estimate: 10,
        };
        break;
      case 'surge_protector':
        newItem = {
          id: newId,
          type: 'surge_protector',
          intitule: 'Parafoudre Type 2',
          reference_principal: 'SCHR9PLC',
          prix: 120.00,
          quantity: 1,
          rating: '10kA',
          description: 'Protection contre les surtensions',
        };
        break;
      case 'differential_circuit_breaker':
        newItem = {
          id: newId,
          type: 'differential_circuit_breaker',
          intitule: 'DDR 25A',
          reference_principal: 'SCHR9PFE225',
          prix: 35.00,
          quantity: 1,
          rating: 25,
          description: 'Interrupteur différentiel 25A - Type A - 30mA'
        };
        break;
    }

    setDimensioningItems(prev => [...prev, newItem]);
    setEditingDimensioningItem(newId);
  };

  const updateDimensioningItem = (id: string, updates: Partial<DimensioningQuoteItem>) => {
    setDimensioningItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteDimensioningItem = (id: string) => {
    setDimensioningItems(prev => prev.filter(item => item.id !== id));
    setEditingDimensioningItem(null);
  };

  const handleEditDimensioningItem = (id: string) => {
    setEditingDimensioningItem(id);
  };

  const handleSaveDimensioningItem = () => {
    setEditingDimensioningItem(null);
  };

  const handleCancelDimensioningEdit = () => {
    setEditingDimensioningItem(null);
  };

  // Fonction pour actualiser les DDR
  const handleRecalculateDDR = () => {
    const updatedItems = updateDimensioningItemsWithDDR(dimensioningItems);
    setDimensioningItems(updatedItems);
    
    console.log('DDR actualisés avec succès');
  };

  // Fonction pour ouvrir la modale de recalcul
  const handleRecalculateQuote = () => {
    const hasCustomizations = quoteItems.length > 0 || dimensioningItems.length > 0;
    
    if (hasCustomizations) {
      setShowRecalculateModal(true);
    } else {
      // Si pas de personnalisations, recalculer directement
      performRecalculate();
    }
  };

  // Fonction qui effectue le recalcul
  const performRecalculate = () => {
    // Annuler les éditions en cours
    setEditingItem(null);
    setEditingDimensioningItem(null);
    
    const generatedItems = generateQuoteItems(rooms, equipments);
    let generatedDimensioningItems = generateDimensioningItems(dimensioning);
    
    // Les DDR sont maintenant générés automatiquement dans generateDimensioningItems
    // Mais s'assurer qu'ils sont bien à jour avec la logique de recalcul
    generatedDimensioningItems = updateDimensioningItemsWithDDR(generatedDimensioningItems);
    
    const newTotalAmount = calculateTotal(generatedItems, generatedDimensioningItems);
    
    setQuoteItems(generatedItems);
    setDimensioningItems(generatedDimensioningItems);
    
    const updatedProjectData = {
      ...projectData,
      quoteItems: generatedItems,
      dimensioningItems: generatedDimensioningItems,
      totalAmount: newTotalAmount,
      lastQuoteUpdate: new Date().toISOString(),
    };
    
    setProjectData(updatedProjectData);
    
    console.log('Estimations recalculées avec succès et projet mis à jour, DDR inclus');
  };

  // Calculs
  const totalAmount = useMemo(() => 
    calculateTotal(quoteItems, dimensioningItems),
    [quoteItems, dimensioningItems]
  );

  const itemsByRoom = useMemo(() => 
    groupItemsByRoom(quoteItems),
    [quoteItems]
  );

  const handleExportCSV = () => {
    exportToCSV(quoteItems, dimensioningItems, rooms);
  };

  // Sauvegarde automatique avec debounce quand les données changent
  useEffect(() => {
    if (quoteItems.length > 0 || dimensioningItems.length > 0) {
      const quoteData = {
        projectId: projectData.id || '',
        name: `Estimations ${projectData.name || 'Projet'}`,
        description: `Estimations générées automatiquement pour le projet ${projectData.name || 'Projet'}`,
        quoteItems,
        dimensioningItems,
        totalAmount,
        status: 'draft' as const,
      };
      
      saveQuoteDebounced(quoteData);
    }
  }, [quoteItems, dimensioningItems, totalAmount, projectData.id, projectData.name, saveQuoteDebounced]);

  const handleFinishQuote = async () => {
    if (quoteItems.length > 0 || dimensioningItems.length > 0) {
      const quoteData = {
        projectId: projectData.id || '',
        name: `Estimations ${projectData.name || 'Projet'}`,
        description: `Estimations généré automatiquement pour le projet ${projectData.name || 'Projet'}`,
        quoteItems,
        dimensioningItems,
        totalAmount,
        status: 'completed' as const,
      };
      
      // Annuler toute sauvegarde automatique en cours pour éviter les conflits
      cancelPendingSave();
      
      await finishQuote(quoteData);
    }
  };

  // Expose la fonction finishQuote via ref
  useImperativeHandle(ref, () => ({
    finishQuote: handleFinishQuote,
  }));

  // Afficher un loading pendant l'initialisation
  if (!initializationRef.current.hasInitialized || isLoadingQuotes) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Chargement des estimations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <QuoteHeader
        totalAmount={totalAmount}
        onAddItem={addQuoteItem}
        onExportCSV={handleExportCSV}
        onRecalculate={handleRecalculateQuote}
      />

      <EquipmentByRoomTable
        itemsByRoom={itemsByRoom}
        rooms={rooms}
        editingItem={editingItem}
        onEditItem={handleEditItem}
        onUpdateItem={updateQuoteItem}
        onDeleteItem={deleteQuoteItem}
        onSaveItem={handleSaveItem}
        onCancelEdit={handleCancelEdit}
        onAddItem={addQuoteItem}
      />

      <CustomItemsTable
        customItems={itemsByRoom.customItems}
        editingItem={editingItem}
        onEditItem={handleEditItem}
        onUpdateItem={updateQuoteItem}
        onDeleteItem={deleteQuoteItem}
        onSaveItem={handleSaveItem}
        onCancelEdit={handleCancelEdit}
      />

      <DimensioningSection
        dimensioningItems={dimensioningItems}
        editingDimensioningItem={editingDimensioningItem}
        onEditDimensioningItem={handleEditDimensioningItem}
        onUpdateDimensioningItem={updateDimensioningItem}
        onDeleteDimensioningItem={deleteDimensioningItem}
        onSaveDimensioningItem={handleSaveDimensioningItem}
        onCancelDimensioningEdit={handleCancelDimensioningEdit}
        onAddDimensioningItem={addDimensioningItem}
        onRecalculateDDR={handleRecalculateDDR}
      />

      <QuoteFooter 
        totalAmount={totalAmount} 
        isSaving={isSaving}
        showSaveStatus={true}
      />

      {/* Modale de confirmation pour le recalcul */}
      <ConfirmRecalculateModal
        isOpen={showRecalculateModal}
        onClose={() => setShowRecalculateModal(false)}
        onConfirm={performRecalculate}
      />
    </div>
  );
}
); 