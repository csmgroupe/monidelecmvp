# Types de pièces - Conformes à l'ontologie NF C 15-100

Cette documentation définit les types de pièces utilisés dans l'application ABConcept, qui sont strictement conformes à l'ontologie NF C 15-100 pour la validation de conformité électrique.

## Types de pièces disponibles

### Espaces de vie
1. **Cuisine** (`Kitchen`)
   - Espace dédié à la préparation des repas
   - Nécessite des équipements électriques spécifiques (plaques, four, réfrigérateur, etc.)

2. **Salon/Séjour** (`LivingRoom`)
   - Espace principal de vie et de détente
   - Peut inclure éclairage, prises pour électroménager, télévision

3. **Salon/Séjour avec cuisine intégré** (`LivingRoomWithIntegratedKitchen`)
   - Espace de vie ouvert combinant salon et cuisine
   - Combine les besoins électriques des deux types d'espaces

### Espaces de circulation
4. **Circulation et locaux ≥ 4 m²** (`CirculationArea`)
   - Espaces de circulation et locaux annexes de surface supérieure ou égale à 4 m²
   - Inclut : couloirs, dégagements, celliers, buanderies, etc.
   - Nécessite un éclairage adapté et des prises selon la norme
   - Peut accueillir des circuits spécialisés 20A pour électroménager

### Espaces de service
5. **Salle d'eau** (`WetRoom`)
   - Espace d'hygiène sans WC
   - Contraintes électriques spécifiques liées à l'humidité

6. **WC** (`WC`)
   - Espace sanitaire dédié
   - Éclairage et ventilation requis

7. **Salle d'eau avec WC** (`BathroomWithWC`)
   - Espace d'hygiène complet
   - Combine les contraintes des deux types précédents



### Espaces de repos et travail
8. **Chambre** (`Bedroom`)
   - Espace de repos
   - Sleeping or office space (Chambre/Bureau)
   - Éclairage et prises pour usage résidentiel

### Autres espaces
9. **Autres (garage, dégagement < 4 m2, placard…)** (`Other`)
   - Espaces divers non classifiés
   - Inclut : garages, petits dégagements, placards, etc.
   - Besoins électriques variables selon l'usage

### Espaces extérieurs
10. **Extérieur (terrasse, patio…)** (`ExteriorSpace`)
    - Espaces extérieurs couverts ou non
    - Nécessite des équipements avec protection IP adaptée

## Correspondance avec la norme NF C 15-100

Ces types de pièces correspondent exactement aux classifications de la norme française NF C 15-100, qui définit les règles d'installation électrique dans les locaux d'habitation.

Chaque type de pièce a ses propres exigences en termes de :
- Nombre minimum de prises de courant
- Prises réseau/communication
- Points d'éclairage
- Commandes d'éclairage (interrupteurs)
- Protections spécifiques (IP, différentiels)

## Usage dans l'application

Ces types sont utilisés pour :
1. **Classification des pièces** lors de la saisie des projets
2. **Validation de conformité** électrique automatique
3. **Calcul automatique** des équipements nécessaires
4. **Génération des schémas** électriques conformes

⚠️ **Important** : Il est crucial d'utiliser exactement ces identifiants pour assurer la compatibilité avec le moteur de validation de conformité.

## Utilisation dans l'application

### Interface utilisateur
- Les labels français sont affichés dans l'interface utilisateur
- Les types anglais sont utilisés pour la communication avec l'API backend
- Les pièces sont organisées par catégories pour faciliter la sélection

### API Backend
- Les types anglais sont stockés dans la base de données
- Ils sont transmis au moteur de conformité pour validation
- Chaque type de pièce déclenche des règles de conformité spécifiques

### Moteur de conformité
- Utilise l'ontologie NF C 15-100 pour valider les installations électriques
- Chaque type de pièce a ses propres exigences en matière d'équipements électriques
- La validation se base sur ces types pour appliquer les bonnes règles

## Conformité NF C 15-100

Ces types de pièces sont spécifiquement alignés avec l'ontologie NF C 15-100, garantissant :
- Une validation de conformité précise
- L'application des bonnes règles électriques par type de local
- La compatibilité avec les référentiels normatifs français
- Une couverture complète des espaces résidentiels et professionnels

## Notes techniques

- Chaque pièce ne peut avoir qu'un seul type
- Le type peut être modifié à tout moment dans l'interface
- Les modifications sont automatiquement sauvegardées
- Le type de pièce influence directement les recommandations d'équipements électriques 