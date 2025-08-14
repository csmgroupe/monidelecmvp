# useEquipmentsMerger Hook

Ce hook centralise la logique de fusion et de déduplication des équipements pour éviter les race conditions et les doublons.

## Fonctionnalités principales

### 1. Déduplication automatique
- **Clé unique** : Combinaison de `roomId + category + type + name`
- **Stratégie pour les équipements de pièce** (`category: 'equipment'`) : Addition des quantités
- **Stratégie pour les équipements d'options** (`category: 'option'`) : Conservation du plus récent ou avec la plus grande quantité

### 2. Validation des données
- Détection des équipements sans `roomId` (pour category: 'equipment')
- Détection des quantités nulles ou négatives
- Détection des équipments sans nom
- Logs détaillés pour le debugging

### 3. Fusion sécurisée
- `mergeRoomEquipments()` : Fusionne les équipements de pièce avec les options existantes
- `mergeOptionEquipments()` : Fusionne les équipements d'options avec les équipements de pièce existants

## Utilisation

```typescript
import { useEquipmentsMerger } from './useEquipmentsMerger';

const { mergeRoomEquipments, mergeOptionEquipments, deduplicateEquipments } = useEquipmentsMerger();

// Dans StepEquipments
const allEquipments = mergeRoomEquipments(roomEquipments, existingBackendEquipments);

// Dans StepOptions
const allEquipments = mergeOptionEquipments(options, projectId, existingBackendEquipments);

// Déduplication manuelle si nécessaire
const cleanEquipments = deduplicateEquipments(potentiallyDuplicatedEquipments);
```

## Exemples de déduplication

### Équipements de pièce (addition des quantités)
```javascript
// Avant déduplication
[
  { roomId: '1', category: 'equipment', type: 'SimpleSocket', name: 'Prise simple', quantity: 2 },
  { roomId: '1', category: 'equipment', type: 'SimpleSocket', name: 'Prise simple', quantity: 3 }
]

// Après déduplication
[
  { roomId: '1', category: 'equipment', type: 'SimpleSocket', name: 'Prise simple', quantity: 5 }
]
```

### Équipements d'options (conservation du meilleur)
```javascript
// Avant déduplication
[
  { category: 'option', type: 'automation_system', name: 'Système Wiser', quantity: 1, id: null },
  { category: 'option', type: 'automation_system', name: 'Système Wiser', quantity: 1, id: 'abc123' }
]

// Après déduplication (garde celui avec ID)
[
  { category: 'option', type: 'automation_system', name: 'Système Wiser', quantity: 1, id: 'abc123' }
]
```

## Debug et monitoring

Le hook génère automatiquement des logs pour :
- Les doublons détectés
- Les fusions d'équipements
- Les validations de données
- Les statistiques de déduplication

Surveillez la console lors du développement pour identifier les problèmes potentiels. 